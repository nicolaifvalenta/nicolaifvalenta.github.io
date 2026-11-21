// Saves the cover you pick for a book. Put the image's link in the book file:
//   cover: https://example.com/the-cover.jpg
// The script downloads it into src/img/covers/ once, so the site serves its own copy.
// Books with no `cover:` line show a plain typeset box instead. Nothing is looked up automatically.
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const BOOKS = "src/books";
const OUT = "src/img/covers";

export async function fetchCovers() {
  fs.mkdirSync(OUT, { recursive: true });
  for (const f of fs.readdirSync(BOOKS).filter((f) => f.endsWith(".md"))) {
    const slug = path.basename(f, ".md");
    const dest = path.join(OUT, slug + ".jpg");
    if (fs.existsSync(dest)) continue;
    const { data } = matter(fs.readFileSync(path.join(BOOKS, f), "utf8"));
    if (!/^https?:\/\//.test(data.cover || "")) continue;
    try {
      const r = await fetch(data.cover, {
        headers: { "User-Agent": "Mozilla/5.0 (personal site)" },
        signal: AbortSignal.timeout(20000),
      });
      const buf = r.ok ? Buffer.from(await r.arrayBuffer()) : null;
      if (buf && buf.length > 2000 && (r.headers.get("content-type") || "").startsWith("image/")) {
        fs.writeFileSync(dest, buf);
        console.log(`[covers] saved ${slug}`);
      } else console.log(`[covers] ${slug}: that link did not give an image`);
    } catch (e) { console.log(`[covers] ${slug}: ${e.message}`); }
  }
}

if (process.argv[1] && process.argv[1].endsWith("fetch-covers.mjs")) await fetchCovers();

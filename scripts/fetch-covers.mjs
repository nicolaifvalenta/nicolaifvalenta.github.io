// Saves a cover for each book or paper in src/books/, once, into src/img/covers/.
// In the book's file, give ONE of:
//   cover: https://example.com/the-cover.jpg     (an image you picked)
//   pdf:   https://example.com/the-paper.pdf     (a paper: its first page becomes the cover)
// With neither, the site shows a plain typeset box. Nothing is looked up automatically.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import matter from "gray-matter";

const BOOKS = "src/books";
const OUT = "src/img/covers";
const UA = { "User-Agent": "Mozilla/5.0 (personal site)" };
const isUrl = (u) => /^https?:\/\//.test(u || "");

async function download(url) {
  const r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw new Error(`${r.status} from that link`);
  return { buf: Buffer.from(await r.arrayBuffer()), type: r.headers.get("content-type") || "" };
}

function firstPage(pdfPath, dest) {
  try {                                    // poppler, if installed
    execFileSync("pdftoppm", ["-jpeg", "-r", "70", "-f", "1", "-l", "1", "-singlefile", pdfPath, dest.replace(/\.jpg$/, "")]);
    return true;
  } catch {}
  try {                                    // macOS
    execFileSync("sips", ["-s", "format", "jpeg", pdfPath, "--out", dest], { stdio: "ignore" });
    return fs.existsSync(dest);
  } catch {}
  return false;
}

export async function fetchCovers() {
  fs.mkdirSync(OUT, { recursive: true });
  for (const f of fs.readdirSync(BOOKS).filter((f) => f.endsWith(".md"))) {
    const slug = path.basename(f, ".md");
    const dest = path.join(OUT, slug + ".jpg");
    if (fs.existsSync(dest)) continue;
    const { data } = matter(fs.readFileSync(path.join(BOOKS, f), "utf8"));
    try {
      if (isUrl(data.cover)) {
        const { buf, type } = await download(data.cover);
        if (buf.length > 2000 && type.startsWith("image/")) { fs.writeFileSync(dest, buf); console.log(`[covers] saved ${slug}`); }
        else console.log(`[covers] ${slug}: that link did not give an image`);
      } else if (isUrl(data.pdf)) {
        const tmp = path.join(os.tmpdir(), `${slug}-${Date.now()}.pdf`);
        fs.writeFileSync(tmp, (await download(data.pdf)).buf);
        const ok = firstPage(tmp, dest);
        fs.rmSync(tmp, { force: true });
        console.log(ok ? `[covers] first page of ${slug}` : `[covers] ${slug}: could not render the PDF`);
      }
    } catch (e) { console.log(`[covers] ${slug}: ${e.message}`); }
  }
}

if (process.argv[1] && process.argv[1].endsWith("fetch-covers.mjs")) await fetchCovers();

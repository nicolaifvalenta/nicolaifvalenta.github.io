import markdownIt from "markdown-it";
import footnote from "markdown-it-footnote";
import texmath from "markdown-it-texmath";
import katex from "katex";
import anchor from "markdown-it-anchor";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";

const MONTHS = ["January","February","March","April","May","June","July",
  "August","September","October","November","December"];

export default function (eleventyConfig) {
  // Markdown: footnotes (rendered as sidenotes / hover notes by site.js) and
  // optional TeX between $ … $ (rendered at build time, no JS for readers).
  const md = markdownIt({ html: true, typographer: true })
    .use(footnote)
    .use(anchor, { slugify: (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") })
    .use(texmath, { engine: katex, delimiters: "dollars" });
  // "[1]" -> "1"
  md.renderer.rules.footnote_caption = (tokens, idx) => {
    const n = Number(tokens[idx].meta.id + 1).toString();
    return tokens[idx].meta.subId > 0 ? n + ":" + tokens[idx].meta.subId : n;
  };
  eleventyConfig.setLibrary("md", md);

  eleventyConfig.addPassthroughCopy({ "src/css": "css", "src/js": "js", "src/fonts": "fonts", "src/img": "img" });

  // "21 November 2026"
  eleventyConfig.addFilter("longDate", (d) => {
    const x = new Date(d);
    return `${x.getUTCDate()} ${MONTHS[x.getUTCMonth()]} ${x.getUTCFullYear()}`;
  });
  eleventyConfig.addFilter("rotate", (arr, n) => arr.slice(n).concat(arr.slice(0, n)));
  eleventyConfig.addFilter("head", (arr, n) => arr.slice(0, n));
  eleventyConfig.addFilter("isoDate", (d) => new Date(d).toISOString().slice(0, 10));

  eleventyConfig.addCollection("posts", (api) =>
    api.getFilteredByGlob("src/writing/*.md").sort((a, b) => b.date - a.date)
  );

  eleventyConfig.addPlugin(feedPlugin, {
    type: "atom",
    outputPath: "/feed.xml",
    collection: { name: "posts", limit: 30 },
    metadata: {
      language: "en",
      title: "Nicolai Valenta",
      subtitle: "Writing",
      base: "https://nicolaifvalenta.github.io/",
      author: { name: "Nicolai Valenta" },
    },
  });

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}

import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseHTML } from "linkedom";

const root = fileURLToPath(new URL("../dist/", import.meta.url));
const page = async (path) =>
  parseHTML(
    await readFile(
      path === "404" ? join(root, "404.html") : join(root, path, "index.html"),
      "utf8",
    ),
  ).document;
const links = (doc) =>
  [...doc.querySelectorAll("a[href]")].map((a) => a.getAttribute("href"));

test("home is the only article index with descending years and stable dated links", async () => {
  const doc = await page("");
  assert.equal(doc.documentElement.lang, "zh-CN");
  assert.equal(doc.querySelectorAll("h1").length, 1);
  assert.ok(doc.querySelector("main"));
  assert.ok(doc.querySelector('a[href="#main"]'));
  assert.deepEqual(
    [...doc.querySelectorAll("[data-year]")].map((e) =>
      e.getAttribute("data-year"),
    ),
    ["2026", "2025", "2024"],
  );
  assert.deepEqual(
    [...doc.querySelectorAll(".post-list a")].map((a) =>
      a.getAttribute("href"),
    ),
    [
      "/blog/a-good-default/",
      "/blog/reading-on-small-screens/",
      "/blog/markdown-field-guide/",
      "/blog/quiet-navigation/",
      "/blog/first-principles/",
      "/blog/keeping-notes/",
    ],
  );
  assert.ok(
    [...doc.querySelectorAll(".post-list time")].some(
      (time) => time.textContent.trim() === "06/14",
    ),
  );
  assert.ok(
    !links(doc).some(
      (href) => href === "/blog/" || href?.includes("private-draft"),
    ),
  );
});

test("article uses a noninteractive Blog crumb and ships rendered Markdown", async () => {
  const doc = await page("blog/markdown-field-guide");
  assert.equal(doc.querySelectorAll("h1").length, 1);
  assert.ok(doc.querySelector("h1").textContent.includes("Markdown"));
  assert.ok(doc.querySelector('nav[aria-label="面包屑"]'));
  assert.ok(
    [...doc.querySelectorAll('nav[aria-label="面包屑"] span')].some(
      (el) => el.textContent.trim() === "Blog",
    ),
  );
  assert.ok(!links(doc).includes("/blog/"));
  for (const selector of [
    ".prose h2",
    ".prose blockquote",
    ".prose pre code",
    ".prose table",
    '.prose input[type="checkbox"]',
    ".prose del",
    ".prose img",
  ]) {
    assert.ok(doc.querySelector(selector), `missing rendered ${selector}`);
  }
  const image = doc.querySelector(".prose img");
  assert.ok(image.getAttribute("alt"));
  await access(join(root, image.getAttribute("src").replace(/^\//, "")));
});

test("all public pages have native navigation and distinct metadata; drafts have no route", async () => {
  const paths = [
    "",
    "about",
    "projects",
    "404",
    "blog/markdown-field-guide",
    "blog/first-principles",
    "blog/a-good-default",
    "blog/reading-on-small-screens",
    "blog/quiet-navigation",
    "blog/keeping-notes",
  ];
  const titles = new Set();
  for (const path of paths) {
    const doc = await page(path);
    titles.add(doc.title);
    assert.ok(
      doc.querySelector('meta[name="description"]')?.getAttribute("content"),
    );
    assert.equal(doc.querySelectorAll("h1").length, 1);
    assert.ok(doc.querySelector("details > summary"));
    assert.deepEqual(
      [...doc.querySelectorAll("details a")].map((a) => a.textContent.trim()),
      ["Home", "Projects", "About"],
    );
    assert.ok(
      !doc.querySelector('link[rel="canonical"], meta[property="og:url"]'),
    );
  }
  assert.equal(titles.size, paths.length);
  assert.ok((await page("projects")).querySelector(".prose h2"));
  assert.ok((await page("about")).querySelector(".prose p"));
  assert.ok(links(await page("404")).includes("/"));
  await assert.rejects(access(join(root, "blog/private-draft/index.html")));
  await assert.rejects(access(join(root, "blog/index.html")));
});

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

test("home is the only index and its dated links reach the rendered articles", async () => {
  const doc = await page("");
  assert.equal(doc.documentElement.lang, "zh-CN");
  assert.equal(doc.querySelectorAll("h1").length, 1);
  assert.ok(doc.querySelector("main"));
  assert.ok(doc.querySelector('a[href="#main"]'));
  const items = [...doc.querySelectorAll(".post-list li")];
  assert.ok(items.length > 0, "the template ships readable sample articles");
  for (const item of items) {
    const anchor = item.querySelector("a");
    const href = anchor.getAttribute("href");
    assert.match(href, /^\/blog\/[a-z0-9-]+\/$/);
    const article = await page(href.slice(1));
    assert.equal(
      article.querySelector("h1").textContent.trim(),
      anchor.textContent.trim(),
    );
    const time = item.querySelector("time");
    assert.match(time.textContent.trim(), /^\d{2}\/\d{2}$/);
    assert.equal(
      article.querySelector("time").getAttribute("datetime"),
      time.getAttribute("datetime"),
    );
    assert.equal(
      time.getAttribute("datetime").slice(0, 4),
      item.closest("[data-year]").getAttribute("data-year"),
    );
  }
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
  const home = await page("");
  const articlePaths = [...home.querySelectorAll(".post-list a")].map((a) =>
    a.getAttribute("href").slice(1),
  );
  const paths = ["", "about", "projects", "404", ...articlePaths];
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
  const notFound = await page("404");
  assert.ok(links(notFound).includes("/"));
  assert.equal(
    notFound.querySelectorAll('a[href="/"][aria-current="page"]').length,
    0,
    "a missing page must not tell readers they are on Home",
  );
  await assert.rejects(access(join(root, "blog/private-draft/index.html")));
  await assert.rejects(access(join(root, "blog/index.html")));
});

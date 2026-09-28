import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile, writeFile, unlink } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { parseHTML } from "linkedom";

const root = fileURLToPath(new URL("../", import.meta.url));
const posts = join(root, "src/content/posts");
function build(siteUrl = "") {
  return spawnSync("node", ["node_modules/astro/astro.js", "build"], {
    cwd: root,
    env: { ...process.env, SITE_URL: siteUrl },
    encoding: "utf8",
  });
}

test("invalid calendar dates and unsafe slugs stop the build with a file clue", async () => {
  for (const [filename, content, clue] of [
    [
      "bad-date.md",
      "---\ntitle: Bad date\ndate: '2025-02-29'\n---\n\n## Sample\n",
      "bad-date",
    ],
    [
      "Bad-Name.md",
      "---\ntitle: Bad slug\ndate: '2025-02-28'\n---\n\n## Sample\n",
      "Bad-Name",
    ],
  ]) {
    const path = join(posts, filename);
    await writeFile(path, content);
    try {
      const result = build();
      assert.notEqual(result.status, 0, `${filename} unexpectedly built`);
      assert.match(result.stdout + result.stderr, new RegExp(clue, "i"));
    } finally {
      await unlink(path);
    }
  }
});

test("a missing relative image fails rather than shipping a broken article", async () => {
  const path = join(posts, "broken-image.md");
  await writeFile(
    path,
    "---\ntitle: Broken image\ndate: '2025-02-28'\n---\n\n![missing](../../assets/no-such-image.png)\n",
  );
  try {
    const result = build();
    assert.notEqual(result.status, 0);
    assert.match(result.stdout + result.stderr, /no-such-image|broken-image/i);
  } finally {
    await unlink(path);
  }
});

test("an actual configured HTTPS site emits a page-specific canonical", async () => {
  const result = build("https://blog.example.org/");
  assert.equal(result.status, 0, result.stdout + result.stderr);
  const doc = parseHTML(
    await readFile(
      join(root, "dist/blog/markdown-field-guide/index.html"),
      "utf8",
    ),
  ).document;
  assert.equal(
    doc.querySelector('link[rel="canonical"]')?.getAttribute("href"),
    "https://blog.example.org/blog/markdown-field-guide/",
  );
});

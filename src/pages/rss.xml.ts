import { getCollection, render } from "astro:content";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { site } from "../config";
import { selectPublished } from "../lib/publication.mjs";

const escapeXml = (value: string) =>
  value.replace(
    /[&<>"]/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]!,
  );

const absolute = (path: string, base: string) =>
  base ? new URL(path, base).href : path;

const absolutizeHtml = (html: string, base: string) =>
  base
    ? html.replace(/\b(href|src)="\//g, (_, attr) => `${attr}="${base}/`)
    : html;

export async function GET({ site: configured }: { site?: URL }) {
  const base = configured?.href ?? "";
  const posts = selectPublished(await getCollection("posts"));
  const container = await AstroContainer.create();
  const items = [];
  for (const post of posts) {
    const { Content } = await render(post);
    const html = absolutizeHtml(
      await container.renderToString(Content),
      base.replace(/\/$/, ""),
    );
    const path = `/blog/${post.id}/`;
    const link = absolute(path, base);
    const text = html
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    items.push(`    <item>
      <title>${escapeXml(post.data.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="${base ? "true" : "false"}">${escapeXml(link)}</guid>
      <pubDate>${new Date(`${post.data.date}T00:00:00.000Z`).toUTCString()}</pubDate>
      <description>${escapeXml(text.slice(0, 180))}</description>
      <content:encoded><![CDATA[${html.replaceAll("]]>", "]]]]><![CDATA[>")}]]></content:encoded>
    </item>`);
  }
  const self = absolute("/rss.xml", base);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(site.name)}</title>
    <description>${escapeXml(site.description)}</description>
    <link>${escapeXml(absolute("/", base))}</link>
    <atom:link xmlns:atom="http://www.w3.org/2005/Atom" href="${escapeXml(self)}" rel="self" type="application/rss+xml"/>
${items.join("\n")}
  </channel>
</rss>
`;
  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}

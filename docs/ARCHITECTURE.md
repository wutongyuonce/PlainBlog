# 当前架构

PlainBlog 是 Astro 静态站点；`astro.config.mjs` 固定静态输出、尾部斜线、Shiki 暗色主题、图片透传服务，以及可选 `SITE_URL`。没有客户端路由或 UI 框架。静态主机负责把未知路径以 404 状态返回 `dist/404.html`。

| 职责                                                           | 唯一 authority                               | 使用者                                                       |
| -------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------ |
| 站点信息与目录入口                                             | `src/config.ts`                              | 布局、面包屑、首页                                           |
| 内容形状与 frontmatter                                         | `src/content.config.ts` 的 Astro 集合 schema | Astro 构建；文件名交给 publication 校验                      |
| 日期日历语义、平面 slug、draft 排除、日期与 slug 排序、重复 ID | `src/lib/publication.mjs`                    | 内容 schema/loader、首页、文章 `getStaticPaths()`            |
| 文档 head 与页面外壳                                           | `src/layouts/Base.astro`                     | 全部路由                                                     |
| 面包屑与唯一站点目录                                           | `src/components/Breadcrumb.astro`            | Base；原生 details/summary 管开闭，脚本只处理外点、Esc、失焦 |
| 页面与正文排版                                                 | `src/styles/global.css`                      | 全站及文章、Projects、About 的 `.prose`                      |

首页 `src/pages/index.astro` 是唯一聚合页面；文章路由 `src/pages/blog/[slug].astro` 只用发布选择结果生成路径。Projects/About 引入 `src/content/pages/` 下的 Markdown 组件，而文章走 `src/content/posts/` 集合。HTML 的唯一 h1 由路由生成，Markdown 正文从 h2 开始。静态 404 来自 `src/pages/404.astro`。

## 验证边界

- `tests/publication.test.mjs`：公开 interface 的日期、slug、draft、未来日期、平局排序与重复路径。
- `tests/site.test.mjs`：读取 `dist/` 的真实 HTML，检查页面、链接、元信息、目录、Markdown、图片资源、草稿排除、无假 canonical。
- `tests/build-validation.test.mjs`：真实构建时非法日期/文件名/缺图失败，以及配置有效站点 URL 后的 canonical。
- `pnpm check` / `pnpm lint`：Astro 类型与诊断；`pnpm format`：Prettier；`pnpm build`：生产产物。
- 未包含浏览器自动化。浏览器检查需覆盖原生/无 JS 导航、Esc 与焦点、直接访问和后退，以及桌面和 320/390px 下长内容的局部滚动与参考密度。

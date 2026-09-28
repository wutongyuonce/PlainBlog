# PlainBlog

一个独立的极简静态 Astro 博客。仓库里的文字和图片均为原创演示素材，不代表维护者的实际经历。产品行为见 [规格](docs/SPEC.md)。

## 开始

需要 Node.js 22 和 pnpm 11。

```sh
pnpm install
pnpm dev
```

打开终端给出的本地地址。构建和检查：

```sh
pnpm check
pnpm format
pnpm lint
pnpm test
pnpm build
pnpm preview
```

`pnpm test` 会先构建无站点 URL 的 HTML，再用 Node 测试内容规则与实际产物；随后验证无效内容导致构建失败以及配置站点 URL 的 canonical，最后恢复无 URL 的构建。`pnpm format:write` 可格式化项目文件。`lint` 与 `check` 都运行 Astro 诊断，并非独立 ESLint 检查。

## 修改内容

- 编辑 `src/config.ts` 的站点名称、描述与三个导航项。新增独立页面时创建对应的 `src/pages/*.astro` 文件，再在配置的导航数组中加入入口；文章不需要加入目录。
- 在 `src/content/posts/` 新建单层、全小写 kebab-case 的 `.md` 文件，例如 `my-note.md`。Frontmatter 必须有非空 `title` 和引号包围的 `YYYY-MM-DD` 日期；正文从 `##` 开始。`draft: true` 会从首页和正文输出排除；未写 draft 默认为公开。未来日期不自动隐藏。
- 编辑 `src/content/pages/projects.md` 和 `about.md` 来维护独立页面，页面标题由对应 Astro 页面负责。
- 图片放在 `src/assets/`，从文章以相对路径引用，例如 `![说明](../../assets/reading-lines.svg)`。缺失的相对图片会让构建失败。代码围栏、表格和任务列表使用 Astro 的 Markdown 渲染。

## 部署

执行 `pnpm build`，把 `dist/` 原样发布到支持静态文件的站点根路径。生产域名确定后，在构建环境设置 `SITE_URL=https://your-domain.example/`（必须是绝对 HTTP(S) 地址），构建才会输出对应页面的 canonical；不设置时不输出 canonical。无需服务端、数据库或运行时环境变量。配置主机把未知路径映射至 `dist/404.html`，并返回 HTTP 404（具体操作依主机而异）；`/blog/` 没有汇总页面，也不会自动跳转。目录开关的原生功能不依赖 JavaScript。

本仓库不包含发布脚本、远端配置或外部字体；浏览器交互与视觉验收需另行执行。

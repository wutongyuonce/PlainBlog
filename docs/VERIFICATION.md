# 验收

仓库检查是 `pnpm check`、`pnpm format`、`pnpm lint`、`pnpm test` 和 `pnpm build`。`lint` 是 Astro 诊断别名。`pnpm test` 会构建并读取真实 HTML，不包含浏览器操作。

浏览器复验：

```sh
pnpm build
pnpm preview --host 127.0.0.1 --port 4323
```

检查首页、文章、Projects、About、目录键盘操作、浏览器返回，以及 320px 和 390px 下没有整页横向滚动。代码和表格应在自身区域滚动。`/blog/` 和不存在的文章应显示 404，草稿不应出现。

已在桌面 Chromium 和 macOS Safari 做过这些检查。尚未覆盖 iOS Safari、Firefox、读屏器、远端 CI 或生产域名。静态 404 的真实状态码取决于主机是否把未知路径映射到 `dist/404.html`。

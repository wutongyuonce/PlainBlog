# 验收记录

## 自动检查

执行 `pnpm check`、`pnpm format`、`pnpm lint`、`pnpm test`、`pnpm build`。lint 是 Astro 诊断别名，不是独立 ESLint。

首版运行通过：Astro 11 文件零 errors/warnings/hints；10 个 Node tests，无跳过；10 个静态页面（首页、Projects、About、6 篇正文和404）。第一轮修正的最终重跑正在进行，以最终记录替换本句后交付。

## 浏览器检查

使用 Ego Browser 的 Chromium 实际打开生产 `pnpm preview`，不是只查看源码。

已验证：

- Enter/Space 展开原生目录，Tab 可进入真实链接；Esc 关闭并还焦点。
- Projects、About 可导航；文章 Blog 标签不是链接。
- 禁用 JavaScript 后，通过原生鼠标输入展开目录并成功访问 Projects。没有使用 DOM 脚本模拟无 JS 行为。
- `/blog/` 与 `/blog/private-draft/` 返回 HTTP404，而不是生成汇总或暴露草稿。
- 320px 与390px 下 Home、Markdown 正文、Projects、About 无整页溢出；代码和表格分别局部滚动。
- 首版生产输出仅366字节的内联目录增强代码，没有 UI 框架 bundle、外部字体或第三方运行时请求。

视觉修正后需复验：实际段落色阶、长面包屑省略、移除根节点裁切后的横向布局、表格列对齐、截图。

## 复验方式

```sh
pnpm build
pnpm preview --host 127.0.0.1 --port 4323
```

打开首页与 `/blog/markdown-field-guide/`。依次测试点击目录、Esc、点击外部、Tab 离开目录、Projects/About、浏览器返回；禁用 JavaScript 后重新加载再打开目录。切换到320/390px，检查长 URL 换行、代码和表格在自身区域滚动、正文标题完整，且整个文档没有横向滚动。最后查看 `/blog/` 和不存在的文章。

## 范围与限制

未部署、未配置生产域名、未执行远端 CI；没有真实读屏器、iOS Safari 或 Firefox 实机测试。无性能压测或像素完全一致承诺。静态404的真实线上状态码需要主机配置。内容为演示素材，发布前应替换并设置 SITE_URL。

审查证据在 [reviews](reviews/round-1.md)，产品契约只由 [SPEC](SPEC.md) 定义。

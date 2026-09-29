# Review 1

基线 `15acc0a`，被审查实现 `e984770`。两个独立 Herdr pane 中的 `openai-codex/gpt-6-sol`、medium thinking；只读审查，未代替浏览器或运行测试。流程为 Matt Pocock engineering/code-review 的双轴审查。

## Standards

1. **Medium**：首页 h1 硬编码 PlainBlog，修改 site.name 只改变 document title。违反站点信息单一配置 authority。
2. **Medium**：未传 current/article 时推断当前为 Home，导致 404 的 Home 链接错误地带 aria-current=page。应以实际页面识别，不从缺省 props 推断。

无值得单独处理的启发式代码气味。

## Spec

1. **Medium — R10**：404 的两个 Home 链接误标当前页，向读者报告了错误位置。

无其他已确认的 SPEC finding。

## 修正与回归

- 首页渲染 site.name；面包屑使用 Astro.url.pathname 判断真实目录入口，404 有自己的静态路径标签。
- 修复前新增的真实产物断言失败：可见 h1 仍为 PlainBlog 而非 A renamed notebook；404 有两个错误 current Home 而非零。修复后重跑。
- 构建错误样本和站点改名实验移到临时项目副本，避免覆盖作者同名文件和干扰真实内容目录。删除为恢复副作用而做的额外末尾构建。
- 父级浏览器验收另发现正文默认色阶/列表间距比参考偏亮偏紧，已校正为参考实测值；长路径改为省略而非完全隐藏；移除根节点 overflow 裁切以真实检测窄屏溢出。Markdown 示例改为实际可见的长 URL，并演示列对齐。

第二轮将检查修正以及整个项目，不只验证被点名的位置。

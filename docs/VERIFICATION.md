# 验收记录

## 自动检查

最终运行 `pnpm check`、`pnpm format`、`pnpm lint`、`pnpm test`、`pnpm build` 全部通过。

- Astro：11 个被检查文件，0 errors / warnings / hints。
- Node：10 tests，全部通过，无跳过。
- 构建：10 个静态页面（首页、Projects、About、6 篇正文及404）。没有 Blog 汇总或草稿页面。
- lint 是 Astro 诊断别名，不声称做过独立 ESLint 检查。
- 两项审查 regression 在修复前确实失败：站点改名未到达可见 h1；404 两个 Home 错误标为当前页。修复后通过。
- 顺序测试做过消融：临时副本中故意反转产物的年份组，真实 HTML 回归在「年份必须降序」断言失败。副本清理后正常产物全部通过，未修改真实内容或正在预览的 dist。
- 保留内容 interface 与最终 HTML 两个互补 seam，不固定普通文章清单；失败构建样本位于临时项目，删除了用于恢复测试副作用的重复构建。

## 浏览器验收

使用 Ego Browser 的 Chromium 实际打开生产 `pnpm preview`，不是仅查看源码。已验证：

| 场景                              | 结果                                               |
| --------------------------------- | -------------------------------------------------- |
| Enter / Space 展开、Tab 访问目录  | 可操作；目录仅 Projects、About，Home 不重复        |
| Esc、外点、焦点移出               | 收起；Esc 后焦点回到 summary                       |
| Projects、About、文章、浏览器返回 | 正常真实导航；返回首页，不依赖客户端路由           |
| Blog 路径标签                     | 无链接或下拉；文章标题是当前页                     |
| 禁用 JavaScript 后重载            | 原生鼠标输入展开目录，成功访问 Projects            |
| `/blog/`、草稿、不存在路径        | 静态 preview 返回404，不暴露草稿或伪造汇总         |
| 320px / 390px：四类页面           | 整页无横向溢出；没有根元素 overflow 裁切来掩盖问题 |
| 320px 长路径                      | 当前文章标题单行省略，正文 h1 完整显示             |
| Markdown 代码 / 表格              | 自身局部横向滚动，正文长 URL 可换行                |
| 表格列对齐                        | 实测 left / center / right 正确                    |
| 图片与资源                        | 本地图片成功加载；无外部字体或第三方运行时请求     |

无 JS 验证使用浏览器原生 DOM/CDP 坐标输入，不是运行页面 JavaScript 来模拟关闭 JavaScript 后的行为。浏览器测试独立执行，不包含在 `pnpm test` 中。

### 视觉实测

1440px 桌面下：内容宽655.08px（65ch），顶部32px，左右至少16px，标题16/24、下间距12px；年份组间32px，列表行间距12px。列表字体基线导致实测行起点差约36.5px，参考为36px，没有声称像素级复刻。

正文16/28，颜色 `rgb(181,179,173)`；代码14/24.5，标题16px与600字重。面包屑没有背景框；只有展开目录有功能性浮层。

目录脚本仍为少量内联增强代码、无外部 script；前次测得的366字节属于修订前产物，不作为本次大小结论或永久性能预算。

### 截图

- [首页 · 桌面](previews/home-desktop.png)
- [正文 · 桌面](previews/article-desktop.png)
- [首页 · 手机](previews/home-mobile.png)
- [正文 · 手机](previews/article-mobile.png)

## Safari 反馈后的复验（桌面）

用户反馈：Ego Lite 点击菜单项正常，Safari 展开后点选不跳转；部分文章看起来横向移位。在 macOS Safari 实际复现：文章页展开站点目录后激活 Projects，原实现只关闭目录，仍留在文章。`focusout` 同步关闭目录可能抢先移除链接；改为只在 Tab 完成焦点移动后判断离开，仍保留外点和 Esc。重新构建并在同一 Safari 窗口激活 Projects 后成功导航。Safari 的远程自动化未开启，未修改用户全局 Safari 设置；这是原生 UI 的回归验收，而非自动化测试。仍未验证 iOS Safari。

Chromium 桌面1440px 下修复前长文章的主列左缘为384.96px，短文章为392.46px：内容均655.08px，差异来自长文章占用15px传统滚动条。设置稳定 scrollbar gutter 后，首页及长短文章主列左缘均为384.96px、宽655.08px。320/390px 下主列仍各为288/358px、左右16px，无整页横向溢出。Chromium 中再次验证目录链接跳转、Esc 关闭、Tab 离开关闭。没有将示例 Markdown 改成较窄的另一套文章样式。

## 复验方式

```sh
pnpm build
pnpm preview --host 127.0.0.1 --port 4323
```

打开首页与 `/blog/markdown-field-guide/`。依次测试点击目录、Esc、点击外部、Tab 离开目录、Projects/About、浏览器返回；禁用 JavaScript 后重新加载再打开目录。切换到320/390px，检查长 URL 换行、代码和表格在自身区域滚动、正文标题完整，且整个文档没有横向滚动。最后查看 `/blog/` 和不存在的文章。

## 范围与限制

未部署、未配置生产域名、未执行远端 CI；没有真实读屏器、iOS Safari 或 Firefox 实机测试。无性能压测或像素完全一致承诺。静态404的真实线上状态码需要主机配置。内容为演示素材，发布前应替换并设置 SITE_URL。

产品契约只由 [SPEC](SPEC.md) 定义；独立审查见 [第一轮](reviews/round-1.md) 和 [后续审查](reviews/round-2.md)。

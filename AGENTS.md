# Working agreement

先读 docs/SPEC.md（唯一产品契约），再读 CONTEXT.md 与 docs/ARCHITECTURE.md（存在时）。用户授权本轮采用推荐决策，不再逐项提问。

- 项目定位是极简静态博客；不要加入 SPEC 非目标。原生平台能力优先。
- 文档与代码在同一改动同步。SPEC 决定行为；ARCHITECTURE 只描述当前有效机制；review 历史单独保存。
- 每条业务规则只有一个 authority。页面调用它，不重新实现 draft/date/sort。
- PlainBlog 是独立项目，绝不修改相邻 YuBlog。只做本地 Git，不创建远端或部署。
- 系统字体、原生 HTML/CSS、小量渐进增强。不增加单次使用抽象、框架、构建插件或不必要依赖。
- 最小测试覆盖内容 interface 和真实构建 HTML。先观察失败，再实现。不能用代码字符串匹配代替行为测试。
- 完成前运行仓库定义的 check、format、test、build；保持检查命令准确，不报告未执行项为通过。
- 两轴 review：Standards（本文件 + 可维护性）与 Spec（docs/SPEC.md）。至少两轮，修复后重审。
- 只提交自己完成的改动，commit 描述行为而非审查轮次；不要吞掉失败或跳过检查。

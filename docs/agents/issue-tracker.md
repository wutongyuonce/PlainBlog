# 本地规格工作流

本项目尚未连接远端 issue tracker。用户要求本地新项目与文档单一权威，因此采用 docs/SPEC.md 作为本次工作项（ready-for-agent），不创建远端 issue。

/ spec 使用 engineering/to-spec；/grill-with-docs 结合 grilling 与 domain-modeling。用户已授权全部推荐决策，不重复采访或等待 seam 确认。

Review 固定基线为初始空仓库提交 `15acc0a1cb97f1d94f561d0536d790fc25146060`，命令为 `git diff 15acc0a...HEAD`。每轮先提交实现，再启动 Standards/Spec 独立审查。结果放在 docs/reviews/，不覆盖 SPEC。

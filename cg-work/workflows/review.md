---
required_skills:
  - framework:code-review
optional_skills:
  - framework:requesting-code-review
  - framework:receiving-code-review
  - framework:gstack-review
  - framework:qa-only
  - framework:verification-before-completion
  - framework:finishing-a-development-branch
conditional_skills:
  - framework:project-initialization
---

# 审查

用于独立审查任务：审查他人分支、变更或交付物。创建 `pending` 任务记录后，以项目规则、需求、实际差异和文档影响评估为审查基线。

`review` 阶段的统一收尾顺序（新鲜验证、测试处理、直接相关冗余清理、SQL 整合、文档同步、集成决策）以 [工作模型](../core/operating-model.md#review-阶段统一收尾) 为唯一来源，提交边界以 [命名与提交](../core/naming-and-submission.md#原项目提交口径) 为唯一来源，本文件不重复正文。本文件只补充按需加载：高风险 PR 用 `gstack-review`，需要独立 Web 用户路径验证时用 `qa-only`，准备决定如何集成时用 `finishing-a-development-branch`。

审查任务只有在收尾完成、文档结论、验证证据和集成决策都已记录，并获得用户接受后才能标记为 `done`。

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

创建 `pending` 任务记录后，以项目规则、需求、实际差异和文档影响评估为审查基线。`review` 阶段按 [工作模型的统一收尾顺序](../core/operating-model.md#review-阶段统一收尾) 完成新鲜验证、测试处理、直接相关冗余清理、SQL 整合、文档同步和集成决策，并在任务证据中记录结果。检查业务规则、用户流程、接口、数据模型和架构变更是否已同步到对应文档，或是否记录了无需更新的理由。高风险 PR 可加载 `gstack-review`；Web 用户路径需要独立验证时加载 `qa-only`；所有测试通过并准备决定如何集成时加载 `finishing-a-development-branch`。审查任务只有在上述收尾完成、文档结论、验证证据和集成决策都已记录，并获得用户接受后才能标记为 `done`。

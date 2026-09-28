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

创建 `pending` 任务记录后，以项目规则、需求、实际差异和文档影响评估为审查基线。检查业务规则、用户流程、接口、数据模型和架构变更是否已同步到对应文档，或是否记录了无需更新的理由。高风险 PR 可加载 `gstack-review`；Web 用户路径需要独立验证时加载 `qa-only`；所有测试通过并准备决定如何集成时加载 `finishing-a-development-branch`。审查任务只有在文档结论、验证证据和集成决策都已记录后才能标记为 `done`。

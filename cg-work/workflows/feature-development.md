---
required_skills:
  - framework:brainstorming
  - framework:writing-plans
  - framework:codebase-design
  - framework:test-driven-development
  - framework:code-review
  - framework:verification-before-completion
optional_skills:
  - framework:domain-modeling
  - framework:research
  - framework:prototype
  - framework:using-git-worktrees
  - framework:finishing-a-development-branch
conditional_skills:
  - framework:project-initialization
  - framework:large-task-decomposition
---

# 功能开发

读取项目上下文和 `requirements.inbox_path` 中的原始需求包；创建 `pending` 任务记录，澄清目标、范围和验收标准，并评估业务文档影响。一个原始需求包可关联多个任务，但任务产物不得写回需求箱；再完成设计、计划、实现、文档同步、验证和集成决策。若需求跨模块、跨会话、存在未决关键决策或无法作为一个独立验收任务交付，先切换至 [大任务拆分与关闭](large-task-decomposition.md)，不得直接并列创建无路线图的任务。若创建原型，任务记录须写入 `prototype_reference`；将原型作为正式设计输入，在进入 `review` 前按 `core/prototype-disposition.template.md` 记录采纳结论、实现映射、验证映射和未采纳项。完成实现后必须经过新鲜验证和审查，再进入统一收尾流程。

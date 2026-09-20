---
required_skills:
  - framework:verification-before-completion
optional_skills:
  - framework:research
  - framework:gstack-review
  - framework:finishing-a-development-branch
conditional_skills:
  - framework:systematic-debugging
  - framework:test-driven-development
  - framework:code-review
  - framework:project-initialization
---

# 缺陷修复

先按 [工作模型的低风险变更](../core/operating-model.md#低风险变更) 筛选：纯展示问题且不涉及行为时改用 `framework:low-risk-change`，不得创建需求箱或任务记录。其余缺陷创建 `pending` 任务记录后，再选择执行模式。

### 轻量缺陷

仅当根因已由错误信息或精确调用路径确认、修复仅恢复既有行为，且不涉及业务规则、接口、数据、权限或外部副作用时，才可声明 `execution_profile: lightweight`。轻量任务仍须将原始需求存入需求箱并保留 `task.yaml`，但不创建独立计划、审查、验证、学习或交接文件，也不得声明原型、路线图、父子任务或任务依赖。

在进入 `review` 或 `done` 前，任务内 `lightweight_evidence` 必须记录根因、影响范围、能覆盖原始症状的验证、自审结论和集成决定。任何条件不满足、无法得到针对性验证，或修复扩展到多个业务边界时，立即使用标准缺陷路径。

### 标准缺陷

标准缺陷加载 `framework:systematic-debugging`、`framework:test-driven-development` 和 `framework:code-review`：先复现并取得根因证据，再评估业务文档影响、编写回归测试、实施最小修复、同步文档（如有影响）、审查并验证。验证通过后进入统一收尾流程。

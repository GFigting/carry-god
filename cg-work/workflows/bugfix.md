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
  - framework:subagent-dispatch-timing
---

# 缺陷修复

先按 [工作模型的低风险变更](../core/operating-model.md#低风险变更) 筛选：纯展示问题且不涉及行为时改用 `framework:low-risk-change`，不得创建需求箱或任务记录。其余缺陷创建 `pending` 任务记录后，再选择执行模式。标准缺陷可显式声明 `delivery_path: standard`；省略该字段也按标准路径处理。

### 轻量缺陷

仅当根因已由错误信息或精确调用路径确认、修复仅恢复既有行为，且 [轻量执行决策清单](../core/operating-model.md#轻量执行决策清单) 五项全部为“否”时，才可声明 `delivery_path: lightweight`。轻量任务仍须保留 `task.yaml`，不创建独立计划、审查、验证、学习或交接文件，也不得声明原型、主从任务或任务依赖；需求来源按 [需求箱与需求引用](../core/operating-model.md#需求箱与需求引用) 执行。

在进入 `review` 或 `done` 前，任务内 `lightweight_evidence` 必须记录根因、影响范围、能覆盖原始症状的验证、自审结论和集成决定。任何条件不满足、无法得到针对性验证，或修复扩展到多个业务边界时，按 [交付路径升级](../core/operating-model.md#交付路径升级) 保留原 `task.yaml` 与历史，升级为标准执行并补建计划、审查和验证记录。

### 标准缺陷

标准缺陷按需加载 `framework:systematic-debugging`、`framework:test-driven-development` 和 `framework:code-review`（跨模块、高风险或用户要求审查时）：先复现并取得根因证据，再评估业务文档影响、按 [最小充分流程](../core/operating-model.md#最小充分流程) 的价值分层补回归测试（硬三类必写）、实施最小修复、同步文档（如有影响）、审查并验证。验证通过后进入 `review` 阶段的统一收尾流程；提交收尾的仓库边界以 [命名与提交](../core/naming-and-submission.md#原项目提交口径) 为唯一来源。
标准缺陷的「标准编码前置检查」按 [标准编码前置检查](README.md#标准编码前置检查) 执行。子任务与子智能体（含 Web 验收的 browser-use 派发）的时机与判据以 [`framework:subagent-dispatch-timing`](../skills/subagent-dispatch-timing/SKILL.md) 为唯一来源，轻量档默认不派发。

---
required_skills:
  - framework:wayfinder
  - framework:to-tickets
optional_skills:
  - framework:domain-modeling
  - framework:codebase-design
  - framework:research
  - framework:prototype
conditional_skills:
  - framework:writing-plans
  - framework:parent-child-decomposition
---

# 大任务拆分与关闭

适用于跨模块、跨会话、范围或依赖尚不明确，或无法作为一个独立验收任务交付的需求。推进顺序：

1. **决策分级**：关键决策已清楚的直接写入决策记录；模糊的先经 `framework:wayfinder` 处理，不能把决策票据误写成研发任务。分级规则见 [大任务主从拆分](../core/operating-model.md#大任务主从拆分)。
2. **创建主任务**：声明 `role: parent`，`task.yaml` 以 `decisions` 保存已确认决策，`plan.md` 按 [主任务计划模板](../core/templates/parent-plan.template.md) 写需求覆盖与拆分、排除范围、依赖关系、遗留与后续。
3. **生成子任务**：用 `framework:to-tickets` 将已决策范围转为可独立验收的研发任务，每个子任务以 `parent_reference` 挂靠主任务，继续按 `feature-development`、`bugfix` 或 `refactor` 工作流推进，不改变既有状态机。
4. **推进与关闭**：主任务维护 `next_action`，可继续时指明下一项由 Agent 推进的子任务，不能推进时请求用户决定；全部子任务终态并完成集成核对后主任务进入验收关闭，关闭只在主任务审查记录留存结论，不迁移或删除子任务证据。

存量 `roadmaps/` 三件套（lasen、job-hunt、cg-work 项目）双轨保留可继续读写，不再新建，迁移按项目另立任务进行。

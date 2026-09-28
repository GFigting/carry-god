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
  - framework:large-task-decomposition
---

# 大任务拆分与关闭

适用于跨模块、跨会话、范围或依赖尚不明确，或无法作为一个独立验收任务交付的需求。先确认长期目标与边界；再通过 `framework:wayfinder` 处理未知决策，不能把决策票据误写成研发任务。

决策路线明确后，加载 `framework:large-task-decomposition`，在项目本地工作区创建路线图目录与覆盖记录；再用 `framework:to-tickets` 将已决策范围转为可独立验收的研发任务。每个研发任务继续按 `feature-development`、`bugfix` 或 `refactor` 工作流推进，不改变既有状态机。

路线图的关闭不移动、不删除已完成任务。所有子任务和证据保留在原目录；路线图只以 `closure.md` 形成覆盖、依赖、遗留项和后续工作的可追溯索引。每次选择或处理前沿任务后，更新路线图的 `next_user_action`：没有可执行任务、需要用户决策或等待验收时必须明确提醒用户；可继续推进时明确下一项由 Agent 处理的任务。

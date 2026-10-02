# 任务记录结构优化

## 原始需求

优化 `task.yaml` 结构，使任务可以结构化记录验收摘要和阻塞决策，同时保持历史任务兼容。

## 范围

- 新增可选 `acceptance_summary`：任务级验收摘要。
- 新增可选 `open_decisions`：待决策事项，支持 `id`、`question`、`blocking`。
- 校验器对这两个字段做结构校验，但不要求历史任务迁移。
- 更新框架说明与脚本文档。

## 非目标

- 不改变任务状态机。
- 不改写 `status_history` 旧格式。
- 不强制所有历史任务补充新字段。
- 不改变 `next_action` 与 `next_user_action` 的既有兼容行为。

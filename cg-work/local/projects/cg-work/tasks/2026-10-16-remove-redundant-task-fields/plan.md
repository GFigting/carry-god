# 实施方案：删除 task.yaml 冗余字段

## 背景

对 48 个可解析活跃任务（排除 archive）统计字段使用率后，5 个字段零使用或仅 1 次，且职责已被其他字段覆盖。

## 字段映射

| 删除字段 | 使用 | 承接方 |
|---|---|---|
| `open_decisions` | 0 | `decisions`（已确认）+ `next_action`（阻塞动作） |
| `parent_task_reference` | 0 | `depends_on` |
| `requirements_coverage` | 0 | `requirements_reference` + `acceptance_summary` + roadmap `coverage.md` |
| `learning_protocol` | 0 | `artifacts.learning` 存在即启用 |
| `scope_decision.prior_task_reference` | 1 | `depends_on` |

## 执行顺序

1. `check-task.mjs`：allowlist 移除 4 个顶层键；删除 `validateOpenDecisions`、`requirements_coverage` 校验、`parent_task_reference` 校验与 lightweight 禁用项、`learning_protocol` 门禁、`prior_task_reference` 校验；新增 `scope_decision` 内部 allowlist（`mode`/`rationale`）
2. 数据：`2026-10-07-archive-storage-audit` 的 `prior_task_reference` 改写为 `depends_on`（前序任务仍在原位）
3. 测试：删除/改写旧字段用例，新增"拒绝已删除的冗余字段"用例
4. 文档：operating-model、continuous-learning、workflows/scripts/local README、large-task-decomposition 技能同步
5. `npm run check` + `npm test` 兜底

## standards_preflight

- 项目自动检查：`npm run check`（框架结构、链接锚点、cg-work 受管任务）
- 当前差异人工检查：删除的 5 个字段在活跃任务中零使用；唯一 1 处 `prior_task_reference` 已等价迁移
- 不适用项：业务仓库提交检查（本任务不触碰业务仓库）

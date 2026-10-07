# 计划审核简化实施计划

## 目标

在不新增任务产物和状态门禁的前提下，明确计划审核记录位置及其与实现审查、验证证据的边界。

## 变更范围

- 更新 `workflows/feature-development.md`，说明复杂或用户明确要求的任务需在 `plan.md` 中完成计划审核。
- 更新 `core/operating-model.md`，定义三类记录的职责边界。
- 更新 `README.md`，补充任务产物说明。
- 为 `plan.md` 提供可复用的计划审核章节示例。

## 计划审核

- [ ] 需求覆盖、范围、依赖、步骤和验收标准已检查。
- [ ] 未新增 `plan-review.md`、状态或校验门禁。
- [ ] 实现审查与验证证据边界保持清晰。

## 验证

- `node scripts/check-task.mjs local/projects/cg-work/tasks/2026-09-23-plan-review-simplification/task.yaml`
- `npm test`
- `node scripts/check-all.mjs`

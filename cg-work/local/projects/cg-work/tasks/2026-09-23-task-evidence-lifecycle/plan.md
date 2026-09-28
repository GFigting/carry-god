# 任务证据生命周期实施计划

## 目标

把任务文件的生成时机、职责和状态门禁写成单一、可查阅的规则。

## 范围

### 包含

- 需求包和 `task.yaml` 的创建时机。
- `plan.md`、`review.md`、`verification.md`、`learning.md`、`handoff.md` 的阶段职责。
- 轻量缺陷和低风险变更的例外边界。

### 不包含

- 新增任务状态或修改历史任务。
- 业务周报的内容归纳规则。

## 验收

- [ ] `operating-model.md` 说明状态与证据的对应关系。
- [ ] `context-loading.md` 说明需求包复用与文件逐步生成。
- [ ] `README.md` 能让新使用者找到该生命周期规则。

## standards_preflight

- 无新增业务字面量；仅补充框架术语和阶段说明。

## 验证

- `npm test`
- `node scripts/check-task.mjs local/projects/cg-work/tasks/2026-09-23-task-evidence-lifecycle/task.yaml`
- `git diff --check`

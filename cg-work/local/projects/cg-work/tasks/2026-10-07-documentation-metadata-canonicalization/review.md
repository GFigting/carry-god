# 实施审查

## standards_preflight

- 已核对 `AGENTS.md`、`README.md`、`core/framework-maintenance.md` 和 `core/operating-model.md`；变更仅涉及框架脚本、规则文档、测试和任务证据。
- 规范字段与历史别名边界明确；同一语义同时填写两套字段时拒绝，历史任务仍可读取。
- 迁移默认 dry-run，且显式跳过 `archived: true` 任务，不扩大到业务项目。

## 审查结论

实现符合已确认方案。`documentation.files`/`reason` 已成为规范写法，历史别名保持兼容；迁移工具具备显式 `--apply` 门槛，已归档任务不会被迁移或再次进入生命周期处理。

## 遗留项

后续如需移除历史别名，应另立任务并提供业务项目迁移窗口；本任务不删除历史证据。

# 实施计划

## 目标

删除不再承载现行规则或模板内容的四个废弃文件，并简化相关入口说明。

## 范围

更新 `core/framework-maintenance.md`、`core/README.md`、`core/operating-model.md`、`core/decomposition.template.md` 和 `VERSION`，删除四个废弃文件。不改写已完成任务记录。

## 证据与兼容性

- 问题事实：四个文件已无现行内容或运行时消费者，只剩历史任务记录提及。
- 唯一来源：原型章节由 `core/operating-model.md` 定义，拆分索引格式由 `core/decomposition.template.md` 定义，目录索引由 `core/README.md` 提供。
- 兼容性：历史记录保留原样；校验器不要求 `documentation.files` 中的历史路径继续存在。
- 验证：任务记录校验、`npm run check` 和差异检查。

## 验证结果

- `node scripts/check-task.mjs local/projects/cg-work/tasks/2026-10-10-deprecated-template-retention/task.yaml`：通过。
- `npm run check`：通过。
- 现行 `core/`、`README.md`、`workflows/`、`skills/` 和 `scripts/` 中不再引用已删除的模板路径。
- 历史任务和需求包中的文字引用保留，任务校验不要求 `documentation.files` 中的路径存在。

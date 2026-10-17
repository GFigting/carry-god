# 验证记录

## 命令与结果

| 命令 | 结果 |
|---|---|
| `node scripts/check-task.mjs <本任务 task.yaml>` | 通过 |
| `npm run check` | `cg-work checks passed` |
| `npm test` | pass 88 / fail 2 |

## 失败项定性

2 个失败均为 `check-project.test.mjs` 的存量绝对路径断言（`接受登记项目仓库内原型路径和入口`、`接受相对 project.root_path 的项目路径`），与本任务变更无关。

## 针对性证据

- `拒绝已删除的冗余字段` 用例：4 个顶层删除字段出现时逐个断言 `未知字段：<key>`
- `声明的学习记录缺失时被拒绝`：验证 `artifacts.learning` 门禁在协议字段删除后仍然生效
- `拒绝在轻量缺陷中声明学习记录`：验证轻量档禁用学习记录的门禁仍然生效
- 全局 grep：`learning_protocol`/`open_decisions`/`parent_task_reference`/`requirements_coverage`/`prior_task_reference` 在 scripts/、core/、workflows/、skills/、test/ 中零残留（仅测试的"拒绝用例"和 scripts README 的"已删除字段"说明中出现，属预期）

## standards_preflight

- 项目自动检查：`npm run check` 全绿；`npm test` 88/2（2 个存量失败见上）
- 当前差异人工检查：5 个删除字段的活跃任务使用数为 0（`prior_task_reference` 1 处已迁移）；文档 6 处表述已同步
- 不适用项：browser 验收（无 UI 变更）、业务仓库提交（未触碰）

# 验证记录

## standards_preflight

- 规范来源：`AGENTS.md`、`README.md`、`core/framework-maintenance.md`、`core/operating-model.md`。
- 当前差异人工检查：仅修改归档脚本、队列/检查分支、规则文档、测试、版本和本任务记录；未修改项目业务代码或外部系统。
- 不适用项：前端 lint、业务项目构建和生产环境验证不适用。

## 命令结果

| 命令 | 结果 |
|---|---|
| `npm test` | 78 通过 / 0 失败 |
| `npm run check` | `cg-work checks passed` |
| `node scripts/check-skills.mjs` | `skill mirrors match sources` |
| `node scripts/archive-tasks.mjs --before 2026-10-07 --status review` | 预览 0 条，未写入文件 |
| `npm run queue` | 仅列出 6 条未归档待用户动作，已归档任务未出现 |
| 本任务校验 | `task checks passed` |

## 归档脚本行为

- dry-run 不写入任务文件。
- `--apply` 写入 `archived`、`archived_at`、`archive_reason`，保留原 `status`。
- `--before` 按任务 ID 日期排除当天任务。
- `--ids` 可精确补写指定任务，避免扩大归档范围。

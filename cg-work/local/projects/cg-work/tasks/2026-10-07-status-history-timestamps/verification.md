# 验证记录

## standards_preflight

- 已读取 `AGENTS.md`、`README.md`、`core/framework-maintenance.md` 和 `core/operating-model.md`。
- 当前差异未触及业务项目、外部系统或生产数据；已归档任务不参与迁移和生命周期校验。

## 命令结果

| 命令 | 结果 |
|---|---|
| `npm test` | 83 通过 / 0 失败 |
| `npm run check` | `cg-work checks passed` |
| `node scripts/check-skills.mjs` | `skill mirrors match sources` |
| `node scripts/migrate-task-metadata.mjs --status-history --project cg-work` | 预览 0 条，未写入文件 |

## 行为核对

- 验收队列生成的 `done` 历史项包含 `status`、`at` 和 `reason`。
- 历史字符串数组保持可读，迁移不会猜测时间或原因。
- `archived: true` 任务跳过迁移与常规生命周期校验。

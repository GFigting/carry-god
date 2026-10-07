# 验证记录

## standards_preflight

- 已读取框架入口、维护规则和任务生命周期规则；未涉及业务代码、外部系统或生产环境。
- 已确认归档任务不参与迁移 dry-run，也不因字段缺失触发生命周期校验。

## 命令结果

| 命令 | 结果 |
|---|---|
| `npm test` | 83 通过 / 0 失败 |
| `npm run check` | `cg-work checks passed` |
| `node scripts/check-skills.mjs` | `skill mirrors match sources` |
| `node scripts/migrate-task-metadata.mjs --documentation --project cg-work` | 预览 0 条，未写入文件 |

## 迁移边界

- dry-run 默认不写入文件。
- `--apply` 才允许写入，且仅处理指定项目中未归档任务。
- 已归档任务保留原状态和证据，不再处理。

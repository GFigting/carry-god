# 验证记录

## standards_preflight

- 已读取 `AGENTS.md`、`README.md`、`core/framework-maintenance.md` 和 `core/operating-model.md`。
- 本次仅涉及框架归档脚本、任务/需求箱布局、文档和测试；不涉及业务代码、外部系统或生产环境。

## 命令结果

| 命令 | 结果 |
|---|---|
| `node --test test/archive-tasks.test.mjs` | 5 通过 / 0 失败 |
| `npm test` | 89 通过 / 0 失败 |
| `npm run check` | `cg-work checks passed` |
| `node scripts/check-skills.mjs` | `skill mirrors match sources` |
| 历史归档迁移 | 26 个任务已移入 `tasks/archive` |
| 需求包迁移 | 仅独占需求包移入 `requirements-inbox/archive`；共享需求包保留 |

## 归档边界

- 已归档内容不再进入常规生命周期校验、验收队列或元数据迁移。
- 未归档任务和共享需求包未被移动。

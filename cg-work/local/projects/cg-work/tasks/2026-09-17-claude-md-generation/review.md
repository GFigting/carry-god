# 审查：生成 CLAUDE.md

## 结论

通过（待用户验收）。按用户意见收敛为**薄指针方案**：`CLAUDE.md` 不复制任何规则，只路由到 `AGENTS.md` / `README.md` / `core/`，从根源上避免两份指令口径漂移。

## 变更清单与唯一来源核对

| 变更 | 唯一来源 | 说明 |
|---|---|---|
| 新增根目录 `CLAUDE.md`（薄指针，仅路由） | `CLAUDE.md` | 指向 `AGENTS.md` 为主入口 |
| 固定文件名白名单加入 `CLAUDE.md` | `scripts/check-all.mjs` | `isKebab` 正则加入 `CLAUDE`，保留 `VERSION` |
| 命名约定登记 `CLAUDE.md` 及其"只路由不复制"定位 | `core/naming-and-submission.md` | core 定义不变量，与校验器同步 |

## 基线自查

- 链接有效性：`CLAUDE.md` 内相对链接均指向存在文件（`check-all.mjs` 的 Markdown 链接检查覆盖）。
- 一致性：`core/`（命名约定）、`scripts/`（校验器）、根目录入口三者口径一致。
- 非目标遵守：未改 `AGENTS.md`、`README.md`、工作流与技能。

## 遗留

- `check-all.mjs` 对 `.workbuddy/`、`designs/` 的既有告警与本任务无关，历史存在，不在本次处理。

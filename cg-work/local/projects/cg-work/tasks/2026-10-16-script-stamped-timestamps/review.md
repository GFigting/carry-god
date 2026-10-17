# 审查：任务时间字段脚本化

## 结论

**通过**。任务时间字段从手工填写改为脚本盖章，占位时间已按规则清理。

## 变更清单

| 文件 | 变更 |
|---|---|
| `scripts/task-stamp.mjs` | 新增：`create` / `transition` / `fix-placeholders` 三个子命令，时间统一走 `local-time.mjs` 的 `formatLocalIso` |
| `scripts/README.md` | 登记 task-stamp 用法与占位处理规则 |
| `core/operating-model.md` | 状态历史格式段明确 `at` 必须由脚本写入、占位置 `null` |
| `package.json` | 新增 `npm run task-stamp` 入口 |
| 10 个任务的 `task.yaml` | 14 条 `T00:00:00` 占位置 `null`（用户已确认方案） |

## 审查要点

- 时间格式 `YYYY-MM-DDTHH:mm:ss` 无时区后缀，复用既有 `formatLocalIso`，与验收/归档脚本口径一致；
- `fix-placeholders` 只认严格 `T00:00:00` 原文，不误伤 `null`、真实时刻和已归档任务；
- 识别逻辑以原始文本为基准，规避 js-yaml 的 Date 解析差异；
- 规则文档与脚本同步更新，README 双处（框架 README 无需改：脚本说明以 `scripts/README.md` 为源）。

## 遗留

- 后续任务创建/流转须走 `npm run task-stamp`，靠规则文档与本文档示例约束（无强制校验器，框架已移除任务字段脚本校验）。

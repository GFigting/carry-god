# 计划：任务时间字段改为脚本写入

## 背景

`task.yaml` 的 `created_at` 和 `status_history[].at` 此前由 Agent 手工填写，导致：
- 时分秒缺失或为 `T00:00:00` 占位（如 2026-10-16 多个任务的三条状态历史全是零点）；
- 校验器（scripts/README.md 已移除任务字段脚本校验）不拦截占位值；
- 只有 `acceptance-queue.mjs`（`accepted_at` 隐式）和 `archive-tasks.mjs`（`archived_at`）通过 `formatLocalIso(new Date())` 自动生成真实时间。

## 方案

新增 `scripts/task-stamp.mjs`，时间一律由脚本盖当前墙钟（复用 `scripts/local-time.mjs` 的 `formatLocalIso`，格式 `YYYY-MM-DDTHH:mm:ss` 无时区后缀）：

| 子命令 | 职责 |
|---|---|
| `create` | 生成任务骨架，`created_at` 与首条 `status_history` 由脚本写入真实时间 |
| `transition` | 更新顶层 `status`、追加 `status_history` 条目（`at` 盖当前时间），可同步 `next_action` |
| `fix-placeholders` | 扫描活跃任务中严格 `T00:00:00` 的 `status_history.at`，预览；`--apply true` 置为 `null` |

### 占位时间处理决策

- `T00:00:00` 是无法还原的占位，按 [operating-model.md 状态历史格式](../../../../../core/operating-model.md) "无法恢复的时间使用 `null`，不得用文件修改时间猜测" 置为 `null`；
- 不编造"当前时间"覆盖历史记录（会篡改事实）；
- 已归档任务不动；
- `created_at` 纯日期（`2026-10-16`）保留原样——它语义是创建日，日期部分正确。

### 规则同步

- `scripts/README.md`：登记 task-stamp 用法；
- `core/operating-model.md` 状态历史格式段：明确 `at` 必须由脚本写入，手工占位不接受。

## 测试用例

| 编号 | 场景 | 预期 |
|---|---|---|
| TS-01 | `create` 新任务 | `created_at` 与首条 `status_history.at` 为当前 `YYYY-MM-DDTHH:mm:ss` |
| TS-02 | `transition` 追加状态 | 顶层 status 更新，历史追加真实时间条目 |
| TS-03 | `fix-placeholders` 预览 | 列出含 `T00:00:00` 的活跃任务，不写入 |
| TS-04 | `fix-placeholders --apply true` | 占位置 `null`，归档任务不动 |
| TS-05 | `npm run check` | 全绿 |

## standards_preflight

- 项目自动检查：`npm run check`（框架结构校验）；本变更不触碰业务项目代码，业务项目 Lint/测试不适用。
- 当前差异人工检查：`task-stamp.mjs` 新增脚本已人工复核——正则不误伤 `null`/真实时刻/归档任务，时间复用 `formatLocalIso` 统一格式。
- 不适用项：ESLint/Checkstyle 等业务仓库静态工具（本任务仅改框架脚本与文档）。

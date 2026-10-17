# 验证：任务时间字段脚本化

验证时间：2026-10-16（本任务时间戳均由 `task-stamp.mjs` 盖章）

| 用例 | 场景 | 结果 | 证据 |
|---|---|---|---|
| TS-01 | `create` 新任务 | PASS | 本任务 `created_at: 2026-10-16T17:23:10`、首条历史 `at: 2026-10-16T17:23:10` |
| TS-02 | `transition` 追加状态 | PASS | `-> in_progress` 输出 `at=2026-10-16T17:23:42`，task.yaml 顶层 status 已更新 |
| TS-03 | `fix-placeholders` 预览 | PASS | 首次预览列出 10 个任务、14 条占位，不写入 |
| TS-04 | `fix-placeholders --apply true` | PASS | 14 条 `T00:00:00` 置 `null`；`2026-10-16-remove-redundant-task-fields` 三条历史均为 `at: null`；归档任务未处理；复扫"没有发现占位时间" |
| TS-05 | `npm run check` | PASS | `cg-work checks passed` |

## 实现缺陷修复记录

`fix-placeholders` 首版基于 yaml 解析结果识别占位，因 js-yaml 将 `2026-10-16T00:00:00` 解析为 Date 对象导致漏报（报"没有发现"）；改为基于原始文本正则识别后正确发现 14 条。

## standards_preflight

- 项目自动检查：`npm run check` → `cg-work checks passed`（自动通过）。
- 当前差异人工检查：14 条占位清理结果逐任务复读确认（`at: null`，无误改），通过。
- 不适用项：业务仓库 Lint/静态扫描（本任务不涉及业务代码差异）。

## 边界说明

- `created_at` 纯日期历史值保留（创建日语义正确，仅补时分秒无来源）；
- 占位时间置 `null` 而非当前时间，避免篡改历史事实（符合 operating-model"无法恢复的时间使用 null"）；
- 纯浏览器/脚本验证覆盖到 YAML 写入与结构校验，数据库层不适用（框架本地记录）。

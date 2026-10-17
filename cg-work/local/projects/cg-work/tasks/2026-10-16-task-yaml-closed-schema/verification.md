# 验证：task.yaml 封闭 schema 重构

## 验证方式

纯静态校验脚本（Node + js-yaml），验证手段为单文件校验、全量框架校验和测试套件，无浏览器/接口运行时行为。

## 测试用例执行结果

| 用例编号 | 结果 | 证据 |
|---|---|---|
| CS-01 未知顶层字段被拒绝 | PASS | 测试 `未知顶层字段统一被拒绝`：输出含"未知字段：execution_profile / artifact_profile"，退出码 1 |
| CS-02 合法任务通过 | PASS | `task checks passed`：本任务与 3 个补正任务单文件校验全过；`npm run check` 全量通过 |
| CS-03 嵌套未知键被拒绝 | PASS | 测试 `拒绝 documentation 内的 schema 外字段`：输出含"未知字段：documentation.targets" |
| CS-04 decisions 形状校验 | PASS | 测试 `拒绝 decisions 内缺失 detail 的决策项`：输出含 decisions[0].detail |
| CS-05 status_history 字符串简写被拒绝 | PASS | 存量测试仍断言"status_history 项必须是包含非空 status 的映射"，措辞已去掉迁移提示字样 |
| CS-06 归档豁免 | PASS | `archived: true` 分支未改动，schema 校验位于 else 分支内 |

## 自动检查

- `npm run check` → `cg-work checks passed`
- `npm test` → pass 87 / fail 2；2 个失败为 `check-project.test.mjs` 的"绝对路径"断言存量问题（`requirements.inbox_path 必须是绝对路径`），与本次变更无关
- `node scripts/check-task.mjs` 单文件 → 4 个目标任务全部 `task checks passed`：
  - `local/projects/cg-work/tasks/2026-10-16-task-yaml-closed-schema`
  - `local/projects/fms/tasks/2026-10-09-inventory-flow-signed-cumulative`
  - `local/projects/fms/tasks/2026-10-16-async-download-foundation`
  - `local/projects/lasen/tasks/2026-10-12-overseas-tax-import-error-logging`

## 数据补正记录

| 任务 | 补正前残留 | 处理 |
|---|---|---|
| fms/2026-10-09-inventory-flow-signed-cumulative | `acceptance_criteria`；status_history 三段字符串简写 | 改名 `acceptance_summary`；简写段转结构化项，原简写无时间记录，`at` 按规则填 `null`（不猜测时间），done 段保持原值 |
| lasen/2026-10-12-overseas-tax-import-error-logging | `lightweight_evidence.changed_files` | 删除（schema 不含该键） |
| fms/2026-10-16-async-download-foundation | `decisions` 无形状校验 | 纳入 allowlist 并新增 `name`/`detail` 必填、`confirmed_at` 日期格式校验；原数据合法，无需改动 |

## standards_preflight

### 项目自动检查

- `npm run check`：通过
- `npm test`：pass 87 / fail 2（2 个失败为存量，见上）
- 单文件校验：4/4 通过

### 当前差异人工检查

- allowlist 覆盖：对照 46 个活跃任务字段扫描，顶层 26 键 + artifacts 7 键 + documentation 4 键 + lightweight_evidence 5 键 + decisions 4 项键，无遗漏
- 归档数据：未触碰任何 `archived: true` 记录（符合"忽略已归档数据"约束）
- 31 个 YAML 损坏任务：不在覆盖范围，未处理（既有问题，非本次引入）

### 不适用项

- 浏览器/接口运行时验证：校验器为静态脚本，无运行时行为
- 常量化收敛：无新增字面量收敛需求

## 验收口径对照

| acceptance_summary | 结果 |
|---|---|
| check-task.mjs 不再含 legacy 黑名单和历史字段专用分支 | PASS：`legacyTopLevelKeys`/`legacyArtifactRefKeys`、原型旧字段拒绝、documentation 旧字段拒绝、standards_preflight 专属拒绝均已删除 |
| schema 外未知字段统一报"未知字段"错误 | PASS：`validateUnknownKeys` 覆盖顶层 + 三个嵌套层，测试断言通过 |
| fms/lasen 三个漏网任务残留字段补正到 schema 内 | PASS：单文件校验 4/4 通过 |
| npm run check 与 npm test 全绿 | PARTIAL：check 全绿；test 87/2，2 个失败为存量 check-project 问题（见 plan.md 不适用项与遗留说明） |

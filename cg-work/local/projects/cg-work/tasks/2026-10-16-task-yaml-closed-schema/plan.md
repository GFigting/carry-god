# 计划：task.yaml 封闭 schema 重构

## 落地方式

不再逐个列举"已废弃字段"，改为封闭 allowlist：schema 外任何顶层/嵌套字段统一报"未知字段"，旧字段自动落入该规则，所有历史专用分支随之删除。

## 封闭 schema（allowlist）

### 顶层字段

必填：`id`、`status`、`goal`、`workflow`、`created_at`；`next_action` 按状态条件必填（done/cancelled 可选）。

可选：`delivery_path`、`archived`、`archived_at`、`archive_reason`、`artifacts`、`documentation`、`acceptance_summary`、`open_decisions`、`scope_decision`、`status_history`、`lightweight_evidence`、`decisions`、`requirements_reference`、`roadmap_reference`、`parent_task_reference`、`prototype_reference`、`depends_on`、`requirements_coverage`、`learning_protocol`、`interaction_protocol`、`next_user_action`。

### artifacts 键

`primary`、`plan`、`review`、`verification`、`handoff`、`learning`、`closure`。

### documentation 键

`impact`、`files`、`reason`、`summary`。

### lightweight_evidence 键

`root_cause`、`scope`、`verification`、`review`、`integration_decision`。

### decisions 项键（本次新增校验）

`name`、`detail`、`confirmed_by`、`confirmed_at`。

## 校验器改动（scripts/check-task.mjs）

1. 删除 `legacyTopLevelKeys`、`legacyArtifactRefKeys` 与 L102-108 黑名单循环
2. 删除 `prototype_contract_reference` / `prototype_disposition_reference` 专属拒绝（L156-162），落入未知字段
3. 删除 `validateDocumentation` 内 `targets` / `not_needed_reason` 专属拒绝，改为嵌套未知键统一拒绝
4. 删除 `standards_preflight` 专属拒绝（L137-139），落入未知字段
5. 新增 `validateUnknownKeys(task, errors)`：顶层 + artifacts + documentation + lightweight_evidence 四层 allowlist 校验
6. `status_history` 字符串简写：保留"必须是映射"报错（该报错即通用规则，非迁移提示），措辞去掉"不再接受"字样
7. 新增 `validateDecisions(task.decisions, errors)`

## 数据补正（3 个漏网任务）

| 任务 | 残留 | 处理 |
|---|---|---|
| fms/2026-10-09-inventory-flow-signed-cumulative | `acceptance_criteria`；status_history 字符串简写混用 | 改名 `acceptance_summary`；简写段转结构化项（保留原语义） |
| fms/2026-10-16-async-download-foundation | 无（`decisions` 合法） | 纳入 allowlist + 形状校验 |
| lasen/2026-10-12-overseas-tax-import-error-logging | `lightweight_evidence.changed_files` | 删除（schema 不含） |

注意：这 3 个项目不在 `npm run check` 覆盖内，补正后用 `node scripts/check-task.mjs <file>` 单文件校验。

## 测试同步

- 删除"拒绝某历史字段"的针对性用例（若有），换成统一"未知字段被拒绝"用例
- fixtures 同步：夹具若含 legacy 键需改为未知字段用例
- `npm test` 兜底

## 文档同步

- `core/operating-model.md`：字段清单改为封闭列表；`decisions` 字段补形状说明；删除"已废弃/迁移提示"措辞
- `scripts/README.md`：check-task 描述更新为封闭 schema

## 执行顺序

1. check-task.mjs 封闭化
2. 补正 3 个数据任务
3. 测试同步
4. 文档同步
5. `node scripts/check-task.mjs` 单文件验证 3 个补正任务 → `npm run check` → `npm test`

## standards_preflight

### 项目自动检查

- `npm run check`：cg-work checks passed（全部框架受管任务含新增任务通过封闭 schema 校验）
- `npm test`：pass 87 / fail 2；2 个失败均为 `check-project.test.mjs` 的绝对路径断言存量问题，与本次变更无关
- `node scripts/check-task.mjs`：单文件校验 3 个补正任务全部通过

### 当前差异人工检查

- 封闭 allowlist 覆盖面：对照 46 个可解析活跃任务的字段使用扫描结果确认无遗漏（`decisions` 已纳入并新增形状校验）
- 归档豁免：`archived: true` 仍只校验 YAML 可解析，schema 校验不影响归档数据（用户要求忽略已归档数据）
- 删除的历史分支：legacy 黑名单、原型旧字段专属拒绝、documentation 旧字段专属拒绝、standards_preflight 专属拒绝、status_history 迁移提示措辞——均已核对删除

### 不适用项

- 浏览器/接口运行时验证：校验器为纯静态 Node 脚本，无运行时行为
- 常量化（字面量收敛）：本次无新增字面量收敛需求，框架脚本常量已以 allowlist Set 形式集中在文件头部

## 测试用例

| 用例编号 | 所属模块 | 用例标题 | 前置条件 | 测试步骤 | 预期结果 | 优先级 | 测试层级 |
|---|---|---|---|---|---|---|---|
| CS-01 | check-task | 未知顶层字段被拒绝 | 构造含 `execution_profile: x` 的任务文件 | 运行 check-task.mjs | 输出含"未知字段：execution_profile"，退出码 1 | P0 | api |
| CS-02 | check-task | 合法任务通过 | 标准档 review 任务含全部证据文件 | 运行 check-task.mjs | 无错误，退出码 0 | P0 | api |
| CS-03 | check-task | 嵌套未知键被拒绝 | `documentation.targets: [x]` | 运行 check-task.mjs | 输出含"未知字段：documentation.targets" | P1 | api |
| CS-04 | check-task | decisions 形状校验 | `decisions: [{name: 'x'}]` 缺 detail | 运行 check-task.mjs | 输出含 decisions[0].detail 必填类错误 | P1 | api |
| CS-05 | check-task | status_history 字符串简写被拒绝 | `status_history: ['pending']` | 运行 check-task.mjs | 输出含"必须是包含非空 status 的映射" | P1 | api |
| CS-06 | 归档豁免 | 归档任务不校验字段 | `archived: true` 且含任意字段 | 运行 check-task.mjs | 仅要求 YAML 可解析，无字段错误 | P1 | api |

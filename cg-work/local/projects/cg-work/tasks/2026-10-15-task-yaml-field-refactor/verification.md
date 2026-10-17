# 验证记录

## 验证目标

确认 task.yaml 字段重构的全部 5 个方向（A：delivery_path 合并、B：artifacts 分组、C：废弃字段清理、D：next_action 放宽、E：时间格式补齐）都已正确落地。

## 方法

通过 `npm run check`（框架自身 22 个活跃任务）和逐项目 `node scripts/check-task.mjs <task.yaml>` 对四个项目的活跃任务（排除 archive 和 YAML 本身损坏的任务）进行校验。

## 结果

### 框架自身（cg-work）

- ✅ npm run check → `cg-work checks passed`（22 个活跃任务全部通过）
- ✅ 收缩后的校验器正确拒绝了所有顶层废弃字段（execution_profile、artifact_profile、project_id、title、plan_reference、review_reference、verification_reference、handoff_reference、learning_reference、closure_reference）
- ✅ 正确拒绝了 documentation.targets 和 documentation.not_needed_reason
- ✅ done/cancelled 任务 next_action 为可选（不再强制）

### 其他项目

- ✅ fms：10/10 活跃任务全部通过收紧后的校验
- ✅ lasen：8 个活跃任务通过；4 个 YAML 本身损坏（裸 requirements_reference 路径缺少 key 名），为既有问题，非本次重构引入
- ✅ job-hunt：4 个已迁移的活跃任务通过；29 个 YAML 本身损坏（同上），为既有问题

### 迁移范围统计

| 项目 | 活跃任务总数 | 被迁移 | YAML 损坏跳过 |
|---|---|---|---|
| cg-work | 22 | 22 | 0 |
| fms | 10 | 10 | 0 |
| lasen | 12 | 8 | 4 |
| job-hunt | 33+ | 4 | ~29 |
| **合计** | ~77 | **44** | ~33 |

### 废弃字段收紧验证

以下场景用手工构造的夹具确认被校验器拒绝：

1. 顶层 `execution_profile: lightweight` → 报错"已废弃，请使用 delivery_path"
2. 顶层 `plan_reference: plan.md` → 报错"已废弃，请移至 artifacts.plan"
3. `documentation.targets: [...]` → 报错"已废弃，请使用 files"
4. `documentation.not_needed_reason: xxx` → 报错"已废弃，请使用 reason"
5. done 状态缺少 next_action → 允许（不报错）
6. pending 状态缺少 next_action → 报错"缺少任务字段：next_action"

### 时间格式验证

- 活跃任务中所有带 `+08:00` / `Z` / `.SSS` 毫秒的 created_at / status_history.at 行都被迁移脚本清理为不带时区的本地墙钟时间
- `validateTimeFields` 继续拒绝带时区的值

### 未覆盖（非本次范围）

- archive 目录下 125 个归档任务未做任何修改（用户明确要求忽略归档数据）
- job-hunt 和 lasen 中 ~33 个 YAML 本身损坏的活跃任务（裸 requirements_reference 路径）未做修复，属于框架外部治理问题

## 第二轮补充（2026-10-16）：过渡兼容全面清理

用户指示"不需要过渡字段，直接迁移最新字段"并选择选项 A，本轮完成：

### requirements_reference_note 删除（选项 A）

- ✅ `2026-10-01-review-closeout-consolidation` 任务：删除 `requirements_reference_note` 和悬空 `requirements_reference`，"需求包不可恢复"并入 `scope_decision.rationale`
- ✅ `check-task.mjs` 的 `validateRequirementsReference` 移除全部 note 分支：目标缺失直接报"指向的文件不存在"，不再有任何替代说明通道
- ✅ `operating-model.md` 任务元数据摘要删除该字段条目；`scripts/README.md` 第 19 行改为"目标缺失即拒绝（note 已移除）"

### status_history 字符串简写兼容清理

- ✅ 迁移 3 个 job-hunt 活跃任务的字符串数组 → 结构化项（`migrate --status-history --apply`）
- ✅ `validateStatusHistory` 删除字符串分支，简写直接报"不再接受字符串简写"
- ✅ `operating-model.md` 状态历史格式段删除字符串数组示例，"旧的字符串数组简写不再接受"

### 测试回归（38 失败 → 2 存量）

- ✅ 删除 3 个已无对应行为的测试方法：需求包替代说明的接受/拒绝/非空文本用例（用户指示"移除无需测试方法"）
- ✅ 删除 lightweight+compact 组合拒绝用例，改写为 `delivery_path` 单枚举正反用例
- ✅ 批量迁移全部夹具：`not_needed_reason`→`reason`、`execution_profile`/`artifact_profile`→`delivery_path`、6 个顶层引用→`artifacts.*` 分组、字符串数组→结构化项
- ✅ 修复 `check-task.mjs` 报错引号为弯引号（与测试断言一致）、修复夹具重复 `artifacts:` 键
- ✅ 更新 `delivery-path-consistency.test.mjs` 断言到新标题"### 交付路径声明"与单枚举措辞
- ✅ 同步 `README.md`、`scripts/README.md`、`workflows/README.md` 中"继续兼容"表述为"已被拒绝，需先迁移"
- ✅ `npm test`：87 用例 / 85 通过 / 2 失败（均为 `check-project.test.mjs` 绝对路径存量问题，与本次重构无关）
- ✅ `npm run check`：全绿

## standards_preflight

- 常量化判断：本次验证针对字段词汇与校验分支调整，无新增业务字面量；错误消息与协议术语保留规则文档、校验器与测试断言中，不抽取运行时常量。
- 静态检查：`npm run check` 与 `npm test` 在最终代码状态下实际执行并记录结果（85/87，2 个失败为存量问题）。
- 例外：无。

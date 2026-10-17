# task.yaml 字段重构计划

## 动机

当前 task.yaml 存在五个独立但都指向同一问题的"不够干净"的点：执行档位两字段语义纠缠、引用字段扁平散落、历史兼容分支残留、终态 next_action 噪音、时间格式迁移不彻底。本次一次性全部收敛，避免后续逐个打补丁。

## 范围与边界

- **覆盖对象**：所有项目的活跃 task.yaml（非 archive 目录），框架校验脚本、迁移脚本、规则文档
- **不碰归档任务**：archive/ 下的 125 个任务完全跳过，仅校验器对归档记录仍只要求 YAML 可解析
- **不新增字段**：只做合并、分组、清理、放宽，不引入新的维度

## 完整 old → new 字段映射表

| 编号 | 旧字段 | 新字段 | 变换规则 | 影响范围 |
|---|---|---|---|---|
| A1 | `execution_profile: lightweight` | `delivery_path: lightweight` | 直接替换，值不变 | 校验器、所有声明 lightweight 的任务 |
| A2 | `execution_profile: standard`（或省略）+ 无 artifact_profile | `delivery_path: standard`（或省略） | standard 允许继续省略以兼容存量；迁移时统一补写 | 校验器、operating-model.md 组合规则表 |
| A3 | `artifact_profile: compact` + 无 execution_profile 或 standard | `delivery_path: compact` | 两字段合并为一个；原 `artifacts.primary` 嵌套位置不变 | 校验器、所有 compact 任务 |
| B1 | `plan_reference` | `artifacts.plan` | 从顶层嵌套进 artifacts 分组 | 校验器、所有 standard 任务 |
| B2 | `review_reference` | `artifacts.review` | 同上 | 同上 |
| B3 | `verification_reference` | `artifacts.verification` | 同上 | 同上 |
| B4 | `handoff_reference` | `artifacts.handoff` | 同上 | 同上 |
| B5 | `learning_reference` | `artifacts.learning` | 同上 | 同上 |
| B6 | `closure_reference` | `artifacts.closure` | 同上 | 同上 |
| B7 | `artifacts.primary` | `artifacts.primary` | 不变，只是现在和其他引用同组，不再是 artifacts 里唯一的键 | 所有 compact 任务 |
| C1 | `project_id` | (删除) | 仅 archive 里有 2 处残留，活跃任务已无；直接从校验器移除，不处理归档 | 校验器 |
| C2 | `title` | (删除) | 活跃任务已无残留；直接从校验器移除 | 校验器 |
| C3 | `documentation.targets` | `documentation.files` | 活跃任务已无残留；移除兼容分支，校验器直接拒绝 targets | 校验器 |
| C4 | `documentation.not_needed_reason` | `documentation.reason` | 同上 | 同上 |
| C5 | `requirements_reference_note` | 保持不变 | 虽也是兼容字段，但扫描发现有活跃任务在用，暂保留 | 校验器（不动） |
| D1 | `next_action`（done / cancelled 状态） | 可选，不再强制 | 校验器从"所有状态强制"改为"仅 pending / in_progress / review / blocked 强制" | 校验器 |
| E1 | `created_at` 带时区后缀 | 去后缀，保留本地值 | 迁移脚本对活跃任务扫描 `+HH:MM` 或 `Z` 后缀并移除 | 迁移脚本、活跃任务 |
| E2 | `status_history[].at` 带时区后缀 | 同上 | 同上 | 同上 |

## 逐项设计

### 方向 A：合并执行档位为单一 delivery_path

**旧模型**（两字段，4 种组合，需拒绝 lightweight+compact）：
```yaml
execution_profile: lightweight   # 或 standard；省略=standard
artifact_profile: compact      # 或省略
```

**新模型**（单字段，三选一，无冲突）：
```yaml
delivery_path: lightweight | standard | compact   # 省略=standard
```

| delivery_path | 语义 | 证据组织 |
|---|---|---|
| `lightweight` | 轻量执行 | 证据合并进 `lightweight_evidence`，不创建独立文件 |
| `standard`（默认） | 标准执行 | 按阶段生成 `plan.md`、`review.md`、`verification.md`、`learning.md`、`handoff.md` |
| `compact` | 标准执行 + 紧凑证据组织 | `task.yaml` + `artifacts.primary` 一个主产物，验证/学习/交接回写主产物或 task.yaml |

**迁移示例**：
```yaml
# 旧
execution_profile: lightweight
# 新
delivery_path: lightweight

# 旧
execution_profile: standard
artifact_profile: compact
# 新
delivery_path: compact

# 旧（省略两个字段）
# execution_profile: 省略
# artifact_profile: 省略
# 新（补写，或保持省略）
delivery_path: standard
```

**校验器变更**：
- 新增字段 `delivery_path`，枚举值 `lightweight` / `standard` / `compact`
- 保留 `execution_profile` 和 `artifact_profile` 的兼容识别（过渡期同时接受旧格式和新格式）
- 过渡期结束后（所有活跃任务已迁移），收紧校验器拒绝旧字段
- 移除 lightweight + compact 冲突检查（单字段天然互斥）

### 方向 B：引用字段分组进 artifacts

**旧结构**（顶层扁平，6 个散字段）：
```yaml
plan_reference: plan.md
review_reference: review.md
verification_reference: verification.md
handoff_reference: handoff.md
learning_reference: learning.md
closure_reference: closure.md
```

**新结构**（嵌套进 artifacts 分组，与 primary 同组）：
```yaml
artifacts:
  primary: plan.md          # compact 任务主产物（原有）
  plan: plan.md
  review: review.md
  verification: verification.md
  handoff: handoff.md
  learning: learning.md
  closure: closure.md
```

分组后 artifacts 对象的键按需出现——轻量执行任务可以完全没有 artifacts 分组，compact 任务只需要 primary，标准任务按需填充 plan/review/verification/handoff/learning/closure。

**校验器变更**：
- 过渡期同时接受旧的顶层 `*_reference` 字段和新的 `artifacts.*` 字段
- 过渡期结束后，拒绝顶层 `*_reference` 字段
- `artifacts.primary` 的 compact 门禁逻辑保持不变
- `prototype_reference`、`requirements_reference`、`roadmap_reference`、`parent_task_reference`、`depends_on`、`scope_decision.prior_task_reference` 保持顶层不动——这些是外部关联引用，不是产物文件路径

### 方向 C：清理历史兼容字段

**项目_id** 和 **title**：仅 archive 有残留（2 个归档任务含 project_id），活跃任务已无。直接从校验器移除对这两个字段的识别。

**documentation.targets / not_needed_reason**：上一轮迁移已清零活跃任务残留。移除校验器里的"files 与 targets 不能同时填写"、"reason 与 not_needed_reason 不能同时填写"等兼容分支，改为直接拒绝 targets 和 not_needed_reason。

**requirements_reference_note**：扫描发现活跃任务仍在用，暂保留。

### 方向 D：放宽 next_action 终态门禁

旧校验器在 `for (const key of ['id', 'status', 'goal', 'workflow', 'created_at', 'next_action'])` 里无差别强制所有状态必填。

新逻辑：
- `pending` / `in_progress` / `review` / `blocked`：next_action 必填
- `done` / `cancelled`：next_action 可选

done/cancelled 是终态，Agent 内部没有"下一步"，写一句"任务已完成"类的话只是噪音。需要表达"下一步"的场景已经有 `next_user_action` 在覆盖。

### 方向 E：补齐活跃任务时间格式迁移

扫描结果显示之前的迁移已覆盖大部分，但 fms 和 lasen 项目的部分活跃任务仍带 `+08:00` 后缀。迁移脚本新增 `--timezones` 选项，扫描 `created_at` 和 `status_history[].at` 行，去掉时区后缀，保留本地墙钟值。

## standards_preflight

- 常量化判断：本次仅涉及 YAML 字段词汇与校验分支调整（`delivery_path` 枚举、`artifacts` 分组、废弃字段拒绝），无新增业务字面量需要常量化；协议术语保留在规则文档、错误提示和测试断言中。
- 静态检查：`npm run check`（框架结构、锚点、受管项目任务记录）+ `npm test`（回归测试）实际执行；无项目业务代码，无外部环境检查。
- 例外：无。

## 执行顺序（必须按序，前一步不通过不进入后一步）

```
Step 1: check-task.mjs → 过渡态（同时接受旧格式和新格式）
        ↓ npm run check 确认框架自身 21 个活跃任务仍全部通过
Step 2: 扩展 migrate-task-metadata.mjs（新增 --delivery-path, --artifact-group, --timezones 三个转换）
        ↓ 对全部活跃任务跑 dry-run，输出变更清单（含统计）
Step 3: 用户确认 dry-run 输出 → --apply 执行迁移
        ↓ 全活跃任务迁移完毕
Step 4: npm run check 全量验证（含 cg-work + fms + lasen + job-hunt 四个项目）
        ↓ 确认全绿
Step 5: 收紧 check-task.mjs → 拒绝旧字段
        ↓ npm run check 再次确认
Step 6: 更新 core/operating-model.md、README.md、workflows/*.md、scripts/README.md 的字段描述
        ↓ 把执行档位两字段 → 单字段、引用分组、兼容字段清理、next_action 放宽、delivery_path 组合表 全部写入规则文档
Step 7: npm run check 最终验证，写 verification.md
```

## 迁移影响预估

| 项目 | 活跃任务数 | 预估变更文件数 | 主要变更类型 |
|---|---|---|---|
| cg-work | 21 | 21 | delivery_path 合并 + artifacts 分组 + 时间格式 |
| fms | ~25 | ~25 | 时间格式（部分带 +08:00）+ delivery_path 合并 |
| lasen | ~30 | ~30 | 时间格式（部分带 +08:00）+ delivery_path 合并 |
| job-hunt | ~40 | ~40 | delivery_path 合并 + artifacts 分组 |
| **合计** | **~116** | **~116** | 跳过 archive 下 125 个 |

## 风险与回退

- **YAML 结构变换风险**：从顶层 `plan_reference:` 改成 `artifacts:\n  plan:` 是缩进和键名双重变更，必须用正则替换整个键值对块，不能只改 key 名。迁移脚本先 dry-run 输出 diff 预览
- **校验器收紧过早**：如果 Step 5 收紧校验器在 Step 3 迁移之前执行，整个框架立即全红。严格按顺序执行
- **归档记录意外变更**：迁移脚本已有 `if (task.archived === true) continue` 保护，且用户明确要求忽略归档，不再额外加保险
- **回退点**：每一步之间都是独立的 git commit。最坏情况是 Step 3 执行后有文件损坏 → 从 Step 2 的 dry-run 输出恢复或 git checkout

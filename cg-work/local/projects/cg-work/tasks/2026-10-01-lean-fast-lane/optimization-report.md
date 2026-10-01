# 框架轻量档与比例原则优化报告

## 证据（为什么改）

会话复盘（2026-10-01，job-hunt P1b 交付）认定的框架侧慢因：①非低风险改动被迫走全套流程，`feature-development` 无轻量档；②工作流六件套 required_skills 把"做满"设为默认；③测试条款无价值分层导致穷举测试；④验证纪律被理解为每汇报回合重跑全量。用户指令："优化框架吧"。

## 受影响的唯一来源

| 文件 | 变更 |
|---|---|
| `core/operating-model.md` | 新增「最小充分流程」：三档分级（低风险/轻量/标准）、测试价值分层（硬三类）、现状证据保鲜、验证绑定交付点 |
| `workflows/feature-development.md` | 新增「轻量功能」档（`execution_profile: lightweight`，证据合并 `lightweight_evidence` 免 `root_cause`）；技能按需化（仅 verification 必留，五件套转 conditional）；测试条款改价值分层 |
| `workflows/README.md` | 「轻量缺陷路径」→「轻量档路径」，覆盖 bugfix 与 feature-development；学习门禁措辞同步 |
| `scripts/check-task.mjs` | lightweight 允许 `framework:feature-development`；`validateLightweightEvidence` 按工作流区分证据键（bugfix 要 `root_cause`，功能类免） |
| `test/check-task.test.mjs` | 原"拒绝非缺陷工作流用轻量档"用例改写为"轻量档适用 bugfix 与 feature-development"（含免 root_cause 断言）——原断言钉旧行为，必须随规则演进更新 |
| `README.md` | 第 7 步补轻量功能引用 |
| `VERSION` | 2.17.0 → 2.18.0（新增兼容能力升次版本） |

## 兼容性等级

**新增兼容能力（minor）**：历史任务、`execution_profile: standard`、compact、bugfix 轻量档行为零变化；`check-task` 对旧任务的判定不变（回归 48/48 含既有用例全部保持）。唯一行为变化：此前被拒绝的"feature-development + lightweight"组合现在合法——这正是本次目标。

## 迁移与替代说明

无需迁移：历史任务记录不改；废弃表述（"lightweight 只适用于 bugfix"）已在 README/workflows README 同步替换，无残留引用（check-all 校验通过）。

## 验证范围

- `node scripts/check-all.mjs` → cg-work checks passed
- `node --test "test/*.test.mjs"` → **48/48 全绿**（含改写的轻量档用例）
- `node scripts/check-task.mjs` 新任务记录 → 通过

## 遗留

无。子代理派发从简口径已写入 `workflows/feature-development.md` 轻量功能段末句。

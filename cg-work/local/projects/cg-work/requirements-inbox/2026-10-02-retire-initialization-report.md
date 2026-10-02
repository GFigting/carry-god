# 需求包：废弃 initialization-report.md

- 日期：2026-10-02
- 来源：2026-10-02 框架一致性收敛的任务决策 D4（用户确认）
- 状态：原始需求，未拆分

## 原始诉求

用户在框架一致性收敛验收中确认：`initialization-report.md` 属有意废弃，但废弃动作不并入本次收敛，另立任务处理。

## 事实

- 该产物由 `skills/project-initialization/SKILL.md:19` 要求生成，用于记录探测范围、事实来源、未确认项、未读取文件、ID 判断和后续建议。
- `local/README.md:12` 在项目结构清单中把它列为标准产物。
- 2026-10-02 开工前工作区已存在对 `local/projects/cg-work/initialization-report.md` 的删除（未提交）；经用户确认属有意废弃，已恢复文件并把废弃动作独立立项。

## 废弃理由（待任务内复核）

- 一次性探测报告，事实腐烂最快，与 [工作模型](../../../../core/operating-model.md#最小充分流程) 的"现状证据保鲜"要求冲突。
- 耐久信息已由 `project-context.yaml` 承载（项目根路径、技术栈、文档与验证入口）。
- 框架方向是减少预创建产物（`artifact_profile: compact`、最小充分流程）。

## 约束

- 不得直接删除文件了事：必须同步 `local/README.md` 的结构清单与技能正文中的生成步骤，并保留替代说明。
- 已存在的历史 `initialization-report.md` 不强制删除；迁移或清理需单独确认。

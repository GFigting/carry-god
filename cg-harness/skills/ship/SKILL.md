# CG Ship

## Purpose
在验收完成后执行交付、提交或发布前检查。

## Inputs
- task_record
- verification_result
- release_scope
- operational_constraints

## Procedure
1. 检查验收、风险和变更范围。
2. 确认提交、迁移、配置和回滚信息。
3. 执行项目允许的交付动作。
4. 记录交付结果和未完成事项。

## Outputs
- delivery_result
- commit_or_release_reference
- rollback_notes
- operational_followups

## Completion Gate
没有通过的必要验收或未声明的高风险变更时，不得声称已交付。

## Adapter Hooks
可使用 ship、commit 或项目发布流程，但危险操作仍受项目和用户确认规则约束。

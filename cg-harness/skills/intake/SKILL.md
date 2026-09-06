# CG Intake

## Purpose
将自然语言请求转换为一个可追踪的任务草稿，不提前扩大范围。

## Inputs
- user_request
- project_hint
- existing_goal

## Procedure
1. 判断意图类型与期望结果。
2. 提取项目、目标、范围、约束和紧急性。
3. 标记未知信息，不把推测写成事实。
4. 创建或更新任务记录。

## Outputs
- task_type
- intent_summary
- initial_scope
- open_questions
- task_record_path

## Completion Gate
任务已有唯一标识、意图、初始范围和未决问题清单。

## Adapter Hooks
可使用外部分类器或需求分析技能，但任务字段和未决问题由 CG Harness 统一维护。

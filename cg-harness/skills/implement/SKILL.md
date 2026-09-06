# CG Implement

## Purpose
按已确认范围交付最小完整变更或工件。

## Inputs
- task_record
- context_package
- implementation_plan
- acceptance_criteria

## Procedure
1. 先确认当前任务状态允许实施。
2. 按步骤修改代码或生成工件。
3. 保持变更与范围、保留项和决策一致。
4. 为每个重要改动记录文件和行为影响。

## Outputs
- changed_files
- produced_artifacts
- implementation_notes
- deferred_items

## Completion Gate
计划内产出已完成，未把未验证内容声明为完成。

## Adapter Hooks
可由项目内置实现能力、superpowers 或其他 coding provider 执行；范围与证据要求不可被替换。

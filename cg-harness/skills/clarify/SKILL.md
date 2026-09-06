# CG Clarify

## Purpose
只澄清会改变范围、验收或风险的决策。

## Inputs
- task_record
- open_questions
- acceptance_draft

## Procedure
1. 按影响排序未决问题。
2. 一次提出一个问题。
3. 记录用户回答和被排除的选项。
4. 更新范围、验收和风险。

## Outputs
- resolved_decisions
- updated_scope
- acceptance_criteria
- remaining_questions

## Completion Gate
影响交付的关键问题已解决，或明确记录为阻塞/待确认。

## Adapter Hooks
可使用 brainstorming、grill 或产品咨询能力增强提问，但不得绕过单问题和决策记录规则。

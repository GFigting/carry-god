# CG Review

## Purpose
独立检查缺陷、风险、证据充分性和未回答问题。

## Inputs
- task_record
- changed_surface
- evidence
- review_scope

## Procedure
1. 明确审查范围和比较基准。
2. 先列 findings，再说明验证状态。
3. 区分缺陷、风险、问题和可接受取舍。
4. 记录需要返工的条件，不擅自扩大修改范围。

## Outputs
- findings
- verification_status
- accepted_tradeoffs
- remaining_questions
- review_decision

## Completion Gate
审查结论有范围依据，严重发现有定位，未验证内容没有被掩盖。

## Adapter Hooks
可使用 code-review、gstack review 或 security review；审查不自动授权改代码。

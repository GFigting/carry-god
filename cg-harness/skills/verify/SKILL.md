# CG Verify

## Purpose
根据验收标准检查交付结果，并形成可复核证据。

## Inputs
- task_record
- acceptance_criteria
- changed_surface
- prior_evidence

## Procedure
1. 将每条验收标准映射到验证动作。
2. 执行测试、检查、浏览器、数据或人工验证。
3. 区分通过、失败、未执行和不适用。
4. 汇总残余风险和复现条件。

## Outputs
- verification_result
- evidence_by_criterion
- failed_or_unrun_checks
- remaining_risk

## Completion Gate
每条验收标准都有结果；未执行项和风险必须显式记录。

## Adapter Hooks
可使用 TDD、QA、browser verification 或项目测试工具，但 provider 响应本身不等于证据。

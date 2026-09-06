# CG Plan

## Purpose
把已澄清的任务拆成可执行、可验证的最小步骤。

## Inputs
- task_record
- context_package
- acceptance_criteria

## Procedure
1. 划分实现边界和依赖。
2. 为每步声明输入、改动、验证和产出。
3. 标记并行、串行和需要确认的步骤。
4. 记录方案选择与被拒绝的替代方案。

## Outputs
- implementation_plan
- decision_log
- dependency_order
- planned_evidence

## Completion Gate
每个步骤都有明确产出和验证方法，计划没有隐藏范围。

## Adapter Hooks
可使用 writing-plans、to-spec 或工程评审能力，但计划格式以 CG Harness 为准。

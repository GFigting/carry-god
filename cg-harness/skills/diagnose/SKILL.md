# CG Diagnose

## Purpose
从复现证据推导并验证直接根因。

## Inputs
- task_record
- reproduction_evidence
- context_package

## Procedure
1. 列出候选根因。
2. 通过调用链、数据、日志或最小实验排除假设。
3. 记录直接根因和防护缺口。
4. 选择最小修复点与回归范围。

## Outputs
- root_cause
- rejected_hypotheses
- fix_boundary
- regression_scope

## Completion Gate
根因有证据支持，且修复边界不会依赖未经验证的假设。

## Adapter Hooks
可使用 systematic-debugging、diagnosing-bugs 或 investigate，但根因和排除过程必须回写任务证据。

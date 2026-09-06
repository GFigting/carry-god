# CG Reproduce

## Purpose
建立问题的稳定复现条件，或明确说明无法复现的原因。

## Inputs
- task_record
- expected_behavior
- actual_behavior
- runtime_context

## Procedure
1. 固化输入、环境、步骤和观察结果。
2. 区分稳定复现、间歇复现和无法复现。
3. 保存日志、截图、请求或最小样例。
4. 更新诊断报告和任务证据。

## Outputs
- reproduction_steps
- reproduction_result
- reproduction_evidence
- reproduction_limits

## Completion Gate
有可重跑的复现证据，或有清晰的不可复现说明和下一步采样要求。

## Adapter Hooks
可使用浏览器 QA、日志分析或调查工具增强，但不得用猜测替代复现结论。

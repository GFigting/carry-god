# CG Baseline

## Purpose
为优化建立可比较的现状指标和测量条件。

## Inputs
- task_record
- metric
- target
- measurement_method

## Procedure
1. 明确指标定义、样本和环境。
2. 采集至少一组可复核基线。
3. 记录波动、限制和不可比因素。
4. 形成优化假设的约束。

## Outputs
- baseline_measurement
- measurement_conditions
- bottleneck_evidence
- baseline_limits

## Completion Gate
没有基线或可解释的替代测量时，不得进入优化实施。

## Adapter Hooks
可使用 benchmark、profile、query plan 或 workflow measurement 工具。

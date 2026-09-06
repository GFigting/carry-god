# CG Optimize

## Purpose
在既定约束下实施一次可测量、可回退的优化。

## Inputs
- task_record
- baseline_measurement
- bottleneck_evidence
- constraints

## Procedure
1. 提出单一优化假设。
2. 评估收益、风险和兼容性。
3. 实施有边界的改动。
4. 在可比条件下重复测量。
5. 保留、回退或记录未达标结果。

## Outputs
- optimization_change
- before_after_measurement
- tradeoffs
- keep_or_revert_decision

## Completion Gate
有前后测量和约束检查；没有改善时不得包装成成功。

## Adapter Hooks
可使用 benchmark、ce-optimize 或工程评审能力，但测量条件必须随证据保存。

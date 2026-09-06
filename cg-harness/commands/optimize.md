# /cg-optimize

## Purpose
改善有明确基线、目标和测量方法的性能、成本或工作流指标。

## Self-Owned Skill Chain

```text
cg.intake -> cg.context -> cg.baseline -> cg.diagnose -> cg.optimize -> cg.verify -> cg.learn
```

## Route

1. `cg.intake` records metric, target, constraints, and intent.
2. `cg.context` gathers the relevant runtime and architecture surface.
3. `cg.baseline` records comparable current measurements.
4. `cg.diagnose` identifies the dominant bottleneck and tests hypotheses.
5. `cg.optimize` applies one bounded change.
6. `cg.verify` repeats measurement and checks correctness.
7. `cg.learn` records trade-offs and follow-up work.

## Acceptance Gate

- Baseline and target are present.
- Before and after measurements use comparable conditions.
- Correctness and compatibility constraints are checked.
- Keep, revert, or inconclusive decision is explicit.

Without a measurable target, route to `/cg-refactor` or `/cg-work`.

## External Adapters

Preferred adapters may include `gstack:benchmark`, `ce-optimize`, or engineering review tools.

## Output

Baseline, bottleneck evidence, bounded optimization, before/after measurement, trade-offs, and residual risk.

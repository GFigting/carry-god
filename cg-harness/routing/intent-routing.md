# Intent Routing

## Primary Rule

Route by the user's intended outcome, not by isolated keywords.

| Intent | Command | Default outcome |
|---|---|---|
| New capability or ordinary engineering work | `/cg-work` | implementation and verification |
| Existing behavior is wrong | `/cg-fix` | fix evidence and regression proof |
| Behavior is acceptable but structure is poor | `/cg-refactor` | target structure and behavior-preservation proof |
| Behavior is acceptable but a metric is poor | `/cg-optimize` | baseline and before/after measurement |
| A future solution needs visual or interaction validation | `/cg-prototype` | runnable prototype and design decision |
| Existing work needs inspection or knowledge capture | `/cg-review` | review, verification, or learning artifact |

## Ambiguous Input

Ask one question only when the intent cannot be distinguished:

```text
你希望我修复错误、改善内部结构、提升可量化指标，还是先做原型？
```

## Automatic Escalation

- Simple task: execute directly and verify the changed surface.
- Multi-file task: create a task record and a focused plan.
- Cross-module, data, public API, security, or release work: require explicit scope and review evidence.
- UI work: use prototype or browser verification when visual behavior matters.

## Never Infer

- A refactor is not a bug fix.
- An optimization is not valid without a baseline or measurable target.
- A prototype is not production implementation.
- A review does not authorize unrelated edits.

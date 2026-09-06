# /cg-refactor

## Purpose
改善内部结构，同时证明约定的外部行为保持不变。

## Self-Owned Skill Chain

```text
cg.intake -> cg.context -> cg.refactor-design -> cg.plan -> cg.implement -> cg.verify -> cg.review
```

## Route

1. `cg.intake` records the structural problem and intended outcome.
2. `cg.context` maps responsibilities, callers, dependencies, and constraints.
3. `cg.refactor-design` defines target structure and preservation matrix.
4. `cg.plan` chooses staged migration steps.
5. `cg.implement` performs small coherent changes.
6. `cg.verify` checks behavior and structural boundaries.
7. `cg.review` identifies defects and residual coupling.

## Acceptance Gate

- Target structure is documented.
- Public interfaces, business rules, data, permissions, and operations to preserve are explicit.
- Behavior-preservation evidence is recorded.
- No unrelated feature or bug fix is silently included.

## External Adapters

Preferred adapters may include `skills:improve-codebase-architecture`, `skills:codebase-design`, or domain modeling.

## Output

Refactor plan, target-structure note, changed code, preservation evidence, review findings, and remaining risk.

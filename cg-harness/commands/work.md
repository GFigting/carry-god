# /cg-work

## Purpose
交付新能力或一般工程任务。

## Self-Owned Skill Chain

```text
cg.intake -> cg.clarify -> cg.context -> cg.plan -> cg.implement -> cg.verify -> cg.learn
```

## Route

1. `cg.intake` identifies project, Goal, intent, and initial scope.
2. `cg.clarify` asks only decisions that change scope or acceptance.
3. `cg.context` assembles the smallest sufficient project package.
4. `cg.plan` is required when work crosses files, modules, data, or public interfaces.
5. `cg.implement` delivers the smallest complete vertical slice.
6. `cg.verify` maps every acceptance criterion to evidence.
7. `cg.learn` records reusable decisions when useful.

## Acceptance Gate

- Changed surface is listed.
- Acceptance criteria are individually checked.
- Tests or focused verification are recorded.
- Remaining risk and unrun checks are explicit.

## External Adapters

Preferred adapters may include `superpowers:writing-plans`, `skills:implement`, or `gstack:review`. They enhance a CG skill and never replace its contract.

## Output

Code or artifact, tests, task record, evidence, and declared residual risk.

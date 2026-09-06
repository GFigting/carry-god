# /cg-review

## Purpose
检查现有工作、验证证据、总结决策，并在有价值时沉淀知识。

## Self-Owned Skill Chain

```text
cg.intake -> cg.context -> cg.review -> cg.verify -> cg.learn
```

## Route

1. `cg.intake` establishes review scope and comparison point.
2. `cg.context` gathers relevant code, task, plan, and policy.
3. `cg.review` reports findings first and separates defects, risks, questions, and trade-offs.
4. `cg.verify` runs focused checks where evidence is stale or insufficient.
5. `cg.learn` captures durable lessons when useful.

## Acceptance Gate

- Scope and comparison point are explicit.
- Findings have locations or supporting evidence.
- Verification status and remaining risk are stated.
- Review does not authorize unrelated edits.

## External Adapters

Preferred adapters may include `skills:code-review`, `gstack:review`, `gstack:qa`, security review, or compound learning.

## Output

Findings first, verification status, remaining risk, evidence updates, and concise learning artifact when warranted.

# /cg-prototype

## Purpose
在生产实现前验证产品、交互或视觉方向。

## Self-Owned Skill Chain

```text
cg.intake -> cg.clarify -> cg.prototype -> cg.verify -> cg.review
```

## Route

1. `cg.intake` records the decision question and target audience.
2. `cg.clarify` resolves uncertain states and interactions.
3. `cg.prototype` builds a self-contained runnable prototype.
4. `cg.verify` exercises important states in the relevant browser or runtime.
5. `cg.review` records the selected direction and production boundary.

## Acceptance Gate

- The prototype answers a named decision question.
- Important states and interactions are exercised.
- Selected and rejected options are recorded.
- Prototype-only content is separated from production scope.

## External Adapters

Preferred adapters may include `skills:prototype`, `ce-prototype`, `gstack:design-html`, or browser QA.

## Output

`prototype.html`, optional screenshots, `design-decision.md`, verification evidence, and production boundary.

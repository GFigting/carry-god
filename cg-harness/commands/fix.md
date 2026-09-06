# /cg-fix

## Purpose
纠正当前错误行为，并保留复现、根因和回归证据。

## Self-Owned Skill Chain

```text
cg.intake -> cg.reproduce -> cg.diagnose -> cg.implement -> cg.verify -> cg.learn
```

## Route

1. `cg.intake` records expected and actual behavior.
2. `cg.reproduce` captures stable reproduction or an explicit reproduction limit.
3. `cg.diagnose` validates the direct root cause and rejects alternatives.
4. `cg.implement` applies a focused fix within the declared boundary.
5. `cg.verify` reruns reproduction and regression checks.
6. `cg.learn` captures systemic lessons when useful.

## Acceptance Gate

- Expected versus actual behavior is recorded.
- Root cause has supporting evidence.
- Fix boundary and changed files are listed.
- Reproduction after fix and regression evidence are recorded.

Complex, UI, data, permission, or performance bugs should also produce `bug-report.html` using the report template.

## External Adapters

Preferred adapters may include `superpowers:systematic-debugging`, `skills:diagnosing-bugs`, or `gstack:investigate`. Missing adapters trigger the fallback protocol.

## Output

Focused fix, regression evidence, diagnostic report when required, and remaining risk.

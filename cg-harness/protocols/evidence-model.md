# Evidence Model

Evidence proves a claim about a task. Each evidence item must identify what it proves and how it was obtained.

## Categories

```yaml
evidence:
  reproduction: []
  implementation: []
  verification: []
  review: []
  visual: []
  measurement: []
  delivery: []
```

## Item Shape

```yaml
- id: EVD-XXX
  category: verification
  claim: "The regression test passes"
  source: "command, file, screenshot, log, or manual observation"
  result: passed | failed | partial | not_run
  captured_at: "YYYY-MM-DD"
  limitations: []
```

## Completion Rules

- Every acceptance criterion maps to one or more evidence items.
- `not_run` is an explicit result, never an omitted result.
- A screenshot proves visible state, not backend correctness.
- A test result proves the executed test scope, not all behavior.
- A provider transcript is not evidence unless it points to independently checkable output.

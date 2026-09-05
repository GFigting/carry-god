# Status Model

CG Harness uses one task status model. Skills and providers do not create competing states.

```text
draft -> ready -> in_progress -> under_review -> done
                         |              |
                         v              v
                      blocked        revision

Any non-terminal state -> cancelled
Done -> archived
```

## Work Types

- `work`: new capability or ordinary engineering work
- `fix`: incorrect existing behavior
- `refactor`: internal structure improvement with preserved behavior
- `optimize`: measurable performance, cost, or workflow improvement
- `prototype`: future solution exploration
- `review`: inspection, verification, or learning capture

## Evidence Rule

A task may be marked done only when its acceptance evidence is recorded. A provider's response alone is not evidence.

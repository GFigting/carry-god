# Status Transition

CG Harness exposes a compact status model and maps it to GGFrame without creating a second task state machine.

## Canonical States

```text
draft -> ready -> in_progress -> under_review -> done -> archived
                     |                 |
                     v                 v
                  blocked           revision
```

Any non-terminal state may become `cancelled` only with a recorded reason.

## Mapping

| CG Harness | GGFrame equivalent | Meaning |
|---|---|---|
| draft | draft | intake exists but scope is incomplete |
| ready | ready or assigned | scope is executable; an owner may be assigned |
| in_progress | in_progress | work is actively running |
| under_review | under_review | output awaits review or acceptance |
| revision | revision | review found changes required |
| blocked | blocked | external condition prevents progress |
| done | done | acceptance evidence is complete |
| archived | archived | completed record is retained but inactive |
| cancelled | cancelled | work stopped with an explicit reason |

## Transition Guards

- `ready` requires intent, scope, and acceptance draft.
- `under_review` requires declared outputs and verification attempt.
- `done` requires evidence for every acceptance criterion and declared residual risk.
- `blocked` requires blocker, owner, and unblock condition.
- `revision` requires findings or failed acceptance criteria.
- `cancelled` requires reason and decision owner.

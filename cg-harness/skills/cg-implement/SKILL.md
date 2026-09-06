# cg-implement

## Purpose
Deliver the smallest complete change that satisfies the Task acceptance criteria.

## Trigger
Task is ready and its implementation boundary is understood.

## Inputs
Task, approved plan, context, repository rules, and acceptance criteria.

## Procedure
1. Implement one coherent slice at a time.
2. Preserve declared behavior and interfaces.
3. Keep unrelated cleanup out of the change.
4. Run focused checks as each slice completes.
5. Record changed files and decisions.

## Outputs
Changed code or artifact, tests where applicable, implementation summary, and pending verification items.

## Evidence
Diff, focused test results, and references to changed surfaces.

## Failure Handling
Stop at blockers, record the exact failure, and move the Task to `blocked` when progress cannot continue.

## Forbidden Behavior
Do not claim tests ran when they did not, bypass scope, or mark completion without cg-verify evidence.

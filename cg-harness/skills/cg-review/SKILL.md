# cg-review

## Purpose
Independently inspect a change for defects, regressions, risks, and missing evidence.

## Trigger
Task requests review or reaches a review gate.

## Inputs
Diff, Task scope, plan, acceptance, tests, evidence, and repository rules.

## Procedure
1. Establish review scope.
2. Inspect changed behavior and boundaries.
3. List findings first, ordered by severity.
4. Separate defects, risks, open questions, and accepted trade-offs.
5. Route required fixes back to `revision`.

## Outputs
Review report, findings, verification status, and follow-up action.

## Evidence
File and line references, test commands, screenshots, or reproducible observations.

## Failure Handling
Return an explicit incomplete review when source or evidence is unavailable.

## Forbidden Behavior
Do not make unrelated edits, approve from provider claims alone, or hide unresolved high-risk findings.

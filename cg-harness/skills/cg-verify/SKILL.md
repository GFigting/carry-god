# cg-verify

## Purpose
Determine whether acceptance criteria are supported by fresh, traceable evidence.

## Trigger
Implementation or artifact production claims the Task is ready for completion.

## Inputs
Task acceptance, changed surface, test results, manual checks, and operational constraints.

## Procedure
1. Check every acceptance item.
2. Distinguish passed, failed, skipped, and unavailable checks.
3. Register evidence through the CLI.
4. Record remaining risks and recommendation.
5. Allow completion only when all required items have passing evidence.

## Outputs
Verification matrix, evidence records, residual risks, and `finish` or `revision` recommendation.

## Evidence
Acceptance-linked files, commands, test output, screenshots, measurements, or review results.

## Failure Handling
Keep the Task in `under_review`, `revision`, or `blocked` when evidence is incomplete.

## Forbidden Behavior
Do not accept a provider response as evidence or recommend `done` with missing acceptance coverage.

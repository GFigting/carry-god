# cg-finish

## Purpose
Close a verified Task with an auditable summary and explicit residual risk.

## Trigger
`cg-verify` reports all required acceptance items as passed.

## Inputs
Task record, verification matrix, evidence, decisions, artifacts, and risks.

## Procedure
1. Run `cg check`.
2. Confirm every required evidence link is present.
3. Transition through the CLI to `done`.
4. Write a concise delivery summary.
5. Record follow-up work separately rather than reopening scope silently.

## Outputs
Done Task, completion event, delivery summary, and follow-up risks.

## Evidence
CLI check output, completion event, acceptance matrix, and artifact paths.

## Failure Handling
Refuse completion and return the missing evidence or invalid transition.

## Forbidden Behavior
Do not directly edit status JSON, close unverified work, or hide residual risk.

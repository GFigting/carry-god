# cg-task

## Purpose
Create and maintain the canonical CG Harness Task record.

## Trigger
The request has a bounded outcome or needs durable tracking.

## Inputs
Intake result, clarification decisions, scope, acceptance, and preservation rules.

## Procedure
1. Create a unique Task ID.
2. Write scope, exclusions, acceptance, risks, and next action.
3. Set the initial state to `draft`.
4. Use the CLI for all later state and evidence changes.

## Outputs
A valid `task.json`, initial `events.jsonl`, and Task summary.

## Evidence
Task creation event and references to all defining decisions.

## Failure Handling
Reject incomplete or contradictory records; keep the Task in `draft` until corrected.

## Forbidden Behavior
Do not create a second state machine, overwrite event history, or treat provider output as Task state.

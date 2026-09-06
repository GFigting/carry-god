# cg-plan

## Purpose
Turn a multi-file, cross-module, data, API, security, or release task into executable steps.

## Trigger
Task complexity or risk makes direct execution unsafe.

## Inputs
Task record, context, constraints, dependencies, and acceptance items.

## Procedure
1. Map affected surfaces and dependencies.
2. Define small implementation steps and checks.
3. Identify decisions, rollback boundaries, and risks.
4. Write a Markdown plan under the Task artifacts directory.
5. Keep the Task out of execution until the plan is accepted.

## Outputs
Implementation plan, dependency map, verification plan, and next action.

## Evidence
Plan path, reviewed decisions, and links from each acceptance item to a check.

## Failure Handling
Return `ask` when scope or acceptance is not stable; do not manufacture missing architecture facts.

## Forbidden Behavior
Do not treat a plan as implementation, silently include unrelated work, or mark the Task done.

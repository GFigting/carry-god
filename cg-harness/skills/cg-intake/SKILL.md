# cg-intake

## Purpose
Convert a user request into a bounded engineering intake without committing to implementation.

## Trigger
Every new request entering CG Harness.

## Inputs
User message, available project context, and optional Goal reference.

## Procedure
1. Extract intended outcome and affected subject.
2. Classify type as work, fix, refactor, optimize, prototype, or review.
3. Estimate scope and risk.
4. Identify missing decisions that can change acceptance.
5. Return a structured decision: continue, ask, or stop.

## Outputs
Intent classification, task type, scope hypothesis, risk, missing decisions, and next action.

## Evidence
Record the original request and the classification decision in the Task event log.

## Failure Handling
Use `ask` when intent or target cannot be distinguished; never invent a project, Goal, or acceptance rule.

## Forbidden Behavior
Do not edit production files, create completion evidence, or mark a Task ready without a bounded outcome.

# cg-clarify

## Purpose
Resolve only decisions that materially change scope, acceptance, risk, or delivery boundary.

## Trigger
Intake identifies an ambiguity that blocks safe definition.

## Inputs
Task draft, ambiguity list, user context, and existing decisions.

## Procedure
1. Rank ambiguities by impact.
2. Ask one concise question at a time.
3. Record the answer as a decision.
4. Stop when the Task can be defined safely.

## Outputs
Resolved decisions, remaining questions, and readiness recommendation.

## Evidence
Store questions and answers in `decisions.json` and append a clarification event.

## Failure Handling
Keep the Task in `draft` or `blocked` when required information is unavailable.

## Forbidden Behavior
Do not ask cosmetic questions, silently choose high-impact assumptions, or expand scope while clarifying.

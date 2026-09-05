# CG Harness Lite

CG Harness Lite is the lightweight user-facing layer built on GGFrame.

## User Commands

- `/cg-work` - build a feature or complete a general engineering task
- `/cg-fix` - fix a bug and produce an HTML diagnostic report when the issue is complex
- `/cg-refactor` - improve internal structure while preserving external behavior
- `/cg-optimize` - improve a measurable performance or efficiency metric
- `/cg-prototype` - create a product, interaction, or UI prototype
- `/cg-review` - review, verify, summarize, and compound the work

Natural language is also supported. The harness should infer the nearest command when the intent is clear.

## Core Objects

- Goal: why the work matters and the desired outcome
- Task: the bounded unit of work
- Context: project terms, architecture, rules, and prior decisions
- Evidence: plans, screenshots, tests, reports, and verification results

## Core Flow

```text
intake -> clarify -> plan -> build -> verify -> ship -> learn
```

Only the needed stages are activated. Small changes must not receive a large workflow by default.

## Design Rule

GGFrame owns goals, tasks, scope, evidence, and status. External projects provide capabilities. A skill may perform work, but it does not create a competing task state machine.

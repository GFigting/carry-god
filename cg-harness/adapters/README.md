# External Capability Adapters

CG Harness does not copy or replace external skill projects. It routes to them when installed and records the selected capability in the task evidence.

## GGFrame

GGFrame remains the source of truth for Goal, Task, Context, Evidence, and status. Legacy `as`, `fw`, `with`, and `mgmt` instructions are internal compatibility mechanisms, not the primary user interface.

## Superpowers

Use for clarification, implementation planning, TDD, systematic debugging, and completion verification.

## skills

Use for small composable engineering capabilities, especially architecture improvement, codebase design, domain modeling, prototype work, and code review.

## gstack

Use for product and design exploration, browser QA, visual review, benchmarking, security review, release, and deployment.

## compound-engineering-plugin

Use as the distribution and conversion layer for supported Agent hosts. It does not own task state or business decisions.

## Unavailable Capability

If a selected provider is unavailable, fall back to an equivalent installed capability where possible. Record the fallback. Never claim an unavailable skill ran.

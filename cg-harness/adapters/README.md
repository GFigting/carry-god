# External Capability Adapters

CG Harness owns the Task model, lifecycle, evidence gate, and completion decision. Adapters only connect optional external capabilities and translate their results into the CG protocol.

## Adapter Rule

CG Harness does not copy external skill projects. It may call them when installed, but every result must be recorded through the CG CLI. An adapter must never edit `task.json` status directly or claim `done`.

## Reference Providers

- GGFrame: optional source for legacy Goal and knowledge migration
- Superpowers: clarification, planning, TDD, debugging, and verification methods
- skills: composable engineering, architecture, domain modeling, prototype, and review methods
- gstack: product, browser QA, visual review, benchmarking, security, release, and deployment methods
- compound-engineering-plugin: optional distribution and host conversion layer

## Unavailable Capability

If a selected provider is unavailable, use the native CG skill or an equivalent provider where possible. Record `unavailable` or `fallback`, including the reason and replacement capability. Never claim an unavailable skill ran.

See `adapter-contract.md` for the structured input and output contract.

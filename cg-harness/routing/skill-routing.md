# Skill Routing

The harness selects capabilities internally. Users do not need to remember provider-specific commands.

| Work | Preferred capability | Optional capability |
|---|---|---|
| Clarify | `superpowers:brainstorming`, `skills/grill-with-docs` | `gstack/office-hours` |
| Plan | `superpowers:writing-plans`, `skills/to-spec` | `gstack/plan-eng-review`, `ce-plan` |
| Build | `skills/implement` | `superpowers:subagent-driven-development` |
| Fix | `superpowers:systematic-debugging`, `skills/diagnosing-bugs` | `gstack/investigate`, `gstack/qa` |
| Refactor | `skills/improve-codebase-architecture`, `skills/codebase-design` | `domain-modeling`, `ce-simplify-code` |
| Optimize | `gstack/benchmark`, `ce-optimize` | `plan-eng-review` |
| Prototype | `skills/prototype`, `ce-prototype` | `gstack/design-shotgun`, `gstack/design-html` |
| Review | `skills/code-review`, `gstack/review` | `gstack/codex`, security review |
| Ship | `gstack/ship`, `ce-commit` | project-specific release workflow |
| Learn | `ce-compound`, `gstack/learn` | GGFrame knowledge capture |

Routing must degrade gracefully when a provider or skill is unavailable. The harness keeps the task record and reports the missing capability instead of pretending it ran.

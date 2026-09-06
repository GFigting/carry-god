# Native Skills

CG Harness owns these baseline skills. Each skill works from Task files and structured results; external providers are optional enhancements only.

## Contract Names

| Contract id | Responsibility | Legacy runtime alias |
|---|---|---|
| `cg.intake` | classify request and risk | `cg-intake` |
| `cg.clarify` | resolve scope-changing decisions | `cg-clarify` |
| `cg.context` | establish reliable code context | `cg-explore` |
| `cg.plan` | produce bounded implementation plans | `cg-plan` |
| `cg.implement` | deliver the smallest complete change | `cg-implement` |
| `cg.reproduce` | capture stable issue reproduction | `cg-debug` |
| `cg.diagnose` | validate root cause and fix boundary | `cg-debug` |
| `cg.verify` | gate completion with evidence | `cg-verify` / `cg-test` |
| `cg.review` | inspect defects and residual risk | `cg-review` |
| `cg.ship` | perform controlled delivery handoff | `cg-finish` |
| `cg.learn` | capture reusable knowledge | `cg-learn` |

## Work-Type Contracts

- `cg.refactor-design` - define target structure and preservation matrix
- `cg.baseline` - establish comparable optimization measurements
- `cg.optimize` - apply and measure a bounded optimization
- `cg.prototype` - validate future product or interaction decisions

The dotted ids are the canonical contract names used by command routing. Existing `skills/cg-*` files remain compatibility documentation for the CLI runtime and are not a second task state machine.

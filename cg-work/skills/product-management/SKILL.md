---
name: product-management
description: Use when turning a product idea, request, or evidence into a grounded product definition with requirements, prioritization, roadmap, and acceptance criteria.
disable-model-invocation: false
---

# Product Management

Use this skill when the work starts with a product problem, user need, business goal, roadmap question, or request that is not yet ready for engineering. The skill defines what should be built, why it matters, for whom, and how the result will be accepted.

## Boundaries

- Stay read-mostly while defining the product. Do not modify project business code, data, permissions, configuration semantics, or external systems.
- Do not publish to an external issue tracker. Produce a reviewable product definition and hand it to the appropriate downstream skill.
- Do not invent unresolved business decisions. Record an open decision, its impact, and the user action needed to resolve it.
- Ground claims in the supplied project context, user evidence, business goals, research, or measurable signals. Mark assumptions explicitly.
- Use the current project's task and requirements references when they exist. Do not duplicate the original requirement package into a task artifact.

## Intake

Clarify one question at a time until the request has a stable problem, audience, outcome, and decision scope. Establish:

1. The user or customer affected and the workflow where the problem occurs.
2. The problem and evidence that make it worth addressing now.
3. The desired outcome and how it will be observed or measured.
4. Business, technical, regulatory, accessibility, or operational constraints.
5. Non-goals, dependencies, risks, and decisions that still require the user's answer.

If the request is already sufficiently specified, state the assumptions and proceed to the product artifact rather than repeating the interview.

## Product Artifact

Produce the following sections in order. A section may say `Not applicable` only with a reason and evidence.

## Problem

Describe the current situation, the user pain or opportunity, the evidence supporting it, and why solving it now is valuable. Separate observed facts from hypotheses.

## Users and goals

Name the primary user, affected secondary roles, user context, and the measurable product or business goal. State the non-goals and the boundary of the decision.

## User stories

Write independent, valuable, estimable, small, and testable stories using:

`As a <user>, I want <capability>, so that <outcome>.`

Keep each story independently deliverable where practical. Include unhappy paths, permissions, empty states, accessibility needs, and recovery behavior when they affect the user outcome.

## Functional requirements

Describe observable behavior, entry conditions, state changes, interactions, errors, permissions, and integration boundaries. Use numbered requirements so each one can map to an acceptance criterion and an implementation or ticket.

## Acceptance criteria

Use Given-When-Then statements for every behavior that decides whether the requirement is met:

`Given <precondition>, when <action>, then <observable result>.`

Include success, validation failure, empty, boundary, permission, and recovery cases that are in scope. Reject a requirement that cannot be observed or tested.

## Non-functional requirements

Record applicable expectations for performance, reliability, security, privacy, accessibility, compatibility, operability, and maintainability. Use measurable limits or reference an authoritative project standard; do not invent thresholds without evidence.

## Measurement

Define the primary outcome, guardrails, baseline source, target or decision threshold, exposure or cohort, and the events or data needed to evaluate the change. Never put user content or sensitive identifiers into proposed telemetry. If measurement is unavailable, state the instrumentation prerequisite instead of substituting a proxy silently.

## Prioritization

Rank requirements or stories using evidence-backed value, user impact, urgency, cost, dependency, and risk. Explain the method and inputs used. Label assumptions and unresolved trade-offs. Do not use priority labels as decoration: every P0 or must-have must be necessary for the stated goal, and dependencies must not require a lower-priority item to ship first without explanation.

## Roadmap and backlog

Group accepted work by outcome or theme, not only by component. For each slice, record the intended result, timeframe or sequencing, dependencies, risks, and the evidence that will move it from discovery to ready. Keep exploratory ideas separate from committed work. The roadmap is directional; exact implementation estimates belong with the engineering plan.

Persist this section in the project roadmap **inside the original project repository** (conventionally `docs/roadmap.md`), and register that path relative to `project.root_path` in the project context under `product.roadmap_path`. Use `core/project-roadmap.template.md`: one row per slice carrying status (`proposed`/`ready`/`in_progress`/`review`/`done`/`deferred`/`dropped`), priority, dependency, requirement source, task reference, and the evidence that moves it to ready. Validate it with `node scripts/check-product.mjs <path>`. Do not put the project roadmap under the framework's `local/projects/`, and do not reuse the per-requirement decomposition index under `roadmaps/<roadmap-id>/` for project-level planning.

## Release acceptance

At release review, compare planned and delivered requirements, list accepted and rejected criteria with reasons, identify known gaps and follow-up work, report measurement readiness, and recommend ship, hold, limited rollout, or stop. Every rejection must point to the unmet criterion or evidence gap.

## Handoffs

- `framework:product-management` defines the product intent, scope, priorities, and acceptance evidence.
- `framework:to-spec` turns a confirmed definition into a publishable specification. It owns issue-tracker publication when configured.
- `framework:to-tickets` turns an approved plan or specification into independently verifiable tickets and blocking edges.
- `framework:feature-development` owns implementation, code changes, testing, review, and integration. Product management is an optional product-facing prerequisite, not a mandatory ceremony for every technical change.

When handing off, include the source requirement reference, confirmed decisions, open decisions, acceptance criteria, measurement prerequisites, and explicit non-goals. Preserve the distinction between a product decision and an implementation choice.

## Completion Checklist

- The problem and affected user are explicit and evidence is separated from assumptions.
- Goals, non-goals, constraints, and open decisions are recorded.
- Each in-scope story maps to observable functional behavior.
- Each behavior has Given-When-Then acceptance criteria, including relevant failure paths.
- Non-functional and measurement needs are either specified or explicitly marked not applicable with a reason.
- Priorities and roadmap sequencing have evidence and dependency rationale.
- The release decision can be made from the listed criteria and evidence.
- The handoff target is named, and no external or code-changing action was taken implicitly.

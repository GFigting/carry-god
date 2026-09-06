# cg-test

## Purpose
Design and run focused tests that prove the Task's acceptance and preserved behavior.

## Trigger
A Task has behavior that can be specified or regression-tested.

## Inputs
Acceptance criteria, changed surface, existing test conventions, and risk profile.

## Procedure
1. Map each acceptance item to a check.
2. Add the smallest meaningful test before or with the change.
3. Run focused tests, then broaden when risk requires it.
4. Record commands, environment, and results.

## Outputs
Test cases, test output, coverage gaps, and recommendation.

## Evidence
Reproducible command, output path, test name, and environment details.

## Failure Handling
Report flaky, unavailable, or failed tests distinctly; do not convert an unrun test into a pass.

## Forbidden Behavior
Do not test only implementation details when behavior is the contract or delete failing tests to obtain green output.

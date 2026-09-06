# cg-debug

## Purpose
Diagnose incorrect behavior through reproducible evidence and focused regression proof.

## Trigger
A fix Task reports a failure, incident, or unexpected result.

## Inputs
Expected behavior, actual behavior, reproduction steps, logs, code context, and constraints.

## Procedure
1. Capture expected versus actual behavior.
2. Reproduce or document why reproduction is unavailable.
3. Form and test one hypothesis at a time.
4. Identify the direct cause and apply a focused fix.
5. Add regression coverage and rerun reproduction.

## Outputs
Root-cause note, focused fix, regression test, and verification result.

## Evidence
Before/after reproduction, test output, logs, traces, or diagnostic report.

## Failure Handling
Keep the Task blocked or under investigation when cause or reproduction remains uncertain.

## Forbidden Behavior
Do not make speculative batches of fixes, confuse symptoms with cause, or omit failed attempts.

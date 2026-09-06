# CG Prototype

## Purpose
通过可运行原型验证产品、交互或视觉决策，不把原型伪装成生产实现。

## Inputs
- task_record
- decision_question
- target_states
- interaction_scope

## Procedure
1. 明确原型要回答的决策问题。
2. 实现关键状态和交互。
3. 在相关浏览器或运行环境中检查。
4. 记录选中方案、拒绝方案和生产边界。

## Outputs
- prototype_artifact
- interaction_evidence
- design_decision
- production_boundary

## Completion Gate
原型可运行，关键状态被验证，且明确哪些内容不能直接进入生产。

## Adapter Hooks
可使用 prototype、design-html、design-shotgun 或 browser QA 能力。

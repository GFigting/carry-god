# CG Learn

## Purpose
把经过验证且可复用的决策、问题和方法沉淀为知识。

## Inputs
- task_record
- decision_log
- verification_result
- review_result

## Procedure
1. 判断是否存在可复用知识或系统性问题。
2. 提取适用范围、结论和限制。
3. 写入目标知识位置并关联任务证据。
4. 不重复记录纯过程噪音。

## Outputs
- learning_artifact
- knowledge_path
- reuse_conditions
- follow_up_items

## Completion Gate
知识结论有来源任务和适用边界；没有价值时明确记录无需沉淀。

## Adapter Hooks
可使用 compound、learn 或 GGFrame 知识沉淀机制，但归档位置服从项目约定。

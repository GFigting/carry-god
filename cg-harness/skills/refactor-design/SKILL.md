# CG Refactor Design

## Purpose
定义目标结构并证明外部行为保持不变。

## Inputs
- task_record
- context_package
- current_dependency_map
- preserve_rules

## Procedure
1. 描述当前责任和依赖问题。
2. 设计目标边界与迁移顺序。
3. 明确接口、业务规则、数据和运维属性的保留项。
4. 为每个迁移步骤安排行为验证。

## Outputs
- target_structure
- migration_plan
- preservation_matrix
- structural_evidence

## Completion Gate
目标结构、迁移阶段和保留行为均可检查，不混入新功能或无关修复。

## Adapter Hooks
可使用 architecture、codebase-design 或 domain-modeling 能力，但最终保留矩阵由 CG Harness 管理。

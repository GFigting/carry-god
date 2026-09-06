# CG Context

## Purpose
为一次任务组装最小充分的项目上下文包。

## Inputs
- task_record
- project_registry
- relevant_files
- prior_decisions

## Procedure
1. 定位项目和技术栈。
2. 收集架构入口、相关文件、约束和既有决策。
3. 明确允许修改、禁止修改和验证边界。
4. 记录上下文来源与更新时间。

## Outputs
- context_package
- source_paths
- constraints
- context_gaps

## Completion Gate
执行者无需重新猜测项目、目标、相关面和禁止范围。

## Adapter Hooks
可使用 CodeGraph、项目索引或外部探索能力，但必须保留来源路径。

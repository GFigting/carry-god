# 任务执行模式显式化

任务框架需要明确区分标准执行和轻量执行，避免文档允许“标准任务”但任务校验器拒绝 `execution_profile: standard`。

目标：

- 校验器接受 `execution_profile: standard`，并沿用标准任务的计划、审查、验证和学习门禁。
- `execution_profile: lightweight` 继续只适用于 `framework:bugfix`，保留现有精简证据门禁。
- 未填写 `execution_profile` 的历史任务继续按标准模式兼容处理。
- 工作流和脚本文档说明两个显式值及默认兼容规则。

验收标准：

- 显式 `standard` 任务可通过待处理状态校验。
- 显式 `standard` 任务进入 `review`/`done` 时仍要求标准证据。
- 未知执行模式仍被拒绝，轻量模式既有约束不回归。
- 框架全量校验、单元测试和任务校验通过，版本按兼容新增升级次版本。

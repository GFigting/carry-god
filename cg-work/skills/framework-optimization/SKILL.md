---
name: framework-optimization
description: Use when improving cg-work's rules, workflows, templates, validators, directory conventions, or framework-native skills; not for project business-code refactors.
---

# 框架优化

## 优化前检查

在制定变更地图前，完成以下检查：

- 对同一约束核对 core、workflow、skill、入口文档与校验器；core 定义不变量，workflow 定义阶段和路由，skill 定义执行方法。
- 确认新增或修改的技能是框架自有技能还是上游镜像；两者分别遵循对应的维护与校验路径。
- 将每项文档声明对应到其唯一实现，并通过适当的校验或可观察行为验证，而非仅凭文档文字判断。
- 新增回归测试时，先确认失败原因指向目标规则本身，不被无关的既有错误掩盖。

先读取 [框架维护](../../core/framework-maintenance.md)，再将优化证据整理为可审查的变更地图：问题事实、受影响唯一来源和调用方、非目标、兼容性判断、迁移或替代说明，以及验证范围。

计划确认后，逐个修改变更地图中的唯一来源并同步直接引用。新增框架自有技能时，确认其名称、目录和工作流引用一致；处理镜像时，按 core 中的镜像规则同步。将实际变更和验证结果写入任务记录，供审查与交付使用。

# 验证记录

## standards_preflight

已检查新增流程标识和工作流引用；`existing-project`、`new-project`、`needs-clarification` 与 `framework:project-discovery` 作为协议字面量保留在技能、工作流和测试中，未新增运行时代码或未抽取的业务常量。

## 自动化验证

- `npm test`：通过，35 个测试全部通过。
- `node scripts/check-all.mjs`：通过。
- `node scripts/check-project.mjs local/projects/cg-work/project-context.yaml`：通过。
- `node scripts/check-task.mjs local/projects/cg-work/tasks/2026-09-26-project-discovery-onboarding/task.yaml`：通过。

## 差异检查

已人工检查当前差异：新增识别阶段只影响入口路由和规则文档；现有 `framework:project-initialization` 的探测、上下文字段和确认门禁保持不变。

# 自动决策预检可见化实施计划

## 目标

在工作流路由前增加可见的决策预检简报，区分可自动推进与必须用户确认的事项，并规范 `grilling` 的建议触发。

## 范围

### 包含

- 在核心特殊操作规则中定义预检输出、风险分级和确认门禁。
- 更新 `grilling` 技能，使其先展示预检再进入用户访谈。
- 更新入口文档并添加协议回归测试。

### 不包含

- 不实现新的运行时风险评分器或任务 YAML 字段。
- 不改变 `grilling` 的设计树访谈方法。

## 需求与验收

- 需求来源：`../../requirements-inbox/2026-09-26-decision-preflight-visible.md`
- 验收标准：见需求包；覆盖自动建议可见、高风险确认和引用一致性。

## standards_preflight

- 流程字面量 `low`、`medium`、`high`、`irreversible` 和 `decision_preflight` 只作为协议示例保留在文档与测试中，允许不抽取为运行时代码常量。

## 实施步骤

1. 更新 `core/special-operations.md`，定义统一预检简报和风险门禁。
2. 更新 `skills/grilling/SKILL.md`、README 和工作流引用。
3. 增加文档协议测试，运行全量检查。

## 计划审核

- 需求覆盖：完整。
- 范围边界：无越界，不引入运行时评分器。
- 依赖与顺序：核心规则先行，技能和入口随后同步。
- 验收与验证：测试检查关键字段、风险等级和确认门禁。
- 风险与回滚：仅文档/技能协议变更，可按文件回滚。
- 审核结论：通过。
- 审核意见来源：主 Agent 自审。

## 验证

- 自动化测试：`npm test`
- 静态检查：`node scripts/check-all.mjs` 和 `node scripts/check-task.mjs ...`

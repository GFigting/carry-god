# 任务范围与证据边界框架优化计划

**Goal:** 让同一需求包可复用，但让新增验收范围拥有独立任务和独立证据边界。

**Architecture:** 在核心规则中明确“需求包复用”和“任务复用”的边界；为需要延续或拆分的任务增加 `scope_decision` 元数据；由 `check-task.mjs` 校验决策结构及延续任务的前置任务和计划引用。

**Tech Stack:** Markdown、Node.js ECMAScript modules、js-yaml、Node test runner。

**Spec:** `../../requirements-inbox/2026-09-23-agentic-delivery-governance.md`

## standards_preflight

- 业务字面量仅限任务范围决策枚举 `independent`、`continuation`；允许例外为校验器错误提示和文档示例。
- 不新增任务状态，不改变既有任务证据生命周期；历史任务在未声明 `scope_decision` 时保持兼容。

## 实施步骤

1. 在 `core/operating-model.md`、`core/context-loading.md` 和 `README.md` 补充范围变化与任务拆分规则。
2. 在 `check-task.mjs` 增加 `scope_decision` 结构、前置任务引用和计划文件校验。
3. 增加校验器测试，覆盖独立任务和缺少延续理由的失败场景。
4. 运行全量测试、任务校验和差异检查。

# 原始需求：需求包按需生成（2026-10-07）

## 原始需求（用户意见，一页内）

需求文档不应成为“每件事都必须生成的仪式性文件”。合理的判断标准是：

- 需求是否复杂、模糊，后续是否可能被重新解释；
- 是否会拆成多个任务；
- 是否涉及用户确认、范围边界或重要取舍；
- 是否需要保留原始需求，避免实现记录替代原意。

明确的小改动直接写在任务 `plan.md` 或决策记录里就够了；强行再生成需求文档只是重复维护两份内容，增加漂移风险。

## 范围

- 在 `core/operating-model.md` 增加「需求包留存判断」四项清单：任一为“是”才建需求包；四项全“否”直接写 `plan.md`/决策记录，省略 `requirements_reference`。
- 放宽 README、`core/context-loading.md`、`workflows/bugfix.md`、`workflows/feature-development.md`、`local/README.md` 中“必须先存需求箱”的强制措辞为按需引用。
- 补文档一致性测试；校验器行为不变（`requirements_reference` 本就可选）。

## 非目标

- 不改变需求箱目录约定、`requirements_reference`/`requirements_reference_note` 字段语义。
- 不迁移历史需求包与任务记录。
- 不放松“新增业务规则/接口/数据/独立验收标准必须新建 task”的范围边界规则。

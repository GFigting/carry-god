# 子智能体协作审核协议实施计划

## 目标

定义实施前计划审核时，子智能体的角色、输入、输出和主 Agent 的收敛责任。

## 范围

### 包含

- 在功能开发流程和代码审查技能中定义计划审核模式。
- 明确需求审核线、规范审核线和主 Agent 的职责边界。
- 固定“问题—依据—建议”的输出格式及用户取舍边界。

### 不包含

- 任务证据生命周期的完整说明，由后续 `2026-09-23-task-evidence-lifecycle` 负责。
- 业务周报的人机协同交付，由后续 `2026-09-23-business-weekly-report-handoff` 负责。
- 新增 `plan-review.md`、任务状态或自动校验门禁。

## 需求与验收

- 需求来源：`../../requirements-inbox/2026-09-23-agentic-delivery-governance.md`
- 验收标准：
  - [ ] `feature-development.md` 明确何时触发计划审核及三方职责。
  - [ ] `code-review/SKILL.md` 提供计划审核的双轴输入、输出和用户边界。
  - [ ] 两条审核线均使用“问题—依据—建议”，主 Agent 汇总并写回 `plan.md`。
  - [ ] 计划审核不替代用户对业务取舍和最终验收的决定。

## 影响范围

- 工作流：`workflows/feature-development.md`
- 协作技能：`skills/code-review/SKILL.md`
- 任务证据：本任务的 `plan.md`、`review.md`、`verification.md`

## 依赖与顺序

1. 读取 `core/plan.template.md`、功能开发流程、代码规范和原始需求。
2. 由需求审核线和规范审核线并行检查本计划。
3. 主 Agent 合并意见，修订本计划和协议文档。
4. 执行任务校验、测试和差异检查。

## standards_preflight

- 业务字面量：无新增业务字面量；“问题—依据—建议”是协议格式，不进入业务代码。
- 允许例外：本任务仅修改 Markdown 和任务记录，不适用代码格式化器。

## 计划审核

- 需求审核线检查需求覆盖、验收标准和范围越界。
- 规范审核线检查计划结构、依赖、风险、验证可执行性和项目规范。
- 主 Agent 汇总两条意见，修订 `plan.md` 并保留结论；子智能体不直接替代用户验收。

## 验证

- 文档链接和流程引用检查：`node scripts/check-all.mjs`，预期不新增本任务相关告警。
- 全量测试：`npm test`，预期全部通过。
- 任务校验：`node scripts/check-task.mjs local/projects/cg-work/tasks/2026-09-23-agent-review-protocol/task.yaml`，预期通过。
- 差异检查：`git diff --check`，预期通过。

## 风险与交付

- 风险：协议只改变文档指导，不会自动触发子智能体；主 Agent 必须根据工作流判断是否调用。
- 兼容性：不新增任务必填字段，历史任务无需迁移。
- 回退：删除新增的协议段落即可恢复原有文档行为，不影响任务状态机。

# 框架子智能体调用时机优化实施计划

## 目标

新建框架自有技能 `subagent-dispatch-timing`，作为子智能体派发判据的唯一来源，统一"何时派发/何时不派发/各阶段如何派发"，收敛 workflows 中的分散表述为指针引用，并把 browser-use 验证派发惯例落入框架文档。

## 范围

### 包含

- 新建 `skills/subagent-dispatch-timing/SKILL.md`（框架自有技能，中文正文）。
- `workflows/feature-development.md`：L28 派发比例原则段与 L32-40 计划两线审核段收敛为指针引用，frontmatter 增加技能引用。
- `workflows/bugfix.md`、`workflows/review.md`：补充一行指针引用与 frontmatter 引用。
- `skills/README.md`：框架自有技能清单登记。
- 新增 `test/subagent-dispatch-timing.test.mjs` 一致性测试（参照 `product-management-skill.test.mjs` 先例）。
- `VERSION` 升级次版本（新增兼容能力）。

### 不包含

- 不修改原始镜像技能（`dispatching-parallel-agents`、`subagent-driven-development`、`executing-plans`）正文；新技能只引用不复制。
- 不修改 `core/operating-model.md` L145（"子智能体意见由主 Agent 汇总写回"属 core 不变量，保留）。
- 不修改 `core/special-operations.md` L27 场景表（授权边界，职责不同）。
- `workflows/refactor.md` 声明"技能加载一律按 feature-development 执行"，无需单独改动。
- 不改变任务状态机与证据门禁。

## 需求与验收

- 需求来源：用户口头需求"框架子智能体调用时机优化"；已确认四项核心目标（统一调用时机判据、覆盖全部工作流、纠正实际派发偏差、补充验证阶段派发规则）与落点方式（新建框架自有技能）。
- 验收标准：
  - [ ] 新技能含分阶段派发判据（计划、实现、验证、审查收尾）与"不派发"条件，判据可客观判定
  - [ ] 验证阶段判据覆盖 browser-use 派发：按项目上下文 `verification.profiles` 配置派发、结果回写 `verification.md`、纯浏览器验收的边界声明
  - [ ] `workflows/feature-development.md` 不再保留派发判据正文，只留指针（消除双来源）
  - [ ] bugfix、review 工作流存在指向新技能的引用
  - [ ] `skills/README.md` 框架自有技能清单包含新技能
  - [ ] `npm run check` 与 `npm test` 全绿

## 判据设计（技能正文核心口径）

### 总则：比例原则

默认最小交付；只在派发有明确增益时派发子智能体，增益只有三类：

1. **上下文隔离**：任务局部上下文足够、主会话上下文需要保护（大体量输出、长探索）。
2. **并行**：可拆分为互不重叠边界的独立工作。
3. **独立视角**：需要不受实施者立场污染的审查或验收结论。

无以上增益、单模块小刀改动可直接验证时，不派发。

### 分阶段判据

| 阶段 | 派发条件 | 不派发条件 | 关键约束 |
|---|---|---|---|
| 计划审核 | 跨模块、高风险或用户要求审查时，双子智能体两线并行（需求审核线/规范审核线） | 轻量档与单模块小刀不做计划审核派发 | 同一子智能体不同时代表需求方与规范方作最终结论 |
| 实现 | 多任务计划执行（引用 `subagent-driven-development`/`executing-plans`/`dispatching-parallel-agents` 镜像，不复制正文）；需要并行时按文件所有权切分边界 | 单任务、单文件、可直接实施时主 Agent 亲自完成 | 实现类子代理永不并行派发（文件冲突）；同形状小改动合并为一次派发；实现子代理不得再派发子代理 |
| 验证 | Web 验收统一派发 browser-use 子代理，按项目上下文 `verification.profiles` 配置步骤执行 | 无浏览器界面或无对应 profile 时不派发 browser-use | 结果回写 `verification.md` 作为任务证据；必须区分已通过/环境受限未执行/不适用，不得以替代检查冒充完整检查；纯浏览器验收不覆盖数据库字段与日志类校验，需结合接口/数据层校验 |
| 审查收尾 | 审查类子智能体可并行（如规范审查与需求审查分线） | 轻量档自审即可 | 主 Agent 汇总意见、决定是否采纳并写回记录；不代替子代理修复；涉及业务取舍交用户确认 |

### 派发契约（主 Agent 责任）

- 派发词只含该任务自身所需：任务定位一句话、需求/简报文件路径、上游接口与决定、报告回写路径；不粘贴会话历史与累积摘要。
- 交付物以文件回传，避免大体量内容驻留主上下文。
- 子智能体意见由主 Agent 汇总后写回任务记录（core 不变量）。

### 反模式（纠正实际派发偏差）

- **该派不派**：Web 验收跳过 browser-use 派发、用静态检查或口头声明冒充页面验收结论。
- **过度派发**：轻量任务派发子智能体；逐条发现各派一个修复代理；为同一差异重复派发多个审查席位。
- **错误并行**：并行派发多个实现子代理造成文件冲突。

## 测试用例

| 用例编号 | 所属模块 | 用例标题 | 前置条件 | 测试步骤 | 预期结果 | 优先级 | 测试层级 |
|----------|----------|----------|----------|----------|----------|--------|----------|
| TC-001 | scripts | 工作流技能引用有效性 | 新技能目录与 workflows 改动完成 | 运行 `npm run check` | 全部校验通过，`framework:subagent-dispatch-timing` 引用可解析 | P0 | runtime |
| TC-002 | test | 新技能一致性测试 | SKILL.md 与测试文件完成 | 运行 `npm test` | 新测试与存量测试全部通过 | P0 | runtime |
| TC-003 | docs | 双来源消除核对 | feature-development.md 改动完成 | grep workflows 目录检索"比例原则""实现类子代理不并行"等判据正文 | 判据正文仅存在于新技能，workflows 只有指针 | P1 | runtime |
| TC-004 | docs | 索引与版本登记 | skills/README.md 与 VERSION 改动完成 | 人工读取两处文件 | 自有技能清单含新技能；VERSION 升至 2.32.0 | P1 | runtime |

## 影响范围

- 文件：`skills/subagent-dispatch-timing/SKILL.md`（新增）、`workflows/feature-development.md`、`workflows/bugfix.md`、`workflows/review.md`、`skills/README.md`、`test/subagent-dispatch-timing.test.mjs`（新增）、`VERSION`
- 调用方和依赖方：`scripts/check-all.mjs` 对工作流 frontmatter 技能引用的校验（自动覆盖）；`core/templates/plan.template.md` 计划审核章节（不改动，兼容）

## 实施步骤

1. 编写 `skills/subagent-dispatch-timing/SKILL.md`（按上述判据设计）。
2. 收敛 `workflows/feature-development.md` 两段正文为指针，frontmatter 增加 `framework:subagent-dispatch-timing`。
3. `workflows/bugfix.md`、`workflows/review.md` 补指针与 frontmatter 引用。
4. `skills/README.md` 登记框架自有技能。
5. 新增 `test/subagent-dispatch-timing.test.mjs`。
6. `VERSION` 2.31.0 → 2.32.0。
7. 运行 `npm run check` 与 `npm test`，回写 `verification.md`。
8. review 阶段统一收尾，写 `review.md`，流转任务等待用户验收。

## 计划审核

适用于跨模块、高风险或用户明确要求审查的任务；本任务为框架规则层变更、可逆（git），采用主 Agent 自审结论。

- 需求覆盖：完整（四项确认目标均有对应落点：判据统一→技能唯一来源；覆盖全部工作流→feature/bugfix/review 指针，refactor 继承；纠正偏差→反模式节；验证阶段→browser-use 派发规则）。
- 范围边界：不改镜像技能正文、不动 core 不变量，无越界。
- 依赖与顺序：技能正文先于 workflows 指针（引用需可解析）；测试与版本最后。
- 验收与验证：`npm run check`/`npm test` 命令明确，TC-003/004 可客观核对。
- 风险与回滚：主要风险为判据与镜像技能口径冲突，以"引用不复制"规避；回滚为 git revert。
- 审核结论：通过（判据设计待用户确认后实施）。
- 审核意见来源：主 Agent 自审 + 用户确认落点与目标。

## 验证

- 自动化测试：`npm test`
- 静态检查：`npm run check`
- 人工核对：TC-003 双来源 grep、TC-004 索引与版本登记

## 风险与交付

- 风险和环境限制：无外部依赖；本地 Node 环境即可。
- 集成方式：保留本地 commit（框架文件与任务记录分开提交），推送需单独授权。

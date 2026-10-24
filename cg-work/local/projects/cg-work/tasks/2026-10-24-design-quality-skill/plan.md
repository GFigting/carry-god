# design-quality 技能实施计划

## 目标

为 cg-work 新增一个框架本地化技能 `framework:design-quality`，把 impeccable 与 taste-skill 的有效方法固化为框架内可执行的"设计决策 + 验收门"，使 UI 工作有统一入口、可测量标准和指令优先级。

## 范围

### 包含

- 新增 `skills/design-quality/`：`SKILL.md` 只做路由与流程骨架；判定细则拆入 `references/` 七篇——`design-context.md`、`instruction-contract.md`、`gate-pages.md`、`gate-app-screens.md`、`scorecard.md`、`change-order.md`、`measurement.md`、`report.md`（共八篇，含模板）。
- 明确写入"用户明确指令优先于通用设计规则"及其记录方式。
- 更新 `skills/README.md` 的本地化技能与特殊技能索引，`VERSION` 升次版本号。

### 不包含

- 不修改原始镜像技能（含 `prototype`）的任何文件。
- 不改造 `baoyu-design` 的生成流程与模板；它仍负责产出，本技能只负责决策与验收。
- 不复制两份上游技能的正文、reference 目录或脚本，不引入 Node 脚本依赖。
- 不新增工作流、不改 `review` 工作流声明。

## 需求与验收

- 需求来源：用户要求"让框架学习两者优点"，此前已确认痛点为"改页面设计不听使唤"。
- 验收标准：
  - [ ] `skills/design-quality/SKILL.md` 只做路由，不重复细则；声明本地覆盖规则与两处上游来源及许可。
  - [ ] 每篇 reference 自含判定细则、测量方法、边界与反例，并附可复制模板；门禁区分页面与后台界面。
  - [ ] 明确"用户指令优先 + 让位规则记录"条款，并给出改前三行回执格式。
  - [ ] `skills/README.md` 与 `VERSION` 已同步，`npm run check` 通过。

## 影响范围

- 文件、模块、接口或数据：`skills/design-quality/`、`skills/README.md`、`VERSION`
- 调用方和依赖方：`skills/prototype`、`skills/baoyu-design`、`workflows/review.md` 的使用者（只读引用，不改其正文）

## 实施步骤

1. 建立任务记录并确认唯一来源（`core/framework-maintenance.md`、`skills/README.md`）。
2. 编写 `skills/design-quality/SKILL.md`，正文为本框架重写，不搬用上游原文。
3. 更新技能索引与版本号，保持单一来源，不在工作流中重复正文。
4. 运行 `npm run check`，回写验证结论与下一步。

## 计划审核

- 需求覆盖：完整，痛点"不听使唤"对应指令优先级与改前回执两条硬条款。
- 范围边界：无越界；不触碰镜像与生成管线。
- 依赖与顺序：先技能正文，再索引与版本，最后校验。
- 验收与验证：验收条件均为文件内可观察项，校验命令明确为 `npm run check`。
- 风险与回滚：主要风险是与 `baoyu-design` 职责重叠；以"只做决策与验收、不做产出"划界，回滚为删除技能目录并还原索引与版本。
- 审核结论：通过
- 审核意见来源：主 Agent 自审

## 验证

- 自动化测试：`npm test`（项目上下文已登记，按需执行）
- 静态检查或构建：`npm run check`
- 页面、接口或用户验收：无 UI 产物，按文档审阅验收

## 风险与交付

- 风险和环境限制：技能为文字规则，无脚本度量；无浏览器测量能力时以人工截图为降级路径，并在报告声明。
- 集成方式：保持本地，等待用户验收后提交

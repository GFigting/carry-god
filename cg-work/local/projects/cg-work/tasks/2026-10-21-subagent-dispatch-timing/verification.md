# 验证记录：框架子智能体调用时机优化

新鲜验证于 2026-10-21 在本地 Node 环境执行，全部为 runtime 层级（本任务为框架规则与文档变更，无浏览器、接口、数据库验收面）。

## 自动化测试与静态检查

- `npm run check`：通过（输出 `cg-work checks passed`），覆盖工作流技能引用、链接与锚点、受管项目记录校验。TC-001 通过。
- `npm test`：51 项全部通过、0 失败，含本任务新增 `test/subagent-dispatch-timing.test.mjs` 的 2 项（技能判据契约完整性、workflows 仅存指针）。TC-002 通过。

## 人工核对

- TC-003 双来源消除：grep `workflows/` 目录检索"比例原则、需求审核线、规范审核线、不并行派发、审查类可并行"，无匹配——判据正文仅存在于 `skills/subagent-dispatch-timing/SKILL.md`，workflows 三处均为指针引用。通过。
- TC-004 索引与版本登记：`skills/README.md` 框架自有技能清单已含 `subagent-dispatch-timing` 并声明"引用镜像不复制"；`VERSION` 为 `2.32.0`（新增兼容能力，升次版本）。通过。

## 标准编码前置检查

本任务仅新增/修改 Markdown 文档与测试夹具，不引入状态、类型、路由、接口、阈值或业务字面量，常量化检查不适用；静态检查以 `npm run check` + `npm test` 为验证入口，如实记录为自动通过。

## 结果分类

- 已通过：TC-001、TC-002、TC-003、TC-004。
- 环境受限未执行：无。
- 不适用：browser/api/data 层级验收（纯文档规则变更，无对应界面、接口或数据行为）。

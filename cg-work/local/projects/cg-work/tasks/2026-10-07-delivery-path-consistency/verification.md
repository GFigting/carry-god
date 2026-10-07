# 验证记录

执行时间：2026-10-07 16:35–17:05 +08:00（核对方式：命令输出实录）

## 验证命令与结果

| 命令 | 结果 | 说明 |
|---|---|---|
| `npm run check`（`node scripts/check-all.mjs`） | 通过 | 框架结构、文档锚点（含新增 `#交付路径与两个声明字段`、`#轻量执行决策清单`、`#交付路径升级`）、工作流引用、框架受管项目记录全部有效 |
| `node --test "test/*.test.mjs"` | 通过：87 tests、87 pass、0 fail | 含新增用例：拒绝 lightweight+compact、接受 standard+compact、文档-校验器一致性 2 项 |
| `node scripts/check-task.mjs local/projects/cg-work/tasks/2026-10-07-delivery-path-consistency/task.yaml` | 通过 | 本任务记录字段、引用、状态门禁合规 |
| 负向探针：lightweight+compact 夹具 | 按预期被拒 | 错误消息 “lightweight 与 artifact_profile: compact 不能同时声明”，由 `test/check-task.test.mjs` 断言钉住 |

## 文档-校验器一致性核对（2026-10-07）

- `check-task.mjs` 允许集合：`lightweightWorkflows = {framework:bugfix, framework:feature-development}`；`workflows/README.md`、`scripts/README.md`、`core/continuous-learning.md`、`core/operating-model.md` 的表述已逐一与之对齐，由 `test/delivery-path-consistency.test.mjs` 断言防回归。
- 组合规则表行为与校验器一致：standard+compact 仍被接受（既有 compact 用例 + 新用例）；lightweight+compact 被拒（新用例）。

## standards_preflight

- 项目自动检查：`npm run check`、`node --test "test/*.test.mjs"` 均为框架自带工具，实际执行并记录如上。
- 当前差异人工检查：本次差异仅涉及框架规则文档、校验器、测试、路由说明与 `VERSION`；未修改任何业务项目文件、镜像技能、外部系统或生产数据（核对方式：逐文件清单见 plan.md 的受影响唯一来源表）。
- 不适用项：项目业务代码 lint/构建、页面或接口验收（框架仓库无业务运行入口）。

## 未验证项

- 未在业务项目中实战演练“轻量执行升级为标准执行”的完整过程（规则为文档与校验行为，无运行时）；建议在下一次真实轻量任务遇到升级触发器时按新规则执行并回看。

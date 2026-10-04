# 废弃 initialization-report.md

## 问题事实

| 编号 | 事实 | 证据 |
|---|---|---|
| P1 | `initialization-report.md` 是初始化阶段的一次性探测报告，事实腐烂最快 | 各项目报告记录的是当时的探测范围与未确认项，与工作模型的"现状证据保鲜"要求冲突 |
| P2 | 耐久信息已有承载 | 项目根路径、技术栈、文档与验证入口均在 `project-context.yaml`；缺口与待确认项属于任务过程事实 |
| P3 | 框架方向是减少预创建产物 | `artifact_profile: compact`、最小充分流程、任务证据生命周期 |
| P4 | 引用分散在 5 个框架文件 | `local/README.md`、`core/project-onboarding.md`、`workflows/project-initialization.md`、`skills/project-initialization/SKILL.md`、`skills/project-discovery/SKILL.md` |

## 受影响唯一来源

| 唯一来源 | 变更 |
|---|---|
| `local/README.md` | 结构清单移除该产物；增加废弃替代说明（历史文件保留、不再新增、缺口改记任务记录） |
| `core/project-onboarding.md` | "初始化报告必须记录原始项目路径、ID 和重名判断" → 改由初始化任务记录承载；数据边界条目同步 |
| `workflows/project-initialization.md` | 探测缺口与待确认项写入初始化任务记录 |
| `skills/project-initialization/SKILL.md` | 删除生成该产物的步骤并重排编号；两处"在初始化报告中说明/记录缺口"改为初始化任务记录 |
| `skills/project-discovery/SKILL.md` | "不得把初始化报告当成用户确认" → "不得把上下文探测结果当成用户确认" |

## 非目标

- 不删除任何已存在的历史报告文件（`local/projects/{cg-work,fms,job-hunt,lasen}/initialization-report.md` 全部保留）。
- 不迁移历史报告内容到任务记录（属各项目自己的判断，需另行确认）。
- 不新增校验门禁去强制"记录缺口"。

## 兼容性判断

- 纯文档与技能正文调整，无字段、路径或调用约定变化。
- 历史项目上下文、任务记录无需迁移。
- 已按废弃产物保留替代说明，符合 `core/framework-maintenance.md` 的废弃约束。
- 版本按"仅文档与技能说明调整"提升修订号。

## 验证范围

1. `npm run check` 通过（含文档链接与锚点校验）。
2. `npm test` 通过（项目识别与初始化相关测试不受影响）。
3. 全框架 `grep 初始化报告` 不再出现"要求生成该产物"的表述。
4. `node scripts/check-task.mjs` 通过本任务记录。

## 实施清单

- [x] `local/README.md` 结构清单与替代说明
- [x] `core/project-onboarding.md` 两处引用
- [x] `workflows/project-initialization.md`
- [x] `skills/project-initialization/SKILL.md` 步骤与收尾
- [x] `skills/project-discovery/SKILL.md` 停止条件
- [x] 版本修订号提升
- [x] 验证并写回结论

## 验证结论

执行日期：2026-10-02。

| 验证项 | 命令 | 结果 |
|---|---|---|
| 框架全量校验 | `npm run check` | 通过（含文档链接与锚点） |
| 框架回归测试 | `npm test` | 60 通过 / 0 失败 |
| 残留引用检索 | `grep 初始化报告`（core、workflows、skills） | 无匹配：框架内不再出现要求生成或依赖该产物的表述 |
| 历史文件保留 | 目录核查 | 4 份历史报告（cg-work、fms、job-hunt、lasen）全部仍在 |
| 本任务记录 | `node scripts/check-task.mjs` | 通过 |

未执行项：不为历史报告做内容迁移（按非目标，属各项目自己的判断）。

## 审查结论

自查：5 处引用逐条替换为"初始化任务记录"，没有一处只删除而不指定替代承载；`local/README.md` 增加废弃替代说明并明确历史文件保留；技能步骤删除后编号重排（原第 10 步变为第 9 步），无断号。符合 `core/framework-maintenance.md` 的废弃约束——保留替代说明，不删除仍被引用的文件。

## 交接与集成决策

状态：`review`，等待用户验收；未提交。建议与 `2026-10-02-check-skills-line-ending-tolerant`、`2026-10-02-localized-skill-registration` 合并为一次框架提交（版本 2.19.1），推送仍需单独授权。

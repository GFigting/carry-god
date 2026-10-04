# 工作流正文收敛与模板唯一化

## 问题事实

| 编号 | 事实 | 证据 |
|---|---|---|
| P1 | `refactor` 与 `feature-development` 高度重叠 | refactor 正文 2 段，其余全部复用 feature 的流程；使用 9 条 |
| P2 | `review` 工作流正文与 core 重复 | 使用 1 条；正文复述 `operating-model#review-阶段统一收尾` 与提交边界 |
| P3 | `low-risk-change` 正文大半是判定条件 | 使用 0 条（设计如此）；它自己声明"以 operating-model 为唯一来源" |
| P4 | 路线图格式分散在两个文件 | `roadmap.template.yaml` 与 `roadmap-closure.template.md` 只被 1 个技能引用 |
| P5 | 工作流文件不能删 | 9 条记录的 `workflow: framework:refactor`、1 条 `framework:review` 依赖文件存在，删除即变成"未知工作流" |

## 受影响唯一来源

| 唯一来源 | 变更 |
|---|---|
| `workflows/refactor.md` | 正文压缩为三条重构特有要求 + 指向 feature-development 与命名与提交；frontmatter 原样保留 |
| `workflows/review.md` | 正文只留使用场景、按需技能与完成条件；收尾顺序与提交边界改为引用 |
| `workflows/low-risk-change.md` | 正文只留产物边界与验证下限；适用条件改为引用 operating-model |
| `core/roadmap.template.md` | 新增：`roadmap.yaml`、`closure.md` 骨架与 `coverage.md` 规则的唯一来源 |
| `core/roadmap.template.yaml`、`core/roadmap-closure.template.md` | 转为替代说明，保留骨架 |
| `core/README.md`、`skills/large-task-decomposition/SKILL.md` | 指向新唯一来源 |
| `README.md`、`core/context-loading.md` | 澄清 `framework:<name>` 按字段判定 |
| `VERSION` | 2.22.0 → 2.23.0 |

## 设计取舍

- **保留 id、搬移正文**：删除工作流文件会让 10 条历史记录变成"未知工作流"，属追溯性破坏；因此以"薄工作流"替代"合并文件"，重复的是 frontmatter 技能清单（机器读取，不可避免），消除的是正文。
- **不做 `framework:` 前缀全量改名**：改名需要动 9 个工作流的 frontmatter 与正文、多个 core 文档、技能正文与相关测试，合计上百处，而工具层（校验器按位置解析）本来就没有歧义，收益只是行文可读性。权衡后改为在入口一次写清"按字段判定"，并把全量改名留作独立议题。
- **`plan.template.md` 不合并**：它本身已经是计划结构的唯一来源，且被历史任务引用；把它并入"约定"只会让约定变长而无唯一来源可依。原先的判定予以撤回。
- **模板文件保留为替代说明**：符合框架维护规则，历史引用不断链。

## 非目标

- 不删除任何工作流文件或模板文件。
- 不改状态机、门禁、技能清单与产物要求。
- 不改 compact/轻量档的适用条件。

## 兼容性判断

- 三个工作流的 id、frontmatter 与适用条件不变，历史记录继续有效。
- 正文搬移不改变任何判定：重构的行为不变边界、审查的完成条件、低风险路径的验证下限都保留在文件内。
- 路线图格式字段未改，仅集中到一个文件；旧模板保留骨架，历史引用可解析。

## 验证范围

1. `npm run check` 通过（含工作流 frontmatter 校验与新锚点）。
2. `npm test` 通过。
3. 130 条任务记录全量复校验，失败数不得高于改动前（3 条）。
4. 三个工作流仍各自声明所需的 frontmatter 字段且无重复引用。
5. 全框架检索：`review.md`、`low-risk-change.md` 不再重复 core 的判定与收尾正文。

## 实施清单

- [x] 三个工作流正文收敛
- [x] 路线图格式唯一化与新模板
- [x] 旧模板转替代说明并同步技能与索引
- [x] 前缀判定澄清（不做全量改名，理由记录在案）
- [x] 版本号提升
- [x] 全量复校验并写回结论

## 验证结论

执行日期：2026-10-02。

| 验证项 | 命令 | 结果 |
|---|---|---|
| 框架全量校验 | `npm run check` | 通过（含三个工作流的 frontmatter 与技能引用校验） |
| 框架回归测试 | `npm test` | 66 通过 / 0 失败 |
| 记录全量复校验 | 逐条 `node scripts/check-task.mjs` | 130 条中失败 3 条，与改动前一致 |
| 工作流 id 有效性 | 记录 `workflow` 字段 | `framework:refactor` 9 条、`framework:review` 1 条仍全部可解析 |
| 新模板链接 | `npm run check` 锚点校验 | `roadmap.template.md` 指向的技能与工作模型锚点均可解析 |

## 审查结论

自查：三个工作流只删重复叙述，未删除任何判定条件——重构的三条特有要求、审查的完成条件、低风险路径的产物与验证下限都留在文件里；frontmatter 未改，故技能加载行为不变；工作流文件全部保留，10 条历史记录不失效。两处主动撤回/推迟（`plan.template.md` 不合并、前缀不全量改名）已记录理由，避免为"看起来更整齐"制造大范围改动。

## 交接与集成决策

状态：`review`，等待用户验收。建议与前六项一并按版本 2.23.0 提交；前缀全量改名、`plan.template.md` 合并两项如需推进，单独立项。

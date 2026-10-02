# 变更地图：框架一致性收敛与简化

## 问题事实

| 编号 | 事实 | 证据 |
|---|---|---|
| P1 | 入口文档与规则正文漂移 | `AGENTS.md` 缺 project-discovery 门禁、写"先存入需求包"而非"复用优先"、缺 review 收尾与 compact/原型/next_user_action 门禁 |
| P2 | 同一提交政策复制 6 份且措辞漂移 | `README.md`、`core/framework-maintenance.md`、`core/naming-and-submission.md`、`workflows/README.md`、`workflows/feature-development.md`、`workflows/bugfix.md` |
| P3 | 提交/忽略策略三方矛盾 | README 提交规则、`.gitignore` 中 `!/local/projects/cg-work/**` 与需求箱注释、framework-maintenance 提交约束 |
| P4 | 已提交任务记录断链 | 120 个任务记录 14 个失败；8 个 cg-work 任务的 `requirements_reference` 目标从未提交且本机不存在 |
| P5 | 框架自身上下文无法跨机复用 | 被提交的 `local/projects/cg-work/project-context.yaml` 内含绝对路径；`check-project.mjs` 在 `root_path` 无效时输出误导报错 |
| P6 | 校验器漏检 | 不校验 Markdown 锚点；不巡检框架受管项目记录；无一次性全量入口 |
| P7 | 文档自身缺陷 | `core/context-loading.md` 重复段落；`core/README.md` 索引不全；`README.md` 编号重复 |

## 受影响唯一来源与调用方

| 唯一来源 | 变更 | 调用方需同步 |
|---|---|---|
| `AGENTS.md` | 改为精简路由，不复制规则 | 无（README 成为唯一正文） |
| `core/naming-and-submission.md` | 成为提交政策唯一正文 | README、framework-maintenance、workflows/README、feature-development、bugfix 改为引用 |
| `.gitignore` + `README.md` 提交规则 + `core/framework-maintenance.md` + `local/README.md` + 需求箱 `README.md` | 统一为"cg-work 自身记录随框架提交；业务项目 local 数据保持本地" | 无 |
| `local/README.md` | 同步任务字段口径：`interaction_protocol: v1` 必填、`learning_protocol` 按需 | 无 |
| `scripts/check-project.mjs` | 支持框架自身项目 `root_path: .`；修正误导报错 | `core/context-loading.md`、`core/project-context.template.yaml` |
| `scripts/check-task.mjs` | 新增可选 `requirements_reference_note` | `core/operating-model.md` 元数据摘要 |
| `scripts/check-all.mjs` | 新增锚点校验与框架受管项目巡检 | `scripts/README.md`、`README.md` 使用顺序、`package.json` |
| `core/context-loading.md` | 去重；说明 `root_path` 语义 | 无 |

## 非目标

- 不重构 README/workflows/operating-model 的主流程叙述结构（仅去重与引用收敛）。
- 不修改业务项目（lasen/fms/job-hunt）的本地任务记录与需求箱。
- 不删除任何历史任务记录或证据文件。
- 不提交、不推送本次改动（框架变更需用户验收后单独提交）。

## 兼容性判断

- `AGENTS.md` 精简：不改变任何规则语义，只把正文交还 README。
- `requirements_reference_note`：新增可选字段，历史任务不受影响；仅在引用目标缺失时允许出现。
- `root_path: .`：仅对框架自身项目开放的字面量，`../x`、`./x` 等相对写法仍按原规则拒绝，既有测试语义不变。
- 政策统一为"cg-work 自身记录随框架提交"：与仓库现状（已追踪 2 个需求包和全部 cg-work 任务记录）一致，属修正文档描述而非改变行为；但会改变今后 `git status` 的表现，列为需用户验收的决策点。
- 8 个历史任务以"替代说明"字段记录需求包丢失，不新建伪造需求包。

## 迁移或替代说明

- 未引入字段迁移。
- 断链需求引用：保留原引用路径 + `requirements_reference_note` 说明不可恢复，替代直接删除引用（保留溯源）。
- 政策变更：`.gitignore` 与三处文档同步改写，属一次性文档迁移。

## 验证范围

1. `node scripts/check-all.mjs`（含新增锚点校验与 cg-work 记录巡检）通过。
2. `npm test` 全部通过（含新增用例）。
3. 8 个历史任务逐个 `node scripts/check-task.mjs` 通过。
4. `local/projects/cg-work/project-context.yaml` 在 `.` 形式下通过 `check-project.mjs`，且 `../x` 形式仍被拒绝。
5. 重复政策核对：6 个文件不再各自维护正文，`naming-and-submission.md` 为唯一来源。

## 实施清单

- [x] `AGENTS.md` 精简路由
- [x] 提交政策收敛到 `core/naming-and-submission.md`，同步 `test/submission-rules.test.mjs`
- [x] 提交/忽略策略口径统一（`README.md`、`core/naming-and-submission.md`、`core/framework-maintenance.md`、`local/README.md`、需求箱 `README.md`、`.gitignore`、`scripts/check-all.mjs`）
- [x] `check-project.mjs` 支持 `.` 并修正报错
- [x] `check-task.mjs` 增加 `requirements_reference_note`
- [x] `check-all.mjs` 增加锚点校验与框架受管项目巡检；`package.json` 增加 `check` 脚本
- [x] 8 个历史任务补替代说明
- [x] 文档小修（`context-loading.md` 去重、`core/README.md` 索引、`README.md` 编号、`VERSION`）
- [x] 补测试并运行验证
- [x] 复核 S1/S2 处置：补回"文档同步 + 收尾顺序"正文，把 special-operations 强制触发点写回 README 使用顺序
- [x] 复核 A1–A6、A9 处置：围栏锚点、链接目标写法、唯一来源断言加强、入口路由完整性断言、模板 `.` 说明、提交措辞、note 分支用例
- [x] 复核 S3 记录：无关删除列入排除项并提交 D4 决策
- [x] 复核 A7/A8：A7 延后并给出 CI 方案，A8 按设计接受

## 验证结论

执行日期：2026-10-02（本机，Node 直跑）。

| 验证项 | 命令 | 结果 |
|---|---|---|
| 框架回归测试 | `npm test` | 57 通过 / 0 失败（新增 `entry-routing` 2 例、`requirements_reference_note` 5 例、`root_path: .` 2 例） |
| 全量结构校验 | `npm run check` | `cg-work checks passed` |
| 8 个历史任务逐个校验 | `node scripts/check-task.mjs <each>` | 全部通过（此前 8 个全部失败） |
| cg-work 上下文跨机形式 | `node scripts/check-project.mjs local/projects/cg-work/project-context.yaml` | 通过（`root_path: .` 解析为框架目录） |
| 业务项目禁用 `.` | `test/check-project.test.mjs` 用例 | 按预期拒绝，提示"只有框架受管项目 cg-work 可以使用 project.root_path: ." |
| 锚点校验有效性探针 | 临时文件 `core/anchor-probe.md` + `npm run check` | 按预期报 `broken anchor: core\anchor-probe.md -> operating-model.md#not-a-real-heading`；清理后恢复通过 |
| 受管项目巡检有效性探针 | 临时任务记录 + `npm run check` | 按预期报 `requirements_reference 指向的文件不存在`；清理后恢复通过 |
| 围栏幽灵锚点探针（复核 A1） | 临时文件链接到 `continuous-learning.md#候选经验`（该标题仅存在于样例代码块内） | 修复后按预期报 `broken anchor`；修复前会误判通过 |
| 链接写法探针（复核 A2） | 临时文件含 `](<README.md>)`、`](operating-model.md#最小充分流程 "t")`、`](README.md)` | 三种写法均正确解析，无断链误报 |
| 政策唯一来源 | `grep` 全框架 | "简单映射、直通委托""测试文件默认保留"仅存在于 `core/naming-and-submission.md` |
| 既有相对根路径规则未被放宽 | `test/check-project.test.mjs` 既有用例 | `../project` 仍被拒绝 |
| CI 兼容 | 读取 `.github/workflows/cg-work.yml` | CI 运行 `npm test`、`check-all.mjs`、`check-skills.mjs`，前两者在本地同一代码状态通过 |

未执行项：`node scripts/check-skills.mjs` 未运行（本次未触碰技能镜像；本机运行受 CRLF 影响会假阳性，见下）；CI 实际运行需推送后确认。

## 审查结论

自查（2026-10-02）：

| 项 | 结论 |
|---|---|
| 唯一来源 | 提交政策正文只剩 `core/naming-and-submission.md`；5 处调用方改为引用并删除了复制段落，测试同步改为"断言引用 + 禁止复制" |
| 规则未丢失 | 逐条比对：原 AGENTS.md 的 10 条要求全部由 README 使用顺序或 core 承接（识别门禁、需求包、技能加载、review 收尾、校验命令、特殊操作） |
| 口径一致 | `README.md`、`core/naming-and-submission.md`、`core/framework-maintenance.md`、`local/README.md`、需求箱 README、`.gitignore`、`check-all.mjs` 七处对"业务项目保持本地 / cg-work 随框架提交"表述一致 |
| 校验器语义 | `check-task.mjs`、`check-project.mjs` 改为导出函数后，CLI 无参数用法与退出码、缺文件报错文案与改动前一致（实测） |
| 误报防控 | 链接正则放宽为 `[^)]+`，避免路径含空格被截断；锚点校验只对框架内容启用，`local/` 与 `skills/` 跳过 |
| 冗余清理 | `check-project.mjs` 恢复单出口结构，去掉重构引入的冗余出口分支；临时探针文件与一次性脚本已删除 |
| 未采纳 | 未重建 8 个丢失需求包（避免伪造"原始需求"）；未重排 README/工作流主流程结构（超出本次收敛范围，避免大范围改动风险） |
| 过程失误 | 插入测试时曾误删既有测试两行，自查发现并修复，全部测试复跑通过 |

本机环境假阳性（非本次改动、非真实漂移）：`node scripts/check-skills.mjs` 在本机报 65 处"skill content differs"；抽样验证 `gstack/qa-only/SKILL.md`、`gstack/review/sections/manifest.json` 在 CRLF→LF 归一化后哈希一致、`superpowers/skills/brainstorming` 文件清单一致，确认仅是 Windows 工作副本换行符差异，CI（Linux）不受影响。已记为后续可选优化（哈希校验对换行符不宽容），不纳入本次范围。

独立复核（子智能体，只读复核，未改动工作区）：结论为**无阻塞**，提出 3 条应修、9 条建议。逐条处置如下。

| 复核项 | 处置 |
|---|---|
| S1 唯一来源缺"文档同步/校验顺序"正文（引用指向空承诺） | 已修：`core/naming-and-submission.md` 补回"提交后同步文档 + 重新执行文档引用校验"和统一收尾顺序条目，引用承诺与正文对齐 |
| S2 AGENTS.md 精简丢掉 special-operations 强制触发点 | 已修：强制触发点写入规则正文 `README.md` 使用顺序第 10 条（AGENTS.md 通过"按使用顺序执行"继承），并新增断言防止再次丢失 |
| S3 工作区混入无关删除 `local/projects/cg-work/initialization-report.md` | 已处置（用户确认 D4）：恢复该文件，废弃动作另立 `2026-10-02-retire-initialization-report`（pending）；本次两个提交均不含任何无关删除 |
| A1 锚点扫描不识别代码围栏 → 幽灵 slug | 已修：标题提取改为逐行状态机，跳过围栏块；探针验证通过 |
| A2 链接目标写法（含标题、尖括号） | 已修：新增目标解析候选，兼容 `dest`、`<dest>`、`dest "title"`；探针验证无误报 |
| A3 唯一来源 4 条正文失去断言保护 | 已修：`test/submission-rules.test.mjs` 增加 SQL 合并、冗余清理、文档同步、收尾顺序、仅本地 commit 五条断言 |
| A4 入口路由完整性未校验 | 已修：新增用例断言 AGENTS.md 保留 5 个 core 入口指向，且 README 含特殊操作触发点 |
| A5 计划承诺同步 `project-context.template.yaml` 但未落地 | 已修：模板补 `.` 例外说明 |
| A6 "随框架提交"与"分开提交"措辞可读成互斥 | 已修：明确为"同一仓库随框架提交，但与规则改动分成不同 commit" |
| A7 只断言 `.gitignore` 字面量，不校验真实跟踪状态 | 延后（有理由）：需要 `git ls-files` 子进程，会让 `check-all` 依赖 git 并在受限 stdio 环境下失败；更合适的位置是 CI 加一步 `git ls-files local/projects | grep -v cg-work`，建议单独立项 |
| A8 ESM main 守卫在 import/包装器下静默无输出 | 按设计接受：CLI 三种直连调用方式实测一致；`check-all` 走 import 路径，不依赖守卫 |
| A9 note 两条分支无用例 | 已修：新增空说明与非空说明脱离引用的两条用例 |

复核已独立核实为"通过"的项：政策唯一来源（残留扫描）、AGENTS.md 路由落点（除 S2）、五处口径一致、`root_path: .` 不可被业务项目滥用、CLI 行为与改动前一致、8 条 `requirements_reference_note` 的事实依据（目标本机不存在且 `git log --all` 从未入库）、`check-task`/`check-project` 新用例正反俱全未放宽。

复核带来的过程教训（本次已修正）：精简入口时不能只做"清单式提及"，被删掉的必须是可被引用的正文——S1 与 S2 正是"删掉而不是引用替代"的两种形态。

## 交接与集成决策

状态：`done`（用户于 2026-10-02 验收 D1–D4）；未推送、未合并。

验收与提交记录：

- 决策：D1 接受（并落地"业务项目来源需求包留本地"守卫）；D2 接受（不重建、不收紧字段）；D3 接受 2.19.0；D4 确认有意废弃 → 恢复文件并另立 `2026-10-02-retire-initialization-report`（pending）。
- 复核 A7 按建议并入本次变更（CI 增加业务项目本地数据未入库检查），不再另立待办。
- 提交 1（规则、校验器、测试、CI）：`1c7ebef`，23 个文件。
- 提交 2（本记录）：cg-work 本地记录提交，含本任务、8 条替代说明、D4 待办与需求包。

建议的提交划分（用户验收后执行，仅暂存相关文件，不使用 `git add .`）：

1. 规则与校验提交：`AGENTS.md`、`README.md`、`.gitignore`、`VERSION`（2.19.0）、`package.json`、`core/*`、`workflows/*`、`scripts/*`、`test/*`。
2. cg-work 本地记录提交：`local/README.md`、`local/projects/cg-work/requirements-inbox/*`、`local/projects/cg-work/tasks/*`（含 8 条替代说明与本次任务记录）。

排除项：业务项目 `local/projects/{lasen,fms,job-hunt}/`、`local/tools/`、`.codegraph/`、`cg-work-acl-recovery/`；`initialization-report.md` 已按 D4 恢复，本次提交不含无关删除。推送、合并、部署需单独授权。

需用户验收的决策点：

- D1 提交政策改为"cg-work 自身需求包随框架提交"（`git status` 因此多出 18 个待提交需求包）。
- D2 历史断链需求包只保留 `requirements_reference_note` 替代说明，不重建文件。
- D3 版本号提升为 2.19.0（新增兼容能力与校验），未提升主版本。
- D4 `local/projects/cg-work/initialization-report.md`：已确认属有意废弃 → 文件已恢复，废弃另立 `2026-10-02-retire-initialization-report`（pending），本次不执行。
- 复核 A7（业务数据误入库）已按建议并入本次变更：CI 新增"校验业务项目本地数据未入库"步骤（`git ls-files local/projects` 白名单过滤），不再另立待办。
- D1 守卫已落地：`core/naming-and-submission.md` 增加"来源于业务项目的需求包必须留在该项目自己的需求箱"。

遗留项：

- 业务项目 `local/projects/lasen/` 仍有 6 条历史任务记录不满足当前校验规则（缺 review/verification/handoff 引用、`lightweight_evidence.scope` 为空、`documentation` 非映射、缺原型契约）；它们不属于框架受管内容，未纳入本次改动，建议单独立项处理。
- 复核 A7：真实跟踪状态（业务项目 local 数据是否被误跟踪）目前只靠 `.gitignore` 字面量断言；建议在 CI 增加一步 `git ls-files local/projects | grep -v cg-work` 作为真实泄漏门禁，而不是让 `check-all.mjs` 依赖 git 子进程。
- `check-skills.mjs` 的哈希校验不宽容换行符：Windows 工作副本会整片假阳性（本次实测 65 处，LF 归一化后一致）。建议单独立项改为按 LF 归一化后比较。

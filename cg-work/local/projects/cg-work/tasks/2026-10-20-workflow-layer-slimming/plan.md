# workflows 层减薄（方案 A）实施计划

## 目标

workflows/ 保留为「意图 → 技能调度」薄路由层：每个工作流只保留 frontmatter 技能调度（required/optional/conditional skills）、阶段顺序与流程特有要求，删除与 `core/` 重复的规则正文，全部改指针。同步修复执行中发现的旧口径与矛盾。

## 背景与问题

core 与 workflows 的关系是「规则层 → 调度层」单向指针，但 workflows 存在两类问题：

1. **正文抄写导致滞后**（core 改了 workflow 没跟上），共 5 处：
   - `workflows/large-task-decomposition.md` 整段仍是旧 roadmaps 三件套流程（「创建路线图目录与覆盖记录」「closure.md 索引」「next_user_action」字段已废弃）
   - `feature-development.md` L22「不得直接并列创建无路线图的任务」
   - `bugfix.md` L21 轻量禁项「路线图」
   - `workflows/README.md` L54「路线图没有可执行前沿任务」、L65 索引表「大需求路线图」
2. **与 core 重复的规则正文**（减薄对象）：README 阶段契约表 / compact 段 / 执行模式段 / 原型门禁段，feature-development 轻量执行段与 standards_preflight 段，bugfix 轻量需求箱句，low-risk-change 产物验证段
3. **一处与 core 矛盾**：`workflows/README.md` L28「standard 与 compact 可同时声明」vs `operating-model.md` L171「delivery_path 是单一枚举、三者天然互斥」——以 core 为准

## 范围

- 改：`workflows/README.md`、`feature-development.md`、`bugfix.md`、`low-risk-change.md`、`large-task-decomposition.md`
- 不动：`refactor.md`、`review.md`、`project-discovery.md`、`framework-optimization.md`（已是薄指针形态）；`core/`、`skills/`、根 `README.md`（已是新主从口径）；`scripts/`（工作区另有他人在途改动）
- 版本号：`VERSION` 2.30.0 → 2.31.0（本变更与在途时间字段校验同属未提交批次，各升一个次版本）

## 各文件目标形态

| 文件 | 改法 |
|---|---|
| `workflows/README.md` | 阶段契约表、compact 说明、原型门禁段压缩为指向 `operating-model` 对应章节的指针；执行模式段删组合矛盾句改单指针；**保留**「标准编码前置检查」为该流程唯一来源；L54/L65 改主从口径 |
| `feature-development.md` | L22 大段压缩：需求来源/原型门禁全指针，大任务切换改主从措辞；L26 轻量执行段改指针；L44 standards_preflight 改指针（唯一来源在 workflows/README）；保留技能加载策略、计划审核双线、测试处理规则（本层特有） |
| `bugfix.md` | L21 删需求箱复述、修「路线图」→「主从任务」；L28 standards_preflight 改指针；其余保留 |
| `low-risk-change.md` | L14 与 `operating-model#低风险变更` 近逐字重复 → 改指针，仅保留「实施前说明本次修改没有改变行为」这一句本层独有内容 |
| `large-task-decomposition.md` | 按主从口径重写正文：决策分级（清楚→decisions / 模糊→wayfinder）→ 建主任务（role: parent，plan 四章节）→ to-tickets 生成子任务（parent_reference）→ 子任务走既有工作流 → 全终态并集成核对后主任务验收关闭（不删子任务证据）；存量三件套双轨保留说明 |

## 验收标准

1. `workflows/` 下 grep `路线图|closure\.md|coverage\.md|next_user_action` 零命中
2. `workflows/README.md` 中不存在「standard 与 compact 可同时声明」类组合表述
3. 五个目标文件中被删除的规则正文，在 `core/` 均有唯一来源承接（不丢规则）
4. `npm run check` 全绿、`npm test` 全绿

## 测试用例

| 编号 | 方法 | 预期 |
|---|---|---|
| TC-001 | grep `路线图\|next_user_action` 于 workflows/ | 零命中 |
| TC-002 | grep `closure\.md\|coverage\.md` 于 workflows/ | 零命中 |
| TC-003 | grep `可同时声明\|同时声明` 于 workflows/ | 零命中 |
| TC-004 | `npm run check` | 全部通过（链接与锚点有效） |
| TC-005 | `npm test` | 全部通过 |
| TC-006 | 人工比对：被删段落逐条在 core 找到承接章节 | 无规则丢失（结果记入 verification） |

## 实施步骤

1. 重写 `workflows/large-task-decomposition.md`（主从口径）
2. 修 4 处旧口径：`feature-development.md`、`bugfix.md`、`workflows/README.md`（与减薄合并一次编辑）
3. 减薄 `workflows/README.md`、`feature-development.md`、`bugfix.md`、`low-risk-change.md` 的重复正文
4. `VERSION` → 2.31.0；跑 TC-001~005，写 `verification.md`
5. review 阶段收尾：写 `review.md`、流转 review、请用户验收

## standards_preflight

- 项目自动检查：`npm run check`（框架结构/锚点/引用）+ `npm test`（45 项）；
- 当前差异人工检查：5 个 workflow 文件为纯规则文本变更，无人工编码、无业务字面量、无接口/数据/权限影响，不适用常量化项；
- 框架自身提交按 `naming-and-submission` 分 commit，只暂存本任务文件（工作区另有在途时间字段校验改动，不混入）。

## 风险

- **删多**：某段看似重复实为本层独有 → TC-006 逐条比对承接
- **锚点断裂**：压缩后被引用标题消失 → `npm run check` 兜底
- **工作区混杂**：在途改动（scripts、task-time-fields、2.30.0 版本批次）不纳入本任务提交

# 交付路径口径统一实施计划

日期：2026-10-07（核对方式：读取 `core/operating-model.md`、`workflows/README.md`、`scripts/README.md`、`scripts/check-task.mjs` 现行文本并逐条对照校验器行为）

## 目标与范围

落实用户评审反馈 5 项（P1-P3 优先）：修正轻量执行适用范围的文档矛盾；区分低风险变更、`execution_profile`、`artifact_profile: compact` 三个概念并补组合规则表；补充交付路径升级规则；把主观条件收敛为五项决策清单；把总称从“任务档位”统一为“交付路径”。只改框架规则、校验器、测试与说明文档，不改状态机、字段取值和历史任务。

## 受影响的唯一来源

| 文件 | 唯一来源职责 | 变更 |
|---|---|---|
| `core/operating-model.md` | 交付路径、证据生命周期规则正文 | 新增「交付路径与两个声明字段」（含组合规则表）、「轻量执行决策清单」、「交付路径升级」三节；“三档”改为交付路径措辞 |
| `workflows/README.md` | 工作流阶段与执行模式入口 | 修 P1 矛盾（lightweight 覆盖 bugfix 与 feature-development）；“轻量档路径”改“轻量执行路径”；指向唯一来源 |
| `scripts/README.md` | 校验器行为说明 | 修 P1 矛盾；补 lightweight+compact 拒绝说明；修正 standard+compact 不校验 standards_preflight 的描述 |
| `core/continuous-learning.md` | 学习闭环规则 | 轻量执行不声明学习协议的范围改为 bugfix 与 feature-development；升级指向唯一来源 |
| `workflows/bugfix.md` / `workflows/feature-development.md` / `workflows/low-risk-change.md` | 各工作流适用条件 | 主观条件改为引用决策清单；升级动作改为引用「交付路径升级」 |
| `scripts/check-task.mjs` | 任务校验器 | 新增 lightweight 与 `artifact_profile: compact` 同时声明的拒绝 |
| `test/check-task.test.mjs` / `test/delivery-path-consistency.test.mjs` | 回归测试 | 新增组合拒绝、standard+compact 接受、文档-校验器一致性断言 |
| `AGENTS.md` / `local/README.md` / `VERSION` | 路由与本地说明、版本 | “档位”措辞同步；修订版本号 |

## 决策记录

- `lightweight + compact` 定为**不允许**（组合规则表 P2 行）：轻量执行本身就是“单条 `task.yaml` 合并证据”，再声明 compact 会引入主产物门禁，与“不创建独立文件”冲突；由 `check-task.mjs` 拒绝。该决策如用户裁定为允许，仅需删除该条校验与表格行说明。
- 升级在同一 `task.yaml` 内进行（保留原记录、`status_history` 与已写的 `lightweight_evidence`），不重开任务；免记录路径升级则新建 `pending` 任务。与用户反馈第 3 项一致。

## 兼容性等级

修订（patch，`2.26.0` → `2.26.1`）：仅修正文档矛盾并收紧一条从未被文档允许、也无历史记录使用的校验组合。`execution_profile`、`artifact_profile` 取值不变；历史任务零迁移；既有任务的校验结果除 lightweight+compact 组合外不变。无替代或废弃内容。

## 验收标准

1. `workflows/README.md`、`scripts/README.md`、`core/continuous-learning.md` 不再出现“轻量仅限 bugfix”表述，且与 `check-task.mjs` 的允许集合一致（bugfix + feature-development）。
2. `core/operating-model.md` 存在三概念区分与组合规则表，明确 `compact` 不是执行档位，并明确 `lightweight + compact` 不允许。
3. 升级规则覆盖三种情形：免记录→标准（新建 `pending`）、轻量→标准（原 `task.yaml` 内升级、补建计划/审查/验证）、产生可复用经验即升级。
4. 决策清单五项触发器成文，`bugfix.md`、`feature-development.md` 的主观措辞改为引用清单。
5. `check-task.mjs` 拒绝 lightweight+compact 并有回归测试；`npm run check` 与 `npm test` 全绿。

## standards_preflight

- 计划阶段常量化判断：本次仅新增一条校验错误消息与文档协议术语（`交付路径`、`免记录路径`、`轻量执行`、`标准执行`、`轻量执行决策清单`、`交付路径升级`），允许保留在规则文档、错误提示和测试断言中，不抽取为运行时常量。
- 静态检查：`npm run check`（框架结构、锚点、工作流引用、受管项目记录）+ `node --test "test/*.test.mjs"`；无项目业务代码，无外部环境检查。
- 例外：无。

## 实施步骤

1. P1 修 `workflows/README.md`、`scripts/README.md`、`core/continuous-learning.md` 的适用范围矛盾。
2. P2 在 `core/operating-model.md` 建立三概念与组合规则表；`check-task.mjs` 落实组合拒绝并补测试。
3. P3 补「交付路径升级」三种情形，并接到低风险、轻量两条路径的出口。
4. P4 决策清单替换 bugfix/feature-development 的主观条件。
5. P5 交付路径命名统一（AGENTS.md、local/README.md、workflows/README.md）。
6. 全量验证、版本号、任务证据收尾。

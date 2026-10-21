# 验证记录 — workflows 层减薄（方案 A）

## 结论

TC-001~006 全部通过；`npm run check` 与 `npm test`（49 项）全绿，无规则丢失。

## 用例结果

| 编号 | 方法 | 结果 |
|---|---|---|
| TC-001 | grep `路线图\|next_user_action` 于 `workflows/` | 零命中 ✅ |
| TC-002 | grep `closure\.md\|coverage\.md` 于 `workflows/` | 零命中 ✅ |
| TC-003 | grep `可同时声明\|同时声明\|roadmap_reference` 于 `workflows/` | 零命中 ✅（组合矛盾句已删除） |
| TC-004 | `npm run check` | 通过，锚点与引用全部有效 ✅ |
| TC-005 | `npm test` | 49 项全部通过 ✅ |
| TC-006 | 被删段落 core 承接人工比对 | 无规则丢失（见下表）✅ |
| TC-007 | 重命名后复核：框架内容 grep `large-task-decomposition\|project-roadmap.template` + `npm run check` + `npm test` | 零残留，双检查全绿 ✅ |

## TC-006 承接比对

| 被删/压缩内容 | 承接来源 |
|---|---|
| `README.md` 阶段契约表、原型门禁段 | `core/operating-model.md` #任务证据生命周期、#原型与任务记录 |
| `README.md` compact 说明、执行模式段（含「可同时声明」矛盾句） | `core/operating-model.md` #交付路径声明（`delivery_path` 单一枚举） |
| `feature-development.md` 轻量功能的适用条件与升级触发复述 | `core/operating-model.md` #轻量执行决策清单、#交付路径升级 |
| `feature-development.md` 需求箱处理正文 | `core/operating-model.md` #需求箱与需求引用 |
| `feature-development.md` 原型门禁正文 | `core/operating-model.md` #原型与任务记录 |
| `bugfix.md` 「需求箱只接受手动添加」复述句 | `core/operating-model.md` #需求箱与需求引用 |
| `low-risk-change.md` 产物与验证下限段（与 core 近逐字重复） | `core/operating-model.md` #低风险变更 |
| `large-task-decomposition.md` 旧 roadmaps 三件套流程 | `core/operating-model.md` #大任务主从拆分（主任务 `role: parent` + 子任务 `parent_reference`），存量三件套仅保留双轨说明 |

保留的本层独有内容：frontmatter 技能调度、技能按需加载策略、计划审核双线、测试处理规则、low-risk 的「实施前说明不改变行为」执行要求、`workflows/README.md` §标准编码前置检查（该流程唯一来源）。

## 测试断言同步（随正文减薄的配套修改）

- `test/standards-preflight.test.mjs`：2 行断言从旧正文句式改为断言指向 [标准编码前置检查] 的指针句式，断言意图不变。
- `test/requirement-package-policy.test.mjs`：需求箱复述检查拆为两组——`core/project-context.md`、`README.md`、`local/README.md` 仍要求含「手动添加」正文；`workflows/bugfix.md`、`workflows/feature-development.md` 改为要求含 `#需求箱与需求引用` 指针（禁止生成需求包的 doesNotMatch 检查两组均保留）。

## 验证边界

纯规则文本与测试断言变更，无业务代码、接口、数据或权限影响；数据库字段与日志类验证不适用。

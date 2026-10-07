# 需求包按需生成实施计划（compact 主产物）

日期：2026-10-07（核对方式：对照 `scripts/check-task.mjs` 行为与各文档现行措辞逐条修改）

## 目标与范围

需求包从“每任务必建”改为按「需求包留存判断」四项清单按需生成：任一为“是”才建需求包并以 `requirements_reference` 引用；四项全“否”的明确小改动，需求原文、范围和取舍直接写入 `plan.md`（compact 主产物）或 `decisions` 决策记录。校验器行为不变（`requirements_reference` 本就是可选字段），强制性只存在于文档措辞，本次予以放宽。

## 受影响的唯一来源

| 文件 | 变更 |
|---|---|
| `core/operating-model.md` | 新增「需求包留存判断」小节（四项清单 + 与轻量执行决策清单的正交关系） |
| `core/context-loading.md` | “原始需求先存入需求箱”改为按需存入，引用唯一来源 |
| `README.md` | 使用顺序第 4 步改为按判断清单处理需求来源 |
| `workflows/bugfix.md` | 轻量缺陷不再强制“存入需求箱”，改按需生成 |
| `workflows/feature-development.md` | 需求来源处理改为引用判断清单；轻量功能段同步 |
| `local/README.md` | 需求箱段补“按需生成，不是每任务必建” |
| `test/requirement-package-policy.test.mjs` | 新增：四项清单存在、五处引用唯一来源、不再强制先建需求包 |

## 决策记录

- 清单与「轻量执行决策清单」正交：需求包留存判断管**原意保真风险**，轻量执行决策清单管**执行风险**，两者结论可以不同。
- 命中判断 2/3/4 的改动（如归档目录拆分）保留一页以内的需求/决策说明即可，不写成产品需求文档；本任务自身即按此标准留了一页需求记录。
- `VERSION` 保持同批并行改动已定的 `2.27.0`（minor：新增兼容能力），不重复提升。

## 兼容性等级

新增兼容能力（minor）：历史任务与需求包零迁移；`requirements_reference`/`requirements_reference_note` 字段语义、需求箱目录约定、范围拆分规则均不变；校验结果不变。

## 验收标准

1. `core/operating-model.md` 存在「需求包留存判断」四项清单及其与轻量执行决策清单的正交说明。
2. README、`core/context-loading.md`、`workflows/bugfix.md`、`workflows/feature-development.md`、`local/README.md` 不再出现“必须先存需求包”的强制措辞，且都引用唯一来源。
3. `npm run check` 与 `npm test` 全绿，新增一致性测试防回归。

## standards_preflight

- 计划阶段常量化判断：新增协议术语（`需求包留存判断`、`decisions`）仅用于规则文档、链接锚点和测试断言，允许保留，不抽取运行时常量。
- 静态检查：`npm run check` + `node --test "test/*.test.mjs"` 实际执行；无项目业务代码。
- 例外：无。

## 实施步骤

1. `core/operating-model.md` 新增清单（唯一来源）。
2. 五处强制措辞放宽并加引用。
3. 新增一致性测试，全量验证。

## 审查结论

符合需求：四项清单按用户原话落文，与轻量执行决策清单的正交关系显式说明；五处强制措辞全部放宽且引用唯一来源；未触碰字段语义与历史记录。遗留：无。

## 验证结论

| 命令 | 结果 |
|---|---|
| `npm run check` | 通过 |
| `node --test "test/*.test.mjs"` | 90 tests / 90 pass / 0 fail（含新增需求包政策一致性测试） |
| `node scripts/check-task.mjs <本任务 task.yaml>` | 通过 |

当前差异人工检查：仅修改上表所列框架文档、测试与本任务记录；未动业务项目、镜像技能或外部系统。并行会话同批修改了归档存储相关文件（`scripts/archive-tasks.mjs`、`core/operating-model.md` 任务归档节等），本次未触碰其内容，仅与其共享 `core/operating-model.md`、`local/README.md`、`README.md` 的不同段落。

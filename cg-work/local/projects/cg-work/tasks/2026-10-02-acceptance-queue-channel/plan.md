# 验收出口：待验收清单与批量验收

## 问题事实

| 编号 | 事实 | 证据 |
|---|---|---|
| P1 | `review` 是最大堆积区 | 126 条记录中 `review` 60 条（48%），`done` 42 条 |
| P2 | 堆积结构性成因 | `operating-model` 要求 `done` 前必须有用户接受，而验收是人的注意力瓶颈；没有清单，积压只能靠翻目录发现 |
| P3 | 交互成本高 | 每条验收都需要一次单独确认，60 条即 60 次交互 |
| P4 | 用户已选方案 | A：批量验收通道 + 待验收清单（否决 B 异步化、C 超时降级、D 仅清单） |

## 受影响唯一来源

| 唯一来源 | 变更 |
|---|---|
| `scripts/acceptance-queue.mjs` | 新增：清单输出 + 批量验收（写入前预演 `done` 校验） |
| `package.json` | 新增 `npm run queue` |
| `core/operating-model.md` | 新增"待验收清单与批量验收"小节，并写明 Agent 不得代做验收判断 |
| `README.md`、`workflows/README.md`、`scripts/README.md` | 入口与说明同步 |
| `test/acceptance-queue.test.mjs` | 新增三例：清单列出、批量验收置为 done、证据不全拒绝 |
| `VERSION` | 2.20.0 → 2.21.0（新增兼容能力） |

## 设计取舍

- **写入前预演**：先把"置为 `done` 之后"的记录写进同目录探针文件并运行 `check-task` 的校验函数，通过才写回真实文件。这样批量验收不是后门，也不会产生"先写坏再修"的中间态。
- **只改三处**：状态、状态历史、面向用户的下一步。其余原文不动，避免重排格式造成大 diff。
- **不加 `--force`**：证据不全就拒绝，并原样打印缺口。
- **不代做判断**：工具只记录用户已经给出的接受结论；Agent 不得在用户未确认时自行标记 `done`。

## 非目标

- 不改变 `done` 的任何证据要求（review/verification/handoff/学习/原型门禁全部保留）。
- 不做超时自动降级（用户未选 C），也不把 `done` 改为异步（未选 B）。
- 不批量验收路线图记录（本期只处理任务记录；路线图仍按其 `next_user_action` 单独确认）。

## 兼容性判断

- 纯新增命令与文档，不影响既有校验、工作流或记录格式。
- 清单为只读；验收只作用于显式指定的 id，且逐条独立校验，一条失败不影响其他条。

## 验证范围

1. `npm test` 通过，含新增三例：清单列出等待用户的任务、批量验收置为 `done` 且状态历史追加、证据不全时拒绝且原文不变。
2. `npm run check` 与 `node scripts/check-skills.mjs` 通过。
3. 真实数据演练：`npm run queue` 输出积压数量与逐条动作说明。
4. 全新任务记录（本任务）自身校验通过。

## 实施清单

- [x] 清单与批量验收脚本
- [x] `npm run queue` 入口
- [x] 规则与说明同步（operating-model、README、workflows/README、scripts/README）
- [x] 三个回归测试（含拒绝路径）
- [x] 版本号提升
- [x] 真实数据演练并写回结论

## 验证结论

执行日期：2026-10-02。

| 验证项 | 命令 | 结果 |
|---|---|---|
| 框架回归测试 | `npm test` | 64 通过 / 0 失败（新增 3 例，其中 1 例专测拒绝路径） |
| 框架全量校验 | `npm run check` | 通过 |
| 技能镜像 | `node scripts/check-skills.mjs` | `skill mirrors match sources` |
| 真实清单演练 | `npm run queue` | 输出 65 条待验收记录，按"等待用户/审查中"分组并显示动作与说明 |
| 批量验收行为 | `test/acceptance-queue.test.mjs` | 合规记录置为 `done` 且仍通过校验；证据不全的记录被拒绝且 `status` 保持 `review` |
| 本任务记录 | `node scripts/check-task.mjs` | 通过 |

过程失误记录：首版参数解析把 `--accept` 的值误判为位置参数（导致两个测试失败），首版测试断言用了贪心正则；两者均由新鲜验证当场发现并修正。

## 审查结论

自查：工具不提供 `--force`；写入前预演确保不会产生不合规的 `done` 记录；清单为只读；文档明确写了"Agent 不得代做验收判断"，避免把工具当成自我批准的手段。三例测试覆盖了接受与拒绝两条路径，拒绝路径断言了原文不变。

## 交接与集成决策

状态：`review`，等待用户验收。建议与 `2026-10-02-artifact-and-field-simplification`、`2026-10-02-retire-initialization-report`、`2026-10-02-check-skills-line-ending-tolerant`、`2026-10-02-localized-skill-registration` 合并为版本 2.21.0 的框架提交；推送仍需单独授权。第 2 项（原型契约并入 plan.md）待本项验收后开始。

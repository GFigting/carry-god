# 本地化技能登记与声明

## 问题事实

| 编号 | 事实 | 证据 |
|---|---|---|
| P1 | `prototype` 已是本地化技能，却登记为原始镜像 | 与上游 `skills/skills/engineering/prototype` 差异 8 增 6 改：新增存储位置选择、实现契约要求，并引用 `core/prototype-implementation-contract.template.md`；`LOGIC.md`、`UI.md` 同样有差异 |
| P2 | 本地化声明在框架内完全缺失 | 检索"本地覆盖/本地化/localized"无任何匹配；`code-review`、`grilling` 被排除但正文未声明 |
| P3 | 该错误被换行符噪声掩盖 | `check-skills.mjs` 此前在本机整体失败（65 处），真实差异混在其中无法辨认（见 `2026-10-02-check-skills-line-ending-tolerant`） |
| P4 | 规则已有明文要求 | `core/framework-maintenance.md`：框架本地化技能必须在正文声明本地覆盖规则与其唯一来源；原始镜像必须登记并做哈希校验 |

## 受影响唯一来源

| 唯一来源 | 变更 |
|---|---|
| `scripts/check-skills.mjs` | 从镜像表移出 `prototype`，合并三条本地化技能说明为一条注释 |
| `skills/prototype/SKILL.md` | 增加本地化声明：上游来源、本地增加内容、不逐字节同步 |
| `skills/code-review/SKILL.md` | 增加本地化声明：上游来源、本地维护、不登记为镜像 |
| `skills/grilling/SKILL.md` | 增加本地化声明：上游来源、本地维护、不登记为镜像 |

## 非目标与设计取舍

- 不新增"技能分类登记表"之类的门禁。技能属于框架自有、原始镜像还是框架本地化，无法机械判定（本地化技能是否复用了上游内容需要读正文才能判断），强制登记会把 35 个技能目录全部卷进来形成仪式化负担。
- 不因此放宽任何镜像检查：真实内容差异、文件清单差异、不可读镜像三类断言保持不变。
- 不逐字节改写镜像正文；只增加声明，不改上游方法语义。

## 兼容性判断

- 迁移出镜像表后，`prototype` 不再参与哈希校验，与其"本地化"身份一致；其余镜像校验范围不变。
- 三个技能的声明是新增段落，不改变技能行为与调用约定。
- 版本随同批次提升修订号（2.19.1）。

## 验证范围

1. `node scripts/check-skills.mjs` 退出码 0 且输出 `skill mirrors match sources`（证明：换行符噪声消除后无剩余真实差异）。
2. 三个 SKILL.md 均含"框架本地化技能"声明与正确上游路径。
3. `npm test`、`npm run check`、本任务记录校验通过。

## 实施清单

- [x] 镜像表移出 `prototype` 并合并注释
- [x] 三个技能正文补本地化声明
- [x] 复校验镜像检查
- [x] 验证并写回结论

## 验证结论

执行日期：2026-10-02。

| 验证项 | 命令 | 结果 |
|---|---|---|
| 镜像校验 | `node scripts/check-skills.mjs` | `skill mirrors match sources`，退出码 0 |
| 框架回归测试 | `npm test` | 60 通过 / 0 失败 |
| 框架全量校验 | `npm run check` | 通过 |
| 声明完整性 | 三个文件检索 | 均含"框架本地化技能"+ 上游路径（engineering/prototype、engineering/code-review、productivity/grilling） |
| 本任务记录 | `node scripts/check-task.mjs` | 通过 |

## 审查结论

自查：登记修正与正文声明一致，未留"排除但无声明"的缺口；注释合并后无重复说明；`prototype` 移出镜像表属于登记纠错而非放宽校验——同一批次内先去掉噪声，再暴露真实差异，最后消解差异，三者可独立复核。

## 交接与集成决策

状态：`review`，等待用户验收；未提交。建议与 `2026-10-02-retire-initialization-report`、`2026-10-02-check-skills-line-ending-tolerant` 合并为一次框架提交（版本 2.19.1），推送仍需单独授权。

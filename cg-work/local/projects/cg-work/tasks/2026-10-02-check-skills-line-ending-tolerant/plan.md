# 镜像校验换行符宽容化

## 问题事实

| 编号 | 事实 | 证据 |
|---|---|---|
| P1 | 本机运行 `check-skills.mjs` 报 65 处内容差异 | 实测输出；`npm run check` 与 `npm test` 均不受影响 |
| P2 | 差异仅为换行符 | `gstack/qa-only/SKILL.md`、`gstack/review/sections/manifest.json` LF 归一化后哈希一致；`superpowers/skills/brainstorming` 文件清单一致 |
| P3 | 成因是检出配置差异 | `core.autocrlf=true` 把镜像转 CRLF，镜像源目录由 `.gitattributes` 固定 LF |
| P4 | 代价是校验可信度 | 假阳性训练人忽略校验输出，连带削弱真正有效的检查 |

## 受影响唯一来源

| 唯一来源 | 变更 |
|---|---|
| `scripts/check-skills.mjs` | 内容哈希前按 LF 归一化（含 NUL 的二进制文件除外）；把单镜像比较抽为可测试的 `compareMirror`，错误文案与退出码不变 |
| `scripts/README.md` | 说明归一化行为 |
| `VERSION` | 2.19.0 → 2.19.1（校验修正与文档调整） |

## 非目标

- 不放宽真实内容差异、文件清单差异、不可读镜像三类检查。
- 不把镜像校验并入 `check-all.mjs`（需要镜像源目录，仍属独立维护检查）。
- 不修改任何镜像内容或上游源内容。

## 兼容性判断

- 只比较方式变化，对外命令、参数、错误文案和退出码保持不变。
- `verifyMirrors` 仍导出且行为等价；新增 `compareMirror` 导出供回归测试使用。
- 二进制镜像按原字节比较，不受归一化影响。

## 验证范围

1. `node scripts/check-skills.mjs` 在本机（CRLF 检出）通过。
2. `npm test` 通过，含新增三例：换行符差异视为一致、真实内容差异仍报错、文件清单差异与不可读镜像仍报错。
3. `npm run check` 与 `node scripts/check-task.mjs` 通过。

## 实施清单

- [x] `check-skills.mjs` 归一化与 `compareMirror` 抽取
- [x] `test/check-skills.test.mjs` 正反用例
- [x] `scripts/README.md` 说明
- [x] `VERSION` 修订号
- [x] 验证并写回结论

## 验证结论

执行日期：2026-10-02。

| 验证项 | 命令 | 结果 |
|---|---|---|
| 镜像校验 | `node scripts/check-skills.mjs` | 通过（`skill mirrors match sources`）；修复前本机报 65 处 |
| 新增回归测试 | `npm test` | 60 通过 / 0 失败（新增 3 例：换行符差异视为一致、真实内容差异仍报错、清单差异与不可读镜像仍报错） |
| 框架全量校验 | `npm run check` | 通过 |
| 二进制保护 | 代码路径核查 | 含 NUL 字节的文件按原字节比较，不做文本归一化 |

关键过程事实：归一化后错误数从 65 降到 3；剩余 3 处经逐字节核实（2957 vs 3952 字节、两者均为 CRLF 且无孤立 CR）确认为**真实内容差异**，定性为 `prototype` 技能已本地化却仍登记为原始镜像，已另立 `2026-10-02-localized-skill-registration` 处理。

本任务的主要教训：**假阳性噪声掩盖了真实错误。** 65 处换行符告警把 3 处真实登记错误藏了不知多久；如果只处理"让它通过"，这 3 处会被一起掩盖。

## 审查结论

自查：只改比较方式，命令、参数、错误文案与退出码均不变（`verifyMirrors` 行为等价）；`compareMirror` 的抽取仅为可测试性，未放宽内容差异、清单差异、不可读镜像三类检查；未触碰任何镜像内容或上游源。新增测试保留了反向断言（真实差异必须仍被报告），未用"放宽断言"换取通过。

## 交接与集成决策

状态：`review`，等待用户验收；未提交。建议与 `2026-10-02-retire-initialization-report`、`2026-10-02-localized-skill-registration` 合并为一次框架提交（版本 2.19.1），推送仍需单独授权。

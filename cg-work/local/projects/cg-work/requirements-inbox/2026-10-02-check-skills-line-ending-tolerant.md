# 需求包：check-skills 换行符宽容化

- 日期：2026-10-02
- 来源：2026-10-02 框架一致性收敛的复核建议（用户确认"把 A7 提到前面做"后，同批处理的遗留项）
- 状态：原始需求，未拆分

## 原始诉求

`scripts/check-skills.mjs` 在 Windows 工作副本上对全部镜像报"skill content differs"（本次实测 65 处），但 LF 归一化后内容一致、文件清单一致，属假阳性。请求改为按内容语义比较，消除环境噪声。

## 事实依据

- 抽样验证：`gstack/qa-only/SKILL.md`（源 LF、镜像 CRLF）、`gstack/review/sections/manifest.json` LF 归一化后哈希一致；`superpowers/skills/brainstorming` 文件清单一致。
- 成因：`core.autocrlf=true` 的 Windows 检出把 cg-work 镜像转成 CRLF，而镜像源目录多由 `.gitattributes` 固定为 LF。
- 影响：CI（Linux）不受影响，但本机校验不可用；会训练人忽略校验输出。

## 约束

- 不得因此放宽真实内容差异或文件清单差异的检查。
- 不得改变现有错误文案与退出码语义。
- 二进制文件不得做文本归一化。

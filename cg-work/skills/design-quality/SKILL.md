---
name: design-quality
description: 设计决策与验收门。用于判定一次 UI 工作的方向、把用户的设计指令转成可执行的改动范围，并在交付前用可测量门禁和看-修循环验收。适用于任何用户可见的界面工作（页面、后台界面、组件、原型、由 baoyu-design 或 prototype 产出的设计物）。不负责产出设计稿本身。
---

# 设计质量门（路由层）

方法复用上游，正文由 cg-work 重写并维护。本文件只做路由与流程骨架，判定细则一律在 `references/` 下，避免同一规则出现两处。

- 上游来源一：impeccable（Apache 2.0，Paul Bakaus，基于 Anthropic frontend-design）——设计上下文前置、质量维度评分、状态完整性。
- 上游来源二：taste-skill / design-taste-frontend（MIT，Leon Lin）——可测量硬门禁、页面与后台界面分流、看-修收敛、改版顺序。
- 本地覆盖规则：脚本化测量降级为人工测量清单（见 `references/measurement.md`）；"规则绝对优先"改为"用户明确指令优先，让位必须记录"（见 `references/instruction-contract.md`）；产出交给 `baoyu-design` 或 `prototype`。

## 加载时机

- 新建页面、落地页、后台界面、组件或视觉重做。
- 用户说"改一下设计""看起来太 AI""调高级一点""这版不对"。
- `review` 阶段验收含 UI 交付物的任务。

不适用：纯逻辑/状态原型（用 [prototype/LOGIC.md](../prototype/LOGIC.md)）、纯文档与数据产物、后端接口工作。

## 流程骨架

| 步 | 做什么 | 细则 |
|---|---|---|
| 0 | 设计上下文：必填项 + 反参考 + 3–5 条原则；禁止从代码推断感受；产物落 `local/projects/<project-id>/design/design-context.md`，无则问一轮再写 | `references/design-context.md` |
| 1 | 分流：这一屏是被读（页面）还是被操作（后台界面） | 下方分流表 |
| 2 | 指令契约：复述目标、列出会动的位置、声明不动的部分；一次只改一个维度 | `references/instruction-contract.md` |
| 3 | 新页面先写"主张 + 证据"清单，删掉没有主张的区块；素材诚实 | `references/gate-pages.md`（主张一节） |
| 4 | 过门禁：页面走 A1–A18，后台界面走 B1–B12 | `references/gate-pages.md` / `references/gate-app-screens.md` |
| 5 | 改已有页面：先存基线，再按字体→颜色→框架→状态→替换存量组件 | `references/change-order.md` |
| 6 | 看-修循环：只看截图，七维 0–4 分，只修最低三项，三轮封顶 | `references/scorecard.md` |
| 7 | 测量与交付报告：声明做了什么、没做什么、哪些是占位 | `references/measurement.md`、`references/report.md` |

## 分流

| 类型 | 特征 | 走哪套 |
|---|---|---|
| 页面 | 被读、被滚动：落地页、产品页、作品集、活动页 | 门禁 A1–A18 |
| 后台界面 | 被操作：仪表盘、列表、设置、收件箱、编辑器 | 门禁 B1–B12（含 A 的排版与色彩条目，另加 B 专属项） |

产品页里展示的界面片段按后台界面规则画内部，共用页面的配色与字体。同一需求含两者时各走各的规则，只共享一套 token。

## 不可让位的四条

这四条不是风格偏好，任何项目、任何指令下都必须成立，用户要求豁免时说明后果后仍按用户要求执行并记录：

1. 可读：正文 ≥16px、主墨色、对比度达标，任何宽度下标题 ≤2 行。
2. 不欺骗：不编造客户、评价、媒体、logo、经营数据；占位内容必须标明。
3. 状态完整：空、加载、错误、无权限四种状态都有设计。
4. 不破坏：有 `prefers-reduced-motion` 兜底；文字不被浮层遮挡；焦点可见。

## 与既有技能的关系

| 场景 | 用谁 |
|---|---|
| 产出设计稿、可交互原型、HTML 交付物 | `baoyu-design` 产出，本技能定方向、过门禁 |
| 少量结构变体做取舍 | `prototype`（UI 分支）生成变体，本技能提供评分卡与门禁 |
| 真实业务页面改版 | 本技能定顺序与门禁，实现走所在项目的工作流 |
| 纯技术审查（a11y 细节、性能、包体） | 本技能只做设计侧判定，工程侧走 `code-review` 与项目验证 |

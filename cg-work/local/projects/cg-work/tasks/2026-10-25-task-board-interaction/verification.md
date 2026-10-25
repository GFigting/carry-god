# 验证记录

## 自动检查

| 检查 | 命令 | 结果 |
|---|---|---|
| 类型检查与构建 | `npm run build`（framework-visualization） | 通过，`vue-tsc` 无报错 |
| 框架校验 | `npm run check` | 通过（任务记录与设计上下文档位已登记） |
| 浏览器验收 | `node run.mjs --project cg-work --suite design-preview prepare` → browser-use → `verify` | passed，12/12 步，run `20261025-035034-design-preview` |

浏览器证据目录：`local/tools/browser-test/cg-work/runs/20261025-035034-design-preview/`（`result.json`、`screenshots/page-shell.png`、`screenshots/board-expanded.png`，均为 1980×6050 全页截图）。

## 数据抽查

- 待验收队列共 12 项：review 10 项（cg-work 4、job-hunt 6）+ 显式等待用户 2 项；其中 6 项停留 ≥3 天，最长 27 天（`job-hunt/2026-09-27-board-empty-collapse`）。
- 停留口径抽查：新任务取 `status_history` 进入 review 的 `at`（如 `cg-work/2026-10-24-browser-test-cg-work-target` → 1 天，来源 `status_history`）；job-hunt 旧任务无带时间的历史，退到 `created_at` 并标注「创建日」；两者都在页面写明来源。
- 时区抽查：`status_history.at` 原值 22:35:27 与页面显示一致；修复前曾按二次 Date 转换显示为 14:35:27（-8 小时），已回归。
- 状态覆盖：chips 覆盖 pending / in_progress / review / blocked / done / cancelled / 已归档；矩阵、明细与排序均接受所有状态，`blocked` 列已补入（同时修复既有缺陷 #1）。

## 设计门禁（后台界面 B1–B12）

- B1 信息层级：待验收队列排在统计 chips、矩阵与明细之前，页面打开即见积压结论。
- B2 选项数量：筛选 chips 单行 8 项、排序 3 项、项目筛选 ≤4 项；均在一行内，无长下拉。
- B3 表格：数字列右对齐，列头为「停留（天）」，排序按钮有 `.on` 选中态，展开行不改变列宽。
- B4 四种状态：队列空态、明细「无匹配任务」已覆盖；静态快照无 loading / error / 无权限态，README 已声明构建期生成、零运行时请求，不构成错误状态缺失。
- B6 数据可信：停留来源逐条标注；缺失显示 `—`；旧任务不会伪装成精确时刻。
- B7 不只靠颜色：状态用文字 pill、停留用数字 + 「天」、队列用「等待用户 / 审查中」标签，颜色仅作强调。
- B8 键盘可达：任务行 `tabindex=0`、Enter/Space 展开、`aria-expanded`；chips、排序、复制按钮均为原生 `button`，展开行有 `focus-visible` 描边。
- B10 布局稳定：任务 ID `word-break: break-all`，表格置于横向滚动容器；全页截图未见溢出或重叠。
- B12 降级：未使用渐变、发光或滚动动画；补充 `prefers-reduced-motion` 兜底。

## 失败与修正

- 时区：`wallClock(Date)` 对已归一化字符串再次转 Date，造成 -8 小时；改为状态历史按 ISO 字符串字典序取最大，不再二次转换。
- 队列口径：最初把 job-hunt 旧版 `next_user_action.required` 的 done 任务纳入队列，膨胀到 20 项；改为与 `scripts/acceptance-queue.mjs` 同口径（`review` 或 `next_action.required`），收敛到 12 项。
- 子代理观察：两次 browser-use 验收在第 7/8 步报告「URL 未变 / 未展开」；用 Chrome DevTools 直接触发点击并读取 DOM 与 `location.href`，确认筛选、展开、URL 同步与刷新还原均生效，判定为子代理观察时机问题，非页面缺陷。最终截图改用 headless Edge 直接访问带参 URL 取得。

## 未覆盖

- 「复制验收命令」只做了按钮存在与文案校验，未实际点击验证剪贴板写入。
- 归档视图（`?archived=1`）仅代码路径校验，未单独截图。
- 仅在 1440 逻辑宽度（DPR 1.375）下验收，未在移动端真机与 4K 屏实测。

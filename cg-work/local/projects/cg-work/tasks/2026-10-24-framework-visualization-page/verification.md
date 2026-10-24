# 验证记录

## 标准编码前置检查

- 项目自动检查：`npm run check` 通过（`cg-work checks passed`）；build.mjs 构建时自动执行该校验并将结果内嵌页面「框架健康」区。
- 当前差异人工检查：本次为纯新增原型文件（`design/framework-visualization/` 下 build.mjs、template.html、index.html），无既有逻辑改动。定向人工检查项：无硬编码密钥；`grep -E 'https?://|src=|link rel|@import|url\('` 确认零外部资源（仅 SVG 内部 `url(#…)` 引用）；动态渲染全部经 `textContent` 注入，无 HTML 字符串拼接（无 XSS 面）。
- 不适用项：无数据库操作、无接口变更、无 SQL。

## 构建与数据对账

- `node local/projects/cg-work/design/framework-visualization/build.mjs` 输出：`index.html 已生成：92 个任务，86 个提交（2026-09-01 起），check=passed`。
- 磁盘对账（同一快照）：任务 92 = 活跃 63 + 归档 29；活跃 63 = done 51 + in_progress 6 + review 5 + pending 1 + cancelled 0。与页面 chips、矩阵、明细表三处数字一致。
- 项目矩阵对账（状态列含归档任务，故各行状态数之和即合计）：cg-work 69 = done 65（含归档 28）+ in_progress 3 + cancelled 1（归档）；job-hunt 22 = done 14 + in_progress 3 + review 5；stock-reports 1 = pending 1。全局 92 = 活跃 63 + 归档 29。
  - 注：并发会话于构建前后将 report-site 更名为 stock-reports，页面为构建时快照，反映更名后状态。

## 页面验收（browser）

- 工具：`msedge --headless=new --window-size=1440,6200 --screenshot`，file:// 直开（无本地服务）。
- 人工检查（截图两轮 + 局部放大四张）：
  1. 六大区块全部渲染：框架地图 / 状态机 / 任务看板 / 工作流与交付路径 / 提交时间线 / 需求箱与健康；
  2. 亮色主题，纸底 + 发丝线，无深色面板；文字无截断、无元素重叠；
  3. 状态机图与 `core/operating-model.md` 允许转移表逐条一致（含 blocked→pending/in_progress、done/cancelled 终态无出边、不得跳过 review）；
  4. 时间线 86 个提交、28 个活跃天、峰值 2026-09-28 × 11、近 7 天 17，与 git log 聚合一致；
  5. 需求箱与文件计数（core 13 / workflows 10 / scripts 9 / test 15）与磁盘一致。
- 控制台：加载过程无 JS 错误（渲染逻辑同步执行，无外链阻塞）。

## 结论

构建通过、数据对账一致、页面验收通过。本原型无自动化测试（界面类交付，按比例原则以人工验收为准）。

# 框架可视化页面实施计划

## 目标

为 cg-work 框架生成一个零外链依赖的单页可视化原型：一页看全框架目录地图、任务状态机、实时任务看板、工作流速查、交付路径三档与提交活动时间线。

## 范围

### 包含

- 数据管线脚本：扫描 `local/projects/*/tasks/` 的 `task.yaml` 与 git 提交历史，生成内嵌 JSON 快照。
- 单页原型：`local/projects/cg-work/design/framework-visualization/index.html`，内联 CSS/JS/SVG，双击即开。
- 六个视图：框架地图、任务状态机、任务看板（项目×状态矩阵 + 明细）、工作流速查、交付路径三档、提交时间线。

### 不包含

- 不修改框架任何规则、脚本、技能或校验器。
- 不做多页面应用、不做后端服务、不引入任何外部 CDN 或字体。
- 不替代 `npm run check` / `npm run queue` 等既有入口，页面是只读镜像。

## 需求与验收

- 需求来源：用户 2026-10-24 确认的框架可视化页面提案（六项内容清单 + `local/projects/cg-work/design/` 落地位置）。
- 验收标准：
  - [ ] 单文件 HTML 在无网络环境可打开，控制台无错误，六大区块全部渲染。
  - [ ] 任务看板数字与磁盘上 `task.yaml` 实际聚合一致（91 任务：done 79 / in_progress 5 / review 5 / pending 1 / cancelled 1，允许新任务产生合理偏差）。
  - [ ] 状态机图与 `core/operating-model.md` 的允许转移表逐条一致（含不得跳过 review、终态无出边）。
  - [ ] headless 截图人工验收：亮色主题、无重叠、无截断。
  - [ ] `npm run check` 通过，task.yaml 可解析。

## 测试用例

界面与交互以人工验收为准，不为本原型配自动化测试（无数据不可逆、无红线逻辑、无核心业务逻辑变更）。

## 影响范围

- 新增：`local/projects/cg-work/design/framework-visualization/index.html`、数据管线脚本（随任务记录提交，属框架受管项目记录）。
- 调用方和依赖方：无；页面不参与框架校验，`check-all.mjs` 只巡检 cg-work 任务 YAML 可解析性。

## 实施步骤

1. 任务记录（task-stamp 创建）+ 本计划（含原型实现契约）。
2. 数据管线：Node 脚本扫描任务与 git 历史 → 输出 JSON → 内嵌 HTML。
3. 构建单页原型（内联全部资源）。
4. 验证：headless Edge 截图自查、数字对账、`npm run check`。
5. review 收尾：写 review.md（原型采纳）与 verification.md，本地提交。

## 计划审核

- 需求覆盖：完整，六项视图全部实现。
- 范围边界：无越界；只读镜像，不动框架规则。
- 依赖与顺序：数据管线先行，HTML 依赖其输出。
- 验收与验证：验收条件可观察；headless 截图 + check 命令明确。
- 风险与回滚：主要风险为数据快照与磁盘不一致——页面标注快照时间，刷新脚本可重生成；回滚即删除 design 目录。
- 审核结论：通过
- 审核意见来源：主 Agent 自审，方向经用户确认

## 验证

- 自动化测试：不适用（原型无自动化测试）。
- 静态检查或构建：`npm run check`；HTML 用 node --check 不适用，改用无头浏览器加载验证。
- 页面、接口或用户验收：`msedge --headless=new --screenshot` 截图 + Read PNG 人工检查；数字与磁盘 task.yaml 聚合对账。

## 标准编码前置检查

- 计划列出需常量化的枚举与重复字面量：任务状态集合（`STATUS_ORDER` / `STATUS_LABEL` / `STATUS_CLASS`）与交付路径三档（`dpDefs`）在模板 JS 中各只有一处定义，看板、矩阵、明细表共用；数据注入点为单一占位符 `/*__CG_DATA__*/`。
- 允许保留的例外：状态机 SVG 的节点坐标、曲线路径与配色属于静态图形数据，内联不抽取；时间线日期轴由数据驱动计算，无重复字面量。
- 编码顺序：先定义数据契约（build.mjs 输出的 JSON 结构）与上述枚举，再写渲染逻辑。
- 提交前静态检查：`npm run check`（构建时由 build.mjs 实际执行并内嵌结果）；对新增文件做定向人工检查——无硬编码密钥、无外部资源引用、动态渲染一律 `textContent` 注入（无 XSS 面）。

## 风险与交付

- 风险和环境限制：截图工具需 Windows 绝对路径；页面零外链以避免 sandbox 代理拦截外链资源。
- 集成方式：本地提交（任务记录与 design 产物），不推送。

## 原型实现契约

### 问题与目标

框架规则分散在 README、core/、workflows/、skills/ 与 91 个任务记录中，新人（或回归中的自己）难以一页看全景。目标：一个零依赖单页，把"框架是什么、任务怎么流转、现在进行到哪、提交活跃度如何"一屏说清。

### 状态与场景

- 静态展示态：默认视图，全部区块一页可览。
- 交互态：任务看板支持按项目筛选、状态机节点可点击查看门禁说明、时间线 tooltip 显示当日提交数。
- 场景：本地双击打开 / 无头截图验收；宽屏 ≥1200px 为主，≥768px 自适应堆叠。

### 视觉与响应式约束

- 亮色主题（当前 IDE light）：暖白纸底 `#faf9f7`、发丝线边框、深色文字；与 job-hunt 纸感编辑令牌同系。
- 语义色：done=绿、in_progress=蓝、review=琥珀、pending=灰、cancelled/blocked=红。
- 系统字体栈，零外链字体；SVG 内联手绘状态机；单文件 ≤ 400KB。
- 断点：1200px 三栏 → 768px 双栏 → 单栏堆叠。

### 资源与依赖

- 无外部依赖；数据以 JSON 字面量内嵌，标注快照生成时间。
- 数据来源：`local/projects/*/tasks/**/task.yaml`（status/workflow/delivery_path）、`git log --since=2026-09-01`。

### 交互与业务规则

- 页面只读，不写任何文件；所有数字标注"截至 <快照时间>"。
- 看板筛选不改变底层数据，仅前端过滤。
- 状态机图必须如实反映允许转移表，不得美化或省略 blocked/cancelled。

### 验收映射

| 验收标准 | 验证方式 |
|---|---|
| 无网可开、控制台无错误 | headless 加载 + 截图 |
| 看板数字对账 | 与聚合脚本输出比对 |
| 状态机一致 | 与 operating-model.md 转移表逐条核对 |
| 亮色无重叠 | 截图人工检查 |
| npm run check 通过 | 命令输出 |

# 任务看板交互优化

## 目标

让「任务看板」在 30 秒内回答三个问题：哪些任务卡在 review、各卡了多少天、下一步该做什么。用户反馈大量任务长期停在 review，而当前看板只有状态计数和静态表格，看不到停留时长，也无法从页面直接定位到具体任务。

## 已确认决策

| 项 | 选择 |
|---|---|
| 交互范围 | 待验收队列 + 任务行展开详情 + 筛选排序增强 + 停留高亮（用户全选） |
| 状态覆盖 | 所有状态都要：pending / in_progress / review / blocked / done / cancelled / 归档都可筛选与查看停留 |
| 停留口径 | 优先 `status_history` 中当前状态最后一条 `at`；缺失时退到该 `task.yaml` 的最后提交日期（git），再退到 `created_at` |
| 验收动作 | 页面只生成可复制的 `node scripts/acceptance-queue.mjs --accept <id> --note "验收通过"` 命令，不写回 `task.yaml` |
| 设计方向 | 沿用纸底/发丝线 token 与等宽数字；差异化是直接标出「停留 N 天」 |
| 只读定位 | 不新增运行时请求、不新增本地写接口 |

## 设计上下文

- 新建 `local/projects/cg-work/design/design-context.md`（此前不存在），并登记到项目上下文 `documentation.development_standards`，`load: when_relevant`。
- 受众：框架维护者本人；用途：30 秒内定位卡在 review 的任务；调性：务实、克制、可核对；反参考：蓝紫渐变 SaaS 仪表盘、发光卡片。
- 界面分流：本区块被操作（筛选、排序、展开），按后台界面门禁 B1–B12 验收；空状态、键盘焦点与只读诚实性必须覆盖。

## 会动

- `framework-visualization/scripts/collect.mjs`：任务记录补 `created_at`、`updated_at`、`entered_at`、`days_in_status`、`dwell_source`、`next_action`、`status_history`、`goal`、`task_file`、`git_updated_at`
- `framework-visualization/src/types.ts`：`TaskRecord` 字段同步
- `framework-visualization/src/sections/BoardSection.vue`：待验收队列、行展开详情、状态/项目筛选、三种排序、停留天数标记、复制验收命令、URL 参数
- `framework-visualization/src/styles.css`：仅新增队列、停留标记、展开行、复制按钮所需类
- `framework-visualization/README.md`：补充新增字段与交互说明
- `local/tools/browser-test/cg-work/test-suites.json`：`design-preview` 增加待验收队列与 review 筛选断言
- `local/projects/cg-work/project-context.yaml`：登记设计上下文

## 不动

- 其它五个区块的文案、结构与交互；页面标题与导航
- `vite.config.ts` 的虚拟模块注入方式与开发态重建逻辑
- 现有 token 色值、字号体系、表格样式基调
- 扫描口径本身：仍读 `local/projects/*/tasks/**/task.yaml`，不新增数据源；git 仅用于补充文件最后提交日期

## 标准编码前置检查

- 时间字段全部由脚本写入；本次只读取 `task.yaml`，不手写 `created_at` 或 `status_history[].at`。
- 停留天数计算集中在一处函数（`collect.mjs` 的 `dwellDays`），不在多个组件重复实现。
- 复制命令统一由 `acceptanceCommand(task)` 生成，格式与 `scripts/acceptance-queue.mjs` 用法一致。
- 不新增依赖；`js-yaml` 已是现有依赖，git 日期用一次 `git log` 批量取，避免逐任务起进程。
- 提交前运行 `npm run build`（含 `vue-tsc` 类型检查）与 `npm run check`。

## 步骤

1. 落盘设计上下文并登记到项目上下文；建任务记录。
2. `collect.mjs` 补齐任务元数据，`types.ts` 同步字段。
3. `BoardSection.vue` 重做看板：统计 chips 改为筛选、queue 卡、矩阵停留提示、明细表展开与排序。
4. `styles.css` 新增视觉类，保持既有 token。
5. `npm run build`，静态服务托管 `dist/`。
6. browser-test `design-preview` 复验并留存截图证据。
7. 更新 README 与任务验证/审查记录，跑 `npm run check`。

## 验收标准

- 看板顶部出现待验收队列，review 或 `next_action.required` 的任务按等待状态与停留天数排序，可直接复制验收命令。
- 点击任意任务行原地展开详情：目标、创建时间、当前状态进入时间与来源、状态历史、下一步动作、文件路径。
- chips 可筛选所有状态与归档；排序支持默认 / 停留最久 / 状态；刷新后视图可由 URL 参数复现。
- 停留天数 ≥3 天有标记，≥7 天标记为久；矩阵单元悬浮可见该状态最久停留。
- 空状态、键盘焦点、`prefers-reduced-motion` 兜底不缺失；页面仍零运行时请求。
- `npm run build`、`npm run check`、`design-preview` 套件全部通过。

## 风险与退路

- 老任务 `status_history` 缺失或 `at` 为 `null`，停留天数会退化到 git 提交日期，可能偏大；页面明确标注来源，避免伪装成精确值。
- jobs-hunt 等业务项目任务文件不在 git 跟踪内时，git 日期不可用，退到 `created_at`。
- 全量 git log 解析在提交很多时会拖慢构建；用单次命令并只保留命中任务路径的首个日期。
- 若展开行导致表格横向溢出，优先收紧停留列与详情网格，不改整体栅格。

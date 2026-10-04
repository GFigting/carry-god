# 项目路线图产物

## 问题事实

| 编号 | 事实 | 证据 |
|---|---|---|
| P1 | 框架只有"需求拆分索引"，没有项目路线图 | 检索"项目路线图/里程碑"零命中；`roadmaps/` 与大任务拆分绑定 |
| P2 | 方法有、落盘位置无 | `framework:product-management` 的 `## Roadmap and backlog` 与 `## Release acceptance` 定义方法，但未规定位置，也无校验 |
| P3 | 该技能没有工作流文件 | `workflows/product-management.md` 不存在，只能显式调用，不能作为 `workflow:` 值 |
| P4 | 位置最初放错 | 首版把路线图放在框架本地 `local/projects/<project-id>/product/roadmap.md`；用户指正为**原项目仓库** |

## 受影响唯一来源

| 唯一来源 | 变更 |
|---|---|
| `core/project-roadmap.template.md` | 新增：项目路线图格式（六章节、切片表、状态取值、探索区、未决决策、版本验收） |
| `core/decomposition.template.md` | 由 `core/roadmap.template.md` 改名：明确它是**需求拆分索引**格式，与项目路线图区分 |
| `scripts/check-product.mjs` | 新增校验器：章节、切片表头、状态枚举、优先级、版本/主题登记、需求来源与任务引用路径、未决决策动作 |
| `scripts/check-project.mjs` | 新增可选字段 `product.roadmap_path` 校验（相对 `project.root_path`、路径必须存在） |
| `core/project-context.template.yaml` | 增加可选的 `product.roadmap_path` |
| `README.md`、`local/README.md`、`core/context-loading.md`、`core/README.md` | 说明两种路线图的区别与"原项目仓库内 + 上下文登记"的位置规则 |
| `skills/product-management/SKILL.md` | 落盘位置与校验方式写入技能正文 |
| `scripts/README.md` | 校验器用法与"框架不巡检项目路线图"的原因 |
| `test/check-product.test.mjs` | 新增 7 例（完整通过、非法状态与未登记主题、done 缺任务引用、引用不存在、无法解析的裸 id、未决决策缺动作、缺章节） |
| `scripts/check-product.mjs`（跨仓库引用） | 路线图在业务仓库，引用允许写"任务 id"或"需求包文件名"；通过 `product.roadmap_path` 反查所属项目后解析到框架本地记录 |
| `VERSION` | 2.23.0 → 2.24.0 |

## 设计取舍

- **放在原项目仓库，不放在框架本地**：项目路线图是项目文档，应随项目代码版本化、团队可见；框架本地只留需求包与任务证据。位置用上下文可选字段登记（与 `prototypes.paths` 同一模式），因此多仓项目也能指向主仓库。
- **框架不巡检项目路线图**：它不在框架仓库内，CI 无法读取；`check-product.mjs` 按登记路径手动或由项目自身执行（与 `check-project.mjs` 同一策略）。
- **命名消歧**：把上一轮新建的拆分模板改名为 `decomposition.template.md`，让"roadmap"只表示项目路线图；`roadmap.template.yaml` 与 `roadmap-closure.template.md` 两个历史模板继续作为替代说明存在。
- **不加新工作流**：`framework:product-management` 保持"显式调用的技能"身份，避免为一次性身份再造一个工作流文件。
- **首版放错位置的处置**：删除框架本地那份路线图（内容是框架自身工作，已由任务记录承载），不迁移进任何项目仓库。
- **跨仓库引用写法**：路线图在原项目仓库，无法用框架本地相对路径，因此 `任务引用` 允许写任务 id、`需求来源` 允许写需求包文件名；校验器通过项目上下文登记的 `product.roadmap_path` 反查项目后解析这些引用。无法关联项目时按格式处理，不误报。

## 非目标

- 不把项目路线图写进任何未指定的业务仓库；用户指定 job-hunt 后仅在 `D:/songgf/Projects/all-work/job-hunt/docs/roadmap.md` 创建，不改动该仓库其他文件。
- 不在框架本地保留项目路线图副本，避免双份真相。
- 不新增 `workflows/product-management.md`。
- 不改需求拆分索引的既有路径与字段（`roadmaps/`、`roadmap_reference`、`closure_reference` 保持有效）。

## 兼容性判断

- 新字段 `product.roadmap_path` 可选，未登记的项目上下文不受影响。
- 路线图校验器独立运行，不进入 `check-all`，因此不改变框架 CI 的行为。
- 拆分模板改名只影响框架自有引用（技能与 core 索引），无历史任务记录引用该文件。

## 验证范围

1. `node scripts/check-product.mjs` 对完整样例通过、对六类缺陷逐个报错。
2. `node scripts/check-project.mjs` 对登记了 `product.roadmap_path` 的上下文校验路径存在性；未登记时不受影响。
3. `npm test` 与 `npm run check` 通过。
4. 131 条任务记录全量复校验失败数不增加（3 条）。
5. 全框架检索：不再出现"项目路线图放在 `local/projects/`"的表述。

## 实施清单

- [x] 项目路线图模板与拆分模板改名
- [x] `check-product.mjs` 校验器与 6 个测试
- [x] `product.roadmap_path` 上下文登记与校验
- [x] 入口、上下文、本地目录与技能正文同步
- [x] 删除放错位置的框架本地路线图
- [x] 版本号提升
- [x] 首个真实项目路线图：按用户指定创建于 job-hunt 仓库（`docs/roadmap.md`）并登记 `product.roadmap_path`

## 验证结论

执行日期：2026-10-02。

| 验证项 | 命令 | 结果 |
|---|---|---|
| 路线图校验器正例 | `node scripts/check-product.mjs`（临时完整样例） | 通过 |
| 路线图校验器反例 | `test/check-product.test.mjs` 七例 | 非法状态、未登记主题、done 缺任务引用、引用不存在、无法解析的裸 id、未决决策缺动作、缺章节均被拒绝 |
| 跨仓库路线图校验 | `node scripts/check-product.mjs D:/songgf/Projects/all-work/job-hunt/docs/roadmap.md` | **通过**：按 `product.roadmap_path` 反查到 job-hunt，任务 id 与需求包文件名全部解析成功 |
| 上下文登记校验 | `node scripts/check-project.mjs local/projects/job-hunt/project-context.yaml` | 通过（`product.roadmap_path` 存在性与相对性） |
| 框架回归测试 | `npm test` | 73 通过 / 0 失败 |
| 框架全量校验 | `npm run check` | 通过（框架本地已无路线图，断链消失） |
| 记录全量复校验 | 逐条 `node scripts/check-task.mjs` | 132 条中失败 3 条，与改动前一致 |
| 位置规则检索 | 全框架 grep | 不再有"项目路线图放在 `local/projects/`"的表述 |

## 审查结论

自查：位置规则与用户指正一致（原项目仓库 + 上下文登记），框架本地不留副本；校验器与上下文校验各管一段（内容 vs 路径），互不越界；拆分模板改名只动了框架自有引用；首版放错的文件已删除且未擅自写入业务仓库。未新增工作流，也未改动拆分索引的既有路径与字段。

## 交接与集成决策

状态：`review`，等待用户验收；未提交、未推送。

已完成交付：

- 框架侧：格式模板 `core/project-roadmap.template.md`、校验器 `scripts/check-product.mjs`、上下文字段 `product.roadmap_path`（模板与校验）、拆分模板改名 `core/decomposition.template.md`、入口与技能正文同步。
- 项目侧：**job-hunt 项目路线图已创建**于 `D:/songgf/Projects/all-work/job-hunt/docs/roadmap.md`，内容取自该项目真实的拆分索引与 8 个任务状态，未臆造；`local/projects/job-hunt/project-context.yaml` 已登记 `product.roadmap_path`。

待用户处理：

- job-hunt 仓库内的 `docs/roadmap.md` 是新文件，需在该仓库自行提交（我未对其做任何 Git 操作）。
- 路线图的三条未决决策：外部市场数据源是否接入、P0 真机冒烟何时安排、P3 是否提前。

遗留：框架侧建议按版本 2.24.0 并入提交；推送仍需单独授权。

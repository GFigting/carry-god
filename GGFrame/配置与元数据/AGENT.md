---
type: agent-guide
module: "配置与元数据"
version: "1.0"
updated: "2026-05-24"
---

# 配置与元数据 — Agent 使用指引

## 何时读取本板块

- Agent 需要为文档填写 frontmatter 标签时（必须遵循标签体系）
- Agent 创建新文件时（必须遵循命名规范）
- Agent 需要编写 Dataview 查询来检索文档集合时
- Agent 对框架的使用方式有疑问时（查 FAQ）
- Agent 不确定某个操作的规范时（查命名规范、标签体系）
- Agent 新建文件时不知道应该放在哪个目录、用什么文件名时
- Agent 需要了解 Obsidian 插件配置时

## 板块结构

```
配置与元数据/
├── AGENT.md                 ← 本文件
├── 标签体系.md              ← 完整标签分类和使用规范
├── 命名规范.md              ← 文件命名、ID 命名的全部规则
├── Dataview查询集.md        ← 常用 Dataview 查询汇总（可直接复制使用）
├── FAQ.md                   ← 框架、Obsidian、协作相关常见问题
└── 推荐插件清单.md          ← Obsidian 推荐插件列表
```

## 关键文件索引

| 文件 | 用途 | 读取优先级 |
|------|------|:--:|
| `标签体系.md` | 6 类标签（type/status/role/work/priority/domain/project/tool）的完整定义 | P0 |
| `命名规范.md` | 10 种文件类型的命名格式、ID 命名规则 | P0 |
| `FAQ.md` | 框架设计理念、Obsidian 使用、多人协作的常见问答 | P1 |
| `Dataview查询集.md` | 任务、知识、流程、角色、统计等场景的 Dataview 查询模板 | P2 |
| `推荐插件清单.md` | Obsidian 推荐插件列表和用途说明 | P2 |

## 标签体系速查

Agent 在创建或修改文件时，必须正确使用标签。以下为核心规则：

### 必选标签

| 文档类型 | 必选 type 标签 | 额外必选标签 |
|---------|---------------|-------------|
| 角色定义 | `type/role` | `role/{角色标识}` |
| 工作类型定义 | `type/work-type` | `work/{分类}` |
| 任务记录 | `type/task` | `status/{状态}`, `work/{分类}`, `priority/{级别}` |
| 流程定义 | `type/process` | — |
| 知识文章 | `type/knowledge` | `domain/{领域}` |
| 日报 | `type/daily-log` | — |
| 周报 | `type/weekly-report` | — |
| 会议记录 | `type/meeting` | — |
| 检查清单 | `type/checklist` | — |
| MOC 索引页 | `type/moc` | — |
| 配置/元数据 | `type/config` | `domain/meta` |

### 标签层级结构

所有标签使用 `/` 分隔的层级结构：
- `type/` — 文档类型（必有）
- `status/` — 状态（draft / active / archived / deprecated）
- `role/` — 角色标识
- `work/` — 工作分类（development / operations / architecture / testing / management / research / incident）
- `priority/` — 优先级（p0-critical / p1-high / p2-medium / p3-low）
- `domain/` — 技术领域（frontend / backend / infrastructure / data / security / mobile / meta）
- `project/` — 项目标识（按实际项目动态添加）
- `tool/` — 工具标识（git / docker / kubernetes / jenkins / prometheus）

## 命名规范速查

Agent 创建文件时必须遵循以下命名规范：

| 文件类型 | 命名格式 | 存放目录 | 示例 |
|---------|---------|---------|------|
| 角色定义 | `ROLE-{中文名称}.md` | `角色体系/{分类}/` | `ROLE-后端开发工程师.md` |
| 工作类型 | `WT-{中文名称}.md` | `2.工作体系/{分类}/` | `WT-新功能开发.md` |
| 任务文件 | `TASK-YYYY-NNN.md` | `任务系统/进行中/` | `TASK-2026-001.md` |
| 流程定义 | `PROC-{中文名称}.md` | `4.流程引擎/{分类}/` | `PROC-需求到上线.md` |
| 检查清单 | `CHK-{中文名称}.md` | `通用能力层/检查清单/` | `CHK-上线前检查清单.md` |
| 工具手册 | `UTIL-{工具名称}操作手册.md` | `通用能力层/工具集/` | `UTIL-Git操作手册.md` |
| 会议纪要 | `MTG-YYYY-MM-DD-{主题}.md` | `7.日志与追踪/会议纪要/` | `MTG-2026-05-24-迭代回顾.md` |
| 日报 | `YYYY-MM-DD.md` | `7.日志与追踪/日报/YYYY/` | `2026-05-24.md` |
| 周报 | `WK-YYYY-NN.md` | `7.日志与追踪/周报/YYYY/` | `WK-2026-22.md` |
| MOC 导航 | `Emoji_{中文名}.md` | 各板块根目录 | `🗺️_知识地图.md` |

核心原则：
1. 文件名主体用中文，标识符前缀用英文/拼音缩写
2. 日期统一用 ISO 8601 格式：`YYYY-MM-DD`
3. 避免空格和特殊字符，用 `-` 或 `_` 替代
4. 归档文件保持原名，通过 `status: archived` 标记

## Dataview 查询的使用

`Dataview查询集.md` 提供了按场景分类的 Dataview 查询模板，涵盖：

- **任务相关**：我的待办、活跃任务看板、阻塞任务、待审核、本周到期、逾期任务
- **知识相关**：知识库总览（按领域分组）、指定领域知识、最近更新
- **流程相关**：所有流程清单
- **角色相关**：所有角色清单
- **日报/周报相关**：本周日报汇总
- **元数据统计**：文档类型分布、任务状态分布

**Agent 使用原则**：
- Dataview 查询块是为 Obsidian 人类用户准备的动态可视化工具
- Agent 不需要执行 Dataview 查询（这些是 Obsidian 插件功能，非通用 Markdown）
- Agent 可直接使用 Grep/Glob 搜索工具来查找文件，效果更佳
- 如果人类要求查看某个 Dataview 查询的结果，应告知 Dataview 是 Obsidian 插件功能，建议在 Obsidian 中打开对应文件查看

## FAQ 常见问题

`FAQ.md` 涵盖了三大类问题：

1. **框架相关**：与 Jira 的关系、角色太多怎么办、文档维护成本、REVISION vs BLOCKED 区别
2. **Obsidian 相关**：为什么选 Obsidian、模板使用方式、Dataview 查询不生效
3. **协作相关**：多人协作方式、如何避免文档混乱

**Agent 使用原则**：
- 初次接触框架时，建议浏览 FAQ 了解设计理念
- 遇到角色合并、状态选择等疑问时，FAQ 中有对应解答
- FAQ 中的回答代表了框架的设计意图，Agent 应遵守其中的约定

## 与其他板块的联动

- **所有板块**：标签体系和命名规范是全局约束，创建任何板块的文件都必须遵守
- **根 CLAUDE.md**：命名规范和标签体系在 CLAUDE.md 中有速查表，此处提供完整定义
- **任务系统**：任务文件的 frontmatter 是标签规范的最主要应用场景
- **角色体系**：角色定义文件必须使用 `role/` 标签
- **知识沉淀**：知识文档必须使用 `domain/` 标签
- **导航系统**：知识地图中引用了本板块的所有配置文档

## Agent 操作清单

1. **创建文件前查命名规范**：确定文件名格式和存放目录
2. **填写 frontmatter 前查标签体系**：确认应该使用哪些 type/status/role/work/domain 标签
3. **遇到疑问查 FAQ**：框架使用、Obsidian 操作、协作方式的问题先看 FAQ
4. **需要 Dataview 查询时查查询集**：复制已有模板，按需修改字段
5. **不确定规范时查本板块**：标签、命名、FAQ 是全局约束，理解并遵守这些规范
6. **注意权限边界**：Agent 不得修改 `配置与元数据/` 下的文件（标签体系、命名规范等是基础元数据，变更需要人类决策）

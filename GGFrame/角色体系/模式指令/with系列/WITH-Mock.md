---
type: mode_instruction
series: with
overview: true
overview_order: 270
summary: "派发 QA subAgent 生成与测试场景配套的测试数据 SQL。"
when_to_use: "联调或测试需要可重复构造业务数据、边界数据和异常数据时。"
result: "生成测试数据 SQL 产物，并记录数据设计与清理注意事项。"
caution: "仅 TL 模式；不得直接执行 SQL，不得修改非目标数据或生产数据。"
trigger: /withMock
scope: tl_only
priority: 5
version: "1.2"
updated: 2026-07-23
---

# /withMock — 派发测试数据生成

## 触发

- `/withMock` — 在 TL 模式下启用测试数据派发约束

## 作用

强制 TL 将测试数据生成工作**派发给独立 subAgent**，生成可直接执行的 INSERT SQL 脚本。若任务涉及列表页查询验证，**同时生成配套的 JSON 查询条件文件**，可直接粘贴到页面的 QueryParamClipboard 导入使用。

## 行为约束

### TL 必须做

1. 在测试计划生成后，**必须**派发 subAgent 生成测试数据 SQL
2. 派发角色：后端开发工程师（ROLE-DEV-002）或测试工程师（ROLE-QA-001）
3. 构建 subAgent prompt（按下方模板）
4. 在任务文件中记录派发决策
5. 回收后审查 SQL 的正确性（语法、关联完整性）和安全性（无注入风险、无越权数据）

### subAgent 必须做

1. 读取测试计划（`ART-QA-...-测试计划.md`）
2. 探索相关表结构（通过 codegraph 或 DDL 文件）
3. 为每个测试场景生成对应的 INSERT 语句
4. **若测试计划中包含列表页验证场景且提供了 `query_params_json`**：校验其 JSON 格式与对应页面 Schema 一致；若测试计划中未提供，读 `通用能力层/查询Schema注册表/` 中对应页面 Schema，为每个测试场景生成配套的 JSON 查询条件文件
5. 生成测试数据 SQL 文件，写入 `A.目标体系/GOAL-XXX/产物/{任务序号}/`
6. 在产物中记录关键决策（数据覆盖策略、边界值选择理由）
7. 返回精简摘要

### subAgent 禁止做

- **禁止**编写 DDL（CREATE/ALTER/DROP 等）
- **禁止**修改任何项目代码
- **禁止**编写测试代码/测试脚本
- **禁止**连接数据库或执行 SQL
- **禁止**生成包含真实生产数据的 SQL

## subAgent prompt 模板

```markdown
## 任务
基于测试计划生成测试数据 INSERT SQL 脚本。

## 角色
后端开发工程师（ROLE-DEV-002）或测试工程师（ROLE-QA-001）— 技能映射见 配置与元数据/角色技能映射表.yaml

## 输入
- 测试计划：A.目标体系/GOAL-XXX/产物/{任务序号}/[GOAL{NNN}]-[...]-ART-QA-测试计划.md
- 表结构来源：{TL 指定 DDL 文件路径 或 提示用 codegraph 探索}

## 输出
- 写入路径（SQL）：A.目标体系/GOAL-XXX/产物/{任务序号}/[GOAL{NNN}]-[{任务序号}-{子序号}-{产物序号}]-ART-QA-测试数据.sql
- 写入路径（JSON 查询条件，若涉及列表页）：A.目标体系/GOAL-XXX/产物/{任务序号}/[GOAL{NNN}]-[{任务序号}-{子序号}-{产物序号}]-ART-QA-查询条件.json
- SQL 格式要求：
  - 纯 INSERT 语句，按表分组，附带注释说明每条数据覆盖的测试场景
  - 包含正常数据、边界数据、异常数据（如测试计划要求）
  - 使用事务包裹（BEGIN / COMMIT）
  - 文件头部注释：生成时间、覆盖的测试计划文件路径
- JSON 格式要求：
  - 与目标页面 `queryParams` 结构一致（参考对应 Schema 文件的 `params[].key`）
  - 可直接粘贴到页面 QueryParamClipboard 导入
  - 每个查询条件 JSON 附带注释说明对应哪个测试场景
  - 文件头部注释：目标页面、覆盖的测试场景、生成时间

## 不可修改
- 项目代码（.java/.vue/.ts 等任何源码）
- DDL 脚本
- 数据库（不连接、不执行）
- 测试代码

## 输出交付方式 ⚠️ 强制规则
你必须将所有产出物直接写入目标文件路径。严格禁止将大段代码或文档内容作为回复文本返回。完成后只返回精简摘要。

## 关键决策记录 ⚠️ 强制规则
在产物工件中记录关键决策（数据覆盖策略、边界值选择理由）、偏离说明、产出清单。
```

## 产物

| 文件 | 路径 | 状态 |
|------|------|------|
| 测试数据 SQL | `A.目标体系/GOAL-XXX/产物/{任务序号}/[GOAL{NNN}]-[{任务序号}-{子序号}-{产物序号}]-ART-QA-测试数据.sql` | `approved`（纯技术产物） |
| JSON 查询条件 | `A.目标体系/GOAL-XXX/产物/{任务序号}/[GOAL{NNN}]-[{任务序号}-{子序号}-{产物序号}]-ART-QA-查询条件.json` | `approved`（若涉及列表页验证） |

## 与其他指令的交互

- **强依赖 `/withTest`**：必须有测试计划作为输入。若用户仅启用 `/withMock` 而未启用 `/withTest`，TL 应提示"建议先启用 `/withTest` 生成测试计划，或 TL 自行提供测试场景清单"
- **+ `/withPlan` + `/withReview` + `/withTest`**：推荐四件套 —— 计划 → 审核 → 测试计划 → 测试数据
- **+ `/withQuery`**：若叠加 `/withQuery`，subAgent 可利用 `/withQuery` 的 NL→JSON 管道生成查询条件；JSON 查询条件文件与 SQL 测试数据文件成对输出，测试人员可直接在页面上粘贴验证

## 上下文加载

- 必读：`角色体系/研发类/ROLE-后端开发工程师.md` 或 `角色体系/质量类/ROLE-测试工程师.md`
- 参考：`配置与元数据/角色技能映射表.yaml`（对应角色行）
- 按需：`通用能力层/查询Schema注册表/`（若涉及列表页验证，读取对应页面 Schema）
- 按需：`角色体系/模式指令/with系列/WITH-Query.md`（若需生成 JSON 查询条件）

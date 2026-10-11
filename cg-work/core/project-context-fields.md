# 项目上下文字段规范

项目上下文是项目稳定事实和执行入口的唯一登记处：`local/projects/<project-id>/project-context.yaml`。

## 1. 顶层字段顺序

按 Agent 阅读项目的流程分为四组：

**项目边界**

1. `project`：项目身份和主仓库。
2. `repositories`：附属仓库及职责；单仓项目保留空列表。

**项目事实**

3. `documentation`：稳定文档关联及加载时机。
4. `technology`：技术栈和包管理器。
5. `runtime`：启动入口和健康检查。
6. `database`：SQL 脚本目录。

**执行入口**

7. `tooling`：按需读取的工具配置。
8. `verification`：按阶段组织的验证入口。
9. `requirements`：框架本地需求箱。

**项目产物与扩展**

10. `product`：项目级路线图。
11. `prototypes`：依赖项目代码的原型。
12. `skills`：项目专属技能目录。
13. `submission`：项目专用提交工具；没有时省略。

顺序只服务于阅读和维护，不改变 YAML 语义。校验器应校验字段结构和路径，不应把字段出现顺序当作业务条件。

## 2. 字段职责与必需性

| 字段 | 必需性 | 职责 | 不应放入 |
|---|---|---|---|
| `project` | 必需 | 稳定 ID、名称、领域、主仓库 | 运行命令、文档清单 |
| `repositories` | 推荐保留 | 多仓角色和路径 | 模块能力说明 |
| `documentation` | 必需 | 稳定文档的分类入口；每项含 `path`、`load` | 命令、路线图单一路径、任务证据 |
| `technology` | 必需 | 语言、框架、包管理器 | 测试和构建命令 |
| `runtime` | 必需 | 启动入口、健康检查 | 部署策略、验证结论 |
| `tooling` | 可选 | MCP 和开发工具配置路径 | 凭据、常驻规则 |
| `verification` | 推荐 | 可执行验证 profile 及限制 | 某次任务的新鲜结果 |
| `requirements` | 必需 | 原始需求箱路径 | 已拆分任务 |
| `prototypes` | 可选 | 项目仓库内原型目录和入口 | 框架本地设计产物 |
| `product` | 可选 | 项目级路线图路径 | 单个大需求拆分索引 |
| `database` | 可选 | SQL 变更、初始化和修复脚本目录 | 数据字典和数据库规则文档 |
| `skills` | 必需 | 项目专属技能路径 | 通用框架技能 |
| `submission` | 可选 | 项目专用提交工具和策略 | 用户临时授权 |

`required_context` 已废弃。必读文档使用 `documentation.*[].load: always`，按需文档使用 `when_relevant`，避免重复登记路径。

## 3. 优化规则

- `documentation` 只关联稳定、可复用的文档；暂时没有某类文档时保留空列表并记录缺口，不创建占位文件。
- `runtime`、`verification`、`database` 和 `product` 是专属入口，不把它们重复登记到 `documentation`。
- `technology` 只写技术事实；测试、构建和验收命令统一写入 `verification.profiles`。
- `database.sql_paths` 只写脚本目录；表结构、数据字典和迁移规则写入 `documentation.data`。
- `repositories` 只描述仓库边界；模块地图和能力地图写入 `documentation.architecture`。
- 除 `cg-work` 外，文件和目录路径使用绝对路径；`cg-work` 可使用相对于框架根目录的路径。
- 删除或改名字段时先更新模板、校验器、加载规范、所有受管上下文和测试，不能只修改单个项目文件。

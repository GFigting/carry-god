# 审查记录

## 审查范围

审查项目初始化和框架优化的 core、workflow、skill 分层，确认长期约束、任务路由和执行步骤没有互相重复或改变已有调用名称。

## 结论

未发现阻塞问题。

- `core/project-onboarding.md` 承担初始化门禁、项目关联不变量、需求箱和数据边界；`core/context-loading.md` 仅在需要时引用它。
- `workflows/project-initialization.md` 仅保留触发条件、任务状态与技能路由；初始化技能保留探测和生成步骤。
- `core/framework-maintenance.md` 承担版本、迁移、唯一来源、镜像和数据隔离约束；框架优化 workflow 仅保留阶段路由，技能仅保留变更地图和执行方法。
- `framework:project-initialization` 与 `framework:framework-optimization` 的名称、目录和工作流引用未改变。
- 本次为不改变外部流程的文档重构，因此初始版本从 1.6.0 升级为 1.6.1。

## 审查后对齐

- `AGENTS.md` 已在创建任务前明确原始需求箱步骤，与顶层 README 顺序一致。
- 顶层 README 已列出项目初始化和框架优化两种工作流。
- 版本分级正文只保留在 `VERSION` 段落；框架演进不变量只要求记录兼容性判断。
- `workflows/README.md` 的 review 阶段使用通用“审查”表述，适用于非代码的框架优化任务。
- `local/tools/` 已有 Git 忽略规则，实测其文件会被忽略，无需新增重复规则。

## 技能沉淀审查

- `framework-optimization` 仅增加通用的优化前检查：分层职责、技能类型、声明与实现对应关系、以及回归测试失败原因。
- 新增内容不包含项目名称、绝对路径、运行环境、具体故障、未跟踪文件或镜像漂移名单。
- 技能验证器确认其 frontmatter、命名和正文结构有效。

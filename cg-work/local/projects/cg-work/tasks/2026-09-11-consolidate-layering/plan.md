# 分层收敛计划

## 外部行为边界

- 保留 `framework:project-initialization` 和 `framework:framework-optimization` 的名称、调用时机与产物。
- 不变更项目上下文、需求箱、任务记录或镜像技能的格式。

## 步骤

1. 将项目初始化和框架维护的长期约束补全到 core 文档。
2. 将两个 workflow 收敛为路由、状态和加载说明，并引用对应 core 规则。
3. 将两个 skill 收敛为可执行步骤，不再复制 core 的规范正文。
4. 升级补丁版本，运行测试、全量校验、任务校验与差异审查。

## 审查后修正

5. 对齐 `local/tools/` 的 README 声明与 Git 忽略边界；同步 `AGENTS.md`、顶层 README 的需求箱和流程索引说明；将版本分级正文收敛到维护规则的单一段落。

6. 将已验证的通用优化前检查补充到 `framework-optimization` 技能：分层一致性、技能类型、声明与实现、以及目标性回归测试。

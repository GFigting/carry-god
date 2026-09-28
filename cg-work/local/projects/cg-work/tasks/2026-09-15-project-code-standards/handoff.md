# 交接

- 通用项目代码规范的唯一来源：`core/project-code-standards.md`。
- 项目上下文可选使用 `coding_standards.files` 登记规范来源，并由 `scripts/check-project.mjs` 校验已登记路径。
- 已验证：项目上下文校验、框架全量校验、`check-project` 回归测试和空白检查。
- 集成方式：按用户指示，将框架根目录改动和 `local/projects/cg-work/` 元数据提交并推送；不纳入其他项目的 `local/projects/` 内容。

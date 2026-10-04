---
required_skills:
  - framework:verification-before-completion
optional_skills:
  - framework:domain-modeling
  - framework:using-git-worktrees
  - framework:finishing-a-development-branch
conditional_skills:
  - framework:codebase-design
  - framework:writing-plans
  - framework:test-driven-development
  - framework:code-review
  - framework:project-initialization
  - framework:improve-codebase-architecture
  - framework:grilling
  - framework:grill-with-docs
---

# 重构

重构是 [功能开发](feature-development.md) 的一种变更性质：外部行为必须保持不变。步骤、技能加载、证据门禁、文档同步和统一收尾一律按 feature-development 与 [命名与提交](../core/naming-and-submission.md#原项目提交口径) 执行，本文件只补充三条重构特有要求：

1. 显式写出行为不变边界：哪些外部行为必须不变，用什么证据证明没有改变。
2. 跨模块、接口、依赖方向、数据兼容或架构调整前，先加载 `improve-codebase-architecture` 生成重构候选报告，确认候选项后再计划和实施。
3. 局部机械性改名、格式化或已被测试覆盖的单文件提取不要求重构报告。

存在重大取舍时使用 `grilling`；需要同时沉淀架构决策和词汇时使用 `grill-with-docs`。

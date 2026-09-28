---
required_skills:
  - framework:codebase-design
  - framework:writing-plans
  - framework:test-driven-development
  - framework:code-review
  - framework:verification-before-completion
optional_skills:
  - framework:domain-modeling
  - framework:using-git-worktrees
  - framework:finishing-a-development-branch
conditional_skills:
  - framework:project-initialization
  - framework:improve-codebase-architecture
  - framework:grilling
  - framework:grill-with-docs
---

# 重构

重构必须保持明确的外部行为边界。创建 `pending` 任务记录后，先评估业务、接口和架构文档影响；跨模块、接口、依赖方向、数据兼容或架构调整前，再加载 `improve-codebase-architecture` 生成重构候选报告；确认候选项后再计划和实施。完成后必须同步受影响文档或记录无需更新的理由，再经过新鲜验证、审查和统一收尾流程。存在重大取舍时使用 `grilling`，需要同时沉淀架构决策和词汇时使用 `grill-with-docs`。

局部机械性改名、格式化或已被测试覆盖的单文件提取不要求重构报告。

---
required_skills:
  - framework:project-discovery
optional_skills: []
conditional_skills:
  - framework:project-initialization
---

# 项目识别

这是所有新开发会话的前置路由流程。先按 `framework:project-discovery` 完成项目归属判断和用户确认，再按分类进入上下文加载：既有项目读取并校验上下文；新项目进入 `framework:project-initialization`；信息不足继续澄清。

该流程不创建业务任务，不替代需求澄清，也不在确认前修改项目代码、依赖、Git 配置或运行环境。若当前会话已绑定同一项目且上下文仍有效，可记录跳过理由并直接进入对应开发工作流。

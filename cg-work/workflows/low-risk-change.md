---
required_skills:
  - framework:verification-before-completion
optional_skills:
  - framework:research
conditional_skills:
  - framework:project-initialization
---

# 低风险变更

此路径仅适用于 [工作模型](../core/operating-model.md#低风险变更) 定义的纯文案、样式、静态布局或不改变行为的可访问性标记调整。

不创建需求箱、`task.yaml`、计划、审查、学习或交接记录，也不强制新增自动化测试。实施前说明本次修改没有改变行为；完成后运行与改动匹配的最小验证：前端页面执行受影响文件 lint 和页面验收，纯文档执行链接或格式检查。任一验证显示行为变化，或发现涉及业务规则、交互、路由、接口、数据、权限、配置语义、依赖或外部副作用时，停止该路径并切换到对应标准工作流。

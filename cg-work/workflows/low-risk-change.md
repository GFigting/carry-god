---
required_skills:
  - framework:verification-before-completion
optional_skills:
  - framework:research
conditional_skills:
  - framework:project-initialization
---

# 低风险变更

适用条件与判定边界以 [工作模型的低风险变更](../core/operating-model.md#低风险变更) 为唯一来源，本文件不重复；本文件只定义该路径的产物与验证下限。

本路径不创建需求箱、任务记录或任何产物文件，也不强制自动化测试（正文见 [低风险变更](../core/operating-model.md#低风险变更)）。本文件补充一条执行要求：实施前明确说明本次修改没有改变行为；验证一旦暴露行为变化，立即按 [交付路径升级](../core/operating-model.md#交付路径升级) 新建 `pending` 任务记录并切换到对应标准工作流。

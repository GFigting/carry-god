---
type: capability
id: CGHN-CAP-011
stage: diagnosis,design
---

# 架构机会 Markdown 报告

用于重构、架构优化和复杂缺陷分析。先扫描现有结构，识别浅模块、重复逻辑、耦合传播、缺少测试的接口和跨前后端断点，再使用 `templates/bugfix-refactor-report.md` 生成可在 Git 中审阅和持续更新的报告。

报告至少包含：问题位置、影响链路、领域术语、当前证据、候选方案、选择理由、风险、实施切片和验证计划。报告中的建议必须限定范围，不能借机提出与当前目标无关的全面重写。

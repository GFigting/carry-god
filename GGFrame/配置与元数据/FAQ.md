---
type: config
id: CFG-FAQ-001
title: FAQ
aliases: [常见问题, FAQ]
domain: meta

tags:
  - type/config
  - domain/meta
created: 2026-05-24
updated: 2026-05-24
---

# FAQ

## 框架相关

### Q: 这个框架和 Jira/Linear/Notion 的关系是什么？

本框架不是项目管理工具的替代品，而是**设计阶段思考 + 知识沉淀 + 流程规范**的载体。实际任务执行仍可使用 Jira 等工具，通过双向链接关联即可。框架解决的是"怎么做"、"谁来做"、"为什么这么做"的问题，项目管理工具解决的是"做到哪了"的问题。

### Q: 角色太多，团队小怎么办？

角色体系提供的是"最大集合"作为参考。小团队可以合并角色（如 TechLead 兼 Architect、Developer 兼 Reviewer），关键是**角色的职责边界定义**，而不是人头数。

### Q: 文档会不会太多、维护成本太高？

这也是渐进式落地的原因——用到了才创建。模板降低创建成本，Dataview 自动聚合降低查找成本。目录结构设计为"先建骨架"，实际内容按需填充。

### Q: 任务状态机中的 REVISION 和 BLOCKED 的区别？

- **REVISION**：质量不达标需要修改，是正常的审核流程回路
- **BLOCKED**：遇到外部依赖无法继续，如"等待 API 提供方开放接口"、"等待运维开通权限"

---

## Obsidian 相关

### Q: 为什么选 Obsidian 而不是其他工具？

1. **文件即文档**：Markdown 通用格式，不锁定在任何特定工具中
2. **双向链接**：天然适合知识网络和 MOC 导航模式
3. **本地优先**：数据在本地，可 Git 版本控制，隐私安全
4. **插件生态**：Dataview、Kanban 等插件提供了结构化查询和可视化能力

### Q: 模板创建后怎么用？

在 Obsidian 中使用 `Ctrl/Cmd + P` → "插入模板" 选择对应模板。或使用 Templater 插件设置自动触发规则（如创建新文件时自动应用模板）。

### Q: Dataview 查询不生效？

确保：
1. Dataview 插件已安装并启用
2. 文档的 frontmatter 字段正确（注意大小写和缩进）
3. 查询代码块标记为 `dataview` 而非其他语言

---

## 协作相关

### Q: 多人如何协作使用这个 vault？

1. **Git 方式**：使用 Obsidian Git 插件自动 push/pull，团队成员 clone 同一个仓库
2. **Obsidian Sync**：官方付费同步服务
3. **网盘同步**：将 vault 放在 iCloud/OneDrive/Dropbox 中（注意并发编辑冲突）

### Q: 如何确保文档不会混乱？

1. 严格遵守命名规范和 frontmatter 规范
2. 使用 `📌_任务控制台` 和各类 MOC 作为入口，不要直接在文件列表中浏览
3. 标签体系提供多维度的分类，补充目录结构的不足

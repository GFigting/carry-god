# 模板

框架现行模板的唯一存放处；格式正文以各模板文件自身为唯一来源，规则文件只引用路径不复制正文。

- `project-context.template.yaml`：项目上下文模板，由 `framework:project-initialization` 生成 `local/projects/<project-id>/project-context.yaml`。
- `parent-plan.template.md`：大任务主任务计划的需求拆分章节格式，由 `framework:parent-child-decomposition` 使用。
- `product-roadmap.template.md`：项目路线图格式，由 `framework:product-management` 使用，存放在原项目仓库内。
- `plan.template.md`：任务计划结构；原型章节骨架见 `../operating-model.md` 的"原型与任务记录"。

废弃模板不在此保留；新增或删除模板时同步更新 `core/README.md` 索引与全部引用。

# cg-work 校验加固实施计划

> **执行提示：** 按任务逐项执行本计划；每项完成后运行对应验证。

**目标：** 加固 cg-work 的项目和任务校验，确保工作流引用、YAML 结构、路径和完成门禁都得到强制检查。

**方案：** 使用 `js-yaml` 严格解析 YAML；项目上下文和任务记录分别由独立脚本校验；`check-all.mjs` 自动发现全部工作流文件，不再维护固定文件清单。

**技术栈：** Node.js 23、ES modules、`node:test`、`js-yaml`。

---

### 任务一：补充初始化工作流和依赖配置

**文件：**
- 新增：`cg-work/workflows/project-initialization.md`
- 新增：`cg-work/package.json`

### 任务二：替换项目上下文正则校验

**文件：**
- 修改：`cg-work/scripts/check-project.mjs`
- 修改：`cg-work/core/project-context.template.yaml`
- 测试：`cg-work/test/check-project.test.mjs`

### 任务三：增加任务校验和状态门禁

**文件：**
- 新增：`cg-work/scripts/check-task.mjs`
- 测试：`cg-work/test/check-task.test.mjs`

### 任务四：让框架检查自动发现工作流

**文件：**
- 修改：`cg-work/scripts/check-all.mjs`
- 修改：`cg-work/scripts/README.md`

### 任务五：更新初始化产物并完成验证

**文件：**
- 修改：`cg-work/local/projects/workdaddy/tasks/2026-09-10-project-initialization/task.yaml`

**验证命令：**

```text
npm install
node --test test/*.test.mjs
node scripts/check-all.mjs
node scripts/check-project.mjs <项目上下文路径>
node scripts/check-task.mjs <任务记录路径>
node scripts/check-skills.mjs
```

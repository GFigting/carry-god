---
type: knowledge
category: "技术文档"
project: "fms-ui"
topics: ["架构", "代码约定", "路由设计", "组件组织"]
created: "2026-05-25"
updated: "2026-05-26"
tags:
  - type/knowledge
  - project/fms-ui
  - topic/architecture
---

# fms-ui 架构速查

> 编码约定 + 关键依赖速查。实时目录结构、文件位置交给 CodeGraph MCP 即时查询，本文档只记录"应该怎么做"和"用了什么"。

## 一、技术栈

Vue 3.4 / Vite 5.1 / TypeScript 5.3 / Element-Plus 2.7 / Pinia 2.1 / vue-router 4.3 / vxe-table 4.7 / ECharts 5 / UnoCSS 0.58 / Axios / pnpm >= 8.6

## 二、关键依赖

| 类别 | 库 | 用途 |
|------|-----|------|
| 状态管理 | pinia + pinia-plugin-persistedstate | 全局状态 + 持久化 |
| 国际化 | vue-i18n 9.10 | 多语言 |
| 表格 | vxe-table 4.7 + vxe-pc-ui | 高级表格 |
| 图表 | ECharts 5.5 | 数据可视化 |
| 工作流 | bpmn-js 17.9 | 流程图展示 |
| 表单构建 | @form-create/element-ui 3.1 | 动态表单 |
| 工具 | lodash-es, dayjs, crypto-js, xlsx | 通用工具 |

## 三、核心约定

### 目录镜像
`src/api/` 与 `src/views/` 目录结构完全镜像，每个 API 文件对应一个业务实体。

### 页面组织
```
src/views/fms/{module}/{entity}/
├── index.vue                    # 列表页 (主入口，始终存在)
├── {Entity}Form.vue             # 新增/编辑表单
├── {Entity}Detail.vue           # 详情页
└── component/                   # 子组件/弹窗 (可选)
```

### Axios
实例在 `config/axios/service.ts` 统一封装，路径别名 `@/` → `src/`。

> 实时目录结构、具体文件位置用 `codegraph_files` 查询。

## 四、路由设计

- **模式**: `createWebHistory()` — HTML5 History，无 `#`
- **静态路由**: `src/router/modules/remaining.ts` — 单文件集中定义
- **动态路由**: 后端菜单权限接口下发 `addRoute`
- **路由守卫**: `src/permission.ts`

### 路由 meta 字段

| 字段 | 类型 | 说明 |
|------|------|------|
| hidden | boolean | 不在侧边栏显示 |
| alwaysShow | boolean | 不折叠单子路由 |
| title | string | 侧边栏/面包屑标题 |
| icon | string | 图标 (ep:xxx / svg-name) |
| noCache | boolean | 不被 keep-alive 缓存 |
| breadcrumb | boolean | 显示在面包屑 |
| affix | boolean | 固定在标签页 |
| activeMenu | string | 高亮指定菜单 |
| canTo | boolean | hidden=true时仍可跳转 |

## 五、Store 模块

| 模块 | 用途 |
|------|------|
| app | 应用配置 (侧边栏/设备/布局) |
| user | 用户信息/角色/权限 |
| permission | 路由权限 |
| tagsView | 标签页管理 |
| dict | 字典缓存 |
| locale | 语言切换 |

> 最新 Store 文件列表用 `codegraph_files` 查询 `src/store/modules/`。

## 六、对账模块待建设页面

以下为对账结算中心规划页面（代码中尚不存在）：

| 路径 | 功能 |
|------|------|
| `src/views/fms/reconciliation/reconciliation/` | 对账单管理 |
| `src/views/fms/reconciliation/invoicePlan/` | 开票计划 |
| `src/views/fms/reconciliation/invoiceRecord/` | 到票记录 |
| `src/views/fms/reconciliation/settlementPlan/` | 结算计划 |
| `src/views/fms/reconciliation/billList/` | 账单列表/进度 |

---

## Agent 进入项目时的加载顺序

1. 读本文档 → 了解编码约定和技术栈
2. 用 `codegraph_files` 获取 `src/views/fms/reconciliation/` 实时结构 → 了解现有代码
3. 读 `src/router/modules/remaining.ts` → 了解路由和模块划分
4. 用 `codegraph_files` 参考 `src/views/fms/supplyChain/` 任一模块 → 遵循页面组织模式

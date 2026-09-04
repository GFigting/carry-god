---
type: knowledge
category: "技术文档"
project: "fms-rear"
topics: ["架构", "代码约定", "模块结构", "分层设计"]
created: "2026-05-25"
updated: "2026-05-26"
tags:
  - type/knowledge
  - project/fms-rear
  - topic/architecture
---

# fms-rear 架构速查

> 编码约定 + 架构决策速查。结构探索（目录树、业务包列表、类继承关系）交给 CodeGraph MCP 即时查询，本文档只记录 CodeGraph 无法提供的"应该怎么做"和"为什么这样做"。

## 一、模块职责速查

| 模块 | 职责 |
|------|------|
| fms-dependencies | BOM 统一依赖版本管理 |
| fms-framework | 框架核心 (fms-common + 14个Spring Boot Starter) |
| fms-module-server | 主业务承载 — biz(Controller+启动) + service(核心逻辑) + job(XXL-Job定时任务) |
| fms-module-system | 系统管理 (用户/角色/权限/字典/通知) |
| fms-module-infra | 基础设施 (文件/配置/日志/代码生成) |
| fms-module-bpm | 工作流 (Flowable 6.8) |
| fms-sql | SQL 初始化脚本 |

> 实时目录结构用 `codegraph_files` 查询。

## 二、分层约定

三层架构（贫血模型），base_package: `cn.codemonkey.fms.server`

| 层 | 模块位置 | 约定 |
|----|---------|------|
| Controller | fms-module-biz | `controller/admin/{entity}/{Entity}Controller.java` |
| VO | fms-module-service | ★ VO 定义在 service 模块，不在 biz 模块。模式: `{Entity}CreateReqVO / UpdateReqVO / PageReqVO(extends PageQuery) / RespVO / ExcelVO / ExportReqVO` |
| Service | fms-module-service | `service/{entity}/{Entity}Service.java` 接口 + `{Entity}ServiceImpl.java` 实现（`@Service + @Validated`） |
| DAL | fms-module-service | `dal/dataobject/{entity}/{Entity}DO.java (extends BaseDO)` + `dal/mysql/{entity}/{Entity}Mapper.java (extends BaseMapperX<T>)` |
| Convert | fms-module-service | `convert/{entity}/{Entity}Convert.java` — MapStruct `INSTANCE` 单例 |
| Enum | fms-module-service | `enums/{category}/` |

## 三、关键基类

| 基类 | 来源 | 作用 |
|------|------|------|
| `BaseDO` | fms-framework | DO 基类 (id, createTime, updateTime, creator, updater, deleted) |
| `BaseMapperX<T>` | fms-framework | 增强 MyBatis-Plus Mapper (selectPage, LambdaQueryWrapperX) |
| `BaseVO` | fms-module-service | VO 基类 (createTime, updateTime, creator, updater) |
| `PageQuery` | fms-common | 分页请求基类 |
| `PageResult<T>` | fms-common | 统一分页结果 |
| `R<T>` | fms-common | 统一响应体 `R.success(data)` |

## 四、命名规范

| 层 | 模式 | 说明 |
|----|------|------|
| Controller | `{Entity}Controller` | |
| Service接口 | `{Entity}Service` | |
| Service实现 | `{Entity}ServiceImpl` | |
| DO | `{Entity}DO extends BaseDO` | 表映射实体 |
| Mapper | `{Entity}Mapper extends BaseMapperX<DO>` | |
| Convert | `{Entity}Convert.INSTANCE` | MapStruct 单例 |
| 请求VO | `{Entity}CreateReqVO / UpdateReqVO / PageReqVO` | |
| 响应VO | `{Entity}RespVO` | |
| ExcelVO | `{Entity}ExcelVO` | 导出专用 |
| Mapper XML | `src/main/resources/mapper/{entity}/` | |

## 五、表前缀规范

| 前缀 | 用途 | 示例 |
|------|------|------|
| `fc_` | 现有 FMS 业务表 | fc_inventory_bill, fc_material |
| `cs_` | ★ 新增 对账结算中心 | cs_bill, cs_reconciliation |
| `system_` | 系统管理 | system_user, system_role |
| `infra_` | 基础设施 | infra_file, infra_config |
| `bpm_` | 工作流 | bpm_process_definition |

## 六、技术栈版本

Java 1.8 / Spring Boot 2.7.18 / MyBatis-Plus 3.5.5 / Flowable 6.8 / Redisson 3.18 / MapStruct 1.5.5 / Hutool 5.8.25 / EasyExcel 3.3.2 / Knife4j 4.3 / Spotless (Google AOSP)

## 七、DDD 引入注意事项

- 当前是贫血模型三层架构，无 domain/repository 包
- 引入 DDD 需要在现有分层中插入 domain 层
- 建议保持现有 Controller(路由+VO) → Application Service(编排) → Domain(聚合根+领域服务) → Infrastructure(Mapper+DO)
- 表前缀 `cs_` 用于对账中心，与现有 `fc_` 前缀隔离
- BPM 审批流可复用 fms-module-bpm，审批回调通过防腐层转换

---

## Agent 进入项目时的加载顺序

1. 读本文档 → 了解编码约定和架构决策
2. 用 `codegraph_files` → 获取实时目录结构和业务包列表（替代原手动维护的第五节）
3. 读 `docs/a-rear.md` → 获取领域约束
4. 读 `docs/a-basic.md` → 获取跨项目通用约定
5. 用 `codegraph_context` 按需探索目标模块

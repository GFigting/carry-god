# 需求包：原型机制并入任务记录（第 2 项）

- 日期：2026-10-02
- 来源：用户对"工作流与产物判定"的确认，执行其中的第 2 项（原型契约并入 plan.md 固定章节）
- 状态：原始需求，未拆分

## 原始诉求

原型机制与使用量严重不匹配：126 条记录中 `prototype_reference` 仅 1 条，`prototype_contract_reference` 与 `prototype_disposition_reference` 均为 0 条，却养着两个模板文件和一组独立引用字段。要求把契约与采纳结论并入任务已有的计划与评审记录，砍掉独立文件与两个引用字段，同时不放宽门禁。

## 实测依据

- 字段使用率：`prototype_reference` 1/126、`prototype_contract_reference` 0/126、`prototype_disposition_reference` 0/126。
- 唯一引用原型的任务（lasen `2026-09-11-overseas-tax-foundation-exchange-rate-permissions`）正因缺契约而校验失败——门禁存在，但流程从未跑通。
- 两个模板仅被 5 处框架文档与 3 条历史任务记录引用。

## 约束

- 不得降低门禁强度：章节完整性（六节 / 四节）与状态时机（in_progress 起、review/done 起）必须保留。
- 不得删除历史任务仍引用的模板文件；按框架维护规则保留替代说明。
- 不代填唯一那条原型任务的契约内容（属该任务自己的真实工作）。
- compact 任务不得被迫新增文件：章节写入其主产物。

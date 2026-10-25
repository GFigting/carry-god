<script setup lang="ts">
import { computed } from 'vue'
import type { TaskRecord } from '../types'

const props = defineProps<{ tasks: TaskRecord[] }>()

const wfCount = computed(() => {
  const m: Record<string, number> = {}
  for (const t of props.tasks) m[t.workflow] = (m[t.workflow] || 0) + 1
  return m
})

const dpCount = computed(() => {
  const m: Record<string, number> = {}
  for (const t of props.tasks) m[t.delivery_path] = (m[t.delivery_path] || 0) + 1
  return m
})

const workflows = [
  ['project-discovery', '上下文加载前判断既有项目 / 新项目 / 信息不足', '唯一匹配自动路由，其余确认后路由'],
  ['feature-development', '新功能和行为变更', '小功能可走轻量执行；新业务规则/接口须独立验收'],
  ['low-risk-change', '纯文案、样式、静态布局、可访问性标记', '免记录路径；任一低风险条件不满足即升级'],
  ['bugfix', '缺陷、回归和性能问题', '根因已确认且仅恢复既有行为'],
  ['refactor', '保持外部行为的结构调整', '行为不变，验证绑定交付点'],
  ['review', '代码、变更和交付前审查', '统一收尾六步：验证→测试→冗余→文档→清单→集成'],
  ['framework-optimization', '框架规则、流程、模板、校验器与自有技能演进', '框架自身维护约束优先'],
  ['parent-child-decomposition', '跨模块 / 跨会话 / 未决关键决策的大需求', '主任务 role: parent，子任务 parent_reference 挂靠'],
] as const

const dpDefs = [
  ['lightweight', '轻量执行', '证据合并进 task.yaml 的 lightweight_evidence，不建独立产物文件。仅 bugfix / feature-development 可声明。', 'lw'],
  ['standard', '标准执行（默认）', '按阶段生成 plan / review / verification / learning / handoff / closure 全套产物，artifacts 分组引用。', 'st'],
  ['compact', '紧凑执行', 'task.yaml + 一个主产物（product/plan/research.md）；验证、学习与交接回写主产物或 task.yaml。', 'cp'],
] as const

function dpLabel(key: string): string {
  return (dpCount.value[key] != null ? dpCount.value[key] : (dpCount.value['(默认standard)'] || 0)) + ' 个任务'
}
</script>

<template>
  <section id="workflows">
    <div class="sec-head"><span class="sec-no">04</span><h2>工作流与交付路径</h2></div>
    <p class="sec-desc">工作流按开发意图选择；交付路径按影响面与风险选择，不按任务名选择。次数列为任务记录中的实际引用统计。</p>
    <div class="card" style="overflow-x:auto">
      <table id="wf-table">
        <thead><tr><th>工作流</th><th>使用场景</th><th>关键门禁</th><th class="num">引用次数</th></tr></thead>
        <tbody>
          <tr v-for="[key, scene, gate] in workflows" :key="key">
            <td class="mono">{{ key }}</td>
            <td>{{ scene }}</td>
            <td>{{ gate }}</td>
            <td class="num" :style="(wfCount[key] || 0) === 0 ? 'color: var(--faint)' : undefined">{{ wfCount[key] || 0 }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="grid g3" style="margin-top:16px" id="dp-cards">
      <div v-for="[key, name, desc, cls] in dpDefs" :key="key" class="dp" :class="cls">
        <h3><span>{{ name }}</span><span class="cnt">{{ dpLabel(key) }}</span></h3>
        <span class="tag">delivery_path: {{ key }}</span>
        <p>{{ desc }}</p>
      </div>
    </div>
    <div class="upgrade" id="dp-upgrade"><b>升级规则（只升不降）：</b>免记录 → 标准：低风险变更中冒出行为变化即停，新建 pending 任务收纳已完成改动；轻量 → 标准：决策清单任一项转为「是」时在原 task.yaml 内升级（保留 status_history 与已写证据，追加带原因的升级记录，补建 plan/review/verification）；产生可复用经验即升级为标准执行。</div>
    <div class="card" style="margin-top:16px">
      <h3>轻量执行决策清单（任一项为「是」即进入标准执行）</h3>
      <ul class="checklist">
        <li>是否跨模块（改动或验证超出单一模块/业务边界）？</li>
        <li>是否改变业务规则、接口、数据或权限？</li>
        <li>是否存在迁移、删除或其他不可逆写入？</li>
        <li>是否有未决业务决策？</li>
        <li>是否产生外部副作用？</li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { TaskRecord } from '../types'

const props = defineProps<{ tasks: TaskRecord[] }>()

const GATES: Record<string, string> = {
  pending: '目标、范围和验收标准已记录，尚未开始实施。',
  in_progress: '已满足执行前置条件，正在设计、编码或测试。',
  review: '实现已完成：必须有审查记录和新鲜验证证据；声明原型的任务还必须有原型采纳记录。',
  done: '验证通过、审查结论已处理，并确定保留/合并/推送/暂缓集成方式；标准任务还须用户验收。',
  blocked: '缺少信息、权限、环境或外部依赖；须记录阻塞原因和解除条件。',
  cancelled: '用户明确取消；须记录取消原因和已有产物位置。',
}

const EDGES: Array<[string, string]> = [
  ['pending', 'in_progress'],
  ['in_progress', 'review'],
  ['review', 'done'],
  ['review', 'in_progress'],
  ['pending', 'blocked'],
  ['in_progress', 'blocked'],
  ['review', 'blocked'],
  ['blocked', 'pending'],
  ['blocked', 'in_progress'],
  ['pending', 'cancelled'],
  ['in_progress', 'cancelled'],
  ['review', 'cancelled'],
]

const activeTasks = computed(() => props.tasks.filter((t) => !t.archived))
const archivedTasks = computed(() => props.tasks.filter((t) => t.archived))

function countByStatus(arr: TaskRecord[]): Record<string, number> {
  const m: Record<string, number> = {}
  for (const t of arr) m[t.status] = (m[t.status] || 0) + 1
  return m
}

const activeByStatus = computed(() => countByStatus(activeTasks.value))
const archivedByStatus = computed(() => countByStatus(archivedTasks.value))

const selState = ref<string | null>(null)

function selectState(state: string) {
  selState.value = selState.value === state ? null : state
}

function edgeClass(from: string, to: string) {
  const related = !!selState.value && (from === selState.value || to === selState.value)
  return { lit: related, dim: !!selState.value && !related }
}

const detail = computed(() => {
  const state = selState.value
  if (!state) return null
  const ins = EDGES.filter(([, to]) => to === state).map(([from]) => from)
  const outs = EDGES.filter(([from]) => from === state).map(([, to]) => to)
  return {
    state,
    count: '活跃 ' + (activeByStatus.value[state] || 0) + ' · 归档 ' + (archivedByStatus.value[state] || 0),
    gate: GATES[state] || '',
    ins,
    outs,
  }
})

onMounted(() => {
  const sel = new URLSearchParams(location.search).get('sel')
  if (sel) selectState(sel)
})
</script>

<template>
  <section id="state">
    <div class="sec-head"><span class="sec-no">02</span><h2>任务状态机</h2></div>
    <p class="sec-desc">来源 <code>core/operating-model.md</code>：主链路 pending → in_progress → review → done；blocked / cancelled 为异常状态，done 与 cancelled 为终态。</p>
    <div class="grid g-sm">
      <div class="card">
        <svg class="sm-svg" viewBox="0 0 840 320" role="img" aria-label="cg-work 任务状态机">
          <defs>
            <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill="#6b655c"></path>
            </marker>
            <marker id="arrd" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill="#b9b2a6"></path>
            </marker>
          </defs>

          <path class="sm-edge" :class="edgeClass('pending', 'in_progress')" data-from="pending" data-to="in_progress" d="M156,59 H244" stroke="#6b655c" stroke-width="1.8" marker-end="url(#arr)" fill="none"></path>
          <path class="sm-edge" :class="edgeClass('in_progress', 'review')" data-from="in_progress" data-to="review" d="M376,59 H464" stroke="#6b655c" stroke-width="1.8" marker-end="url(#arr)" fill="none"></path>
          <path class="sm-edge" :class="edgeClass('review', 'done')" data-from="review" data-to="done" d="M596,59 H684" stroke="#6b655c" stroke-width="1.8" marker-end="url(#arr)" fill="none"></path>
          <path class="sm-edge" :class="edgeClass('review', 'in_progress')" data-from="review" data-to="in_progress" d="M532,84 C532,120 312,120 312,90" stroke="#6b655c" stroke-width="1.8" marker-end="url(#arr)" fill="none"></path>
          <path class="sm-edge" :class="edgeClass('pending', 'blocked')" data-from="pending" data-to="blocked" d="M92,84 C92,112 240,114 256,146" stroke="#b9b2a6" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#arrd)" fill="none"></path>
          <path class="sm-edge" :class="edgeClass('in_progress', 'blocked')" data-from="in_progress" data-to="blocked" d="M312,84 V142" stroke="#b9b2a6" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#arrd)" fill="none"></path>
          <path class="sm-edge" :class="edgeClass('review', 'blocked')" data-from="review" data-to="blocked" d="M532,84 C532,112 384,114 368,146" stroke="#b9b2a6" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#arrd)" fill="none"></path>
          <path class="sm-edge" :class="edgeClass('blocked', 'pending')" data-from="blocked" data-to="pending" d="M258,158 C196,206 118,196 98,90" stroke="#b9b2a6" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#arrd)" fill="none"></path>
          <path class="sm-edge" :class="edgeClass('blocked', 'in_progress')" data-from="blocked" data-to="in_progress" d="M324,142 V90" stroke="#b9b2a6" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#arrd)" fill="none"></path>
          <path class="sm-edge" :class="edgeClass('pending', 'cancelled')" data-from="pending" data-to="cancelled" d="M92,84 C190,252 500,288 682,172" stroke="#c9c2b6" stroke-width="1.3" stroke-dasharray="4 5" marker-end="url(#arrd)" fill="none"></path>
          <path class="sm-edge" :class="edgeClass('in_progress', 'cancelled')" data-from="in_progress" data-to="cancelled" d="M312,84 C420,232 580,244 684,168" stroke="#c9c2b6" stroke-width="1.3" stroke-dasharray="4 5" marker-end="url(#arrd)" fill="none"></path>
          <path class="sm-edge" :class="edgeClass('review', 'cancelled')" data-from="review" data-to="cancelled" d="M532,84 C620,132 648,152 684,162" stroke="#c9c2b6" stroke-width="1.3" stroke-dasharray="4 5" marker-end="url(#arrd)" fill="none"></path>

          <text x="200" y="50" text-anchor="middle" font-size="10.5" fill="#857f74">验收标准已记录</text>
          <text x="420" y="50" text-anchor="middle" font-size="10.5" fill="#857f74">实现完成</text>
          <text x="640" y="50" text-anchor="middle" font-size="10.5" fill="#857f74">验证·审查·验收</text>
          <text x="422" y="133" text-anchor="middle" font-size="10.5" fill="#857f74">验证失败或审查有问题</text>
          <text x="322" y="110" font-size="10" fill="#a89f93">缺信息/权限/环境</text>

          <g class="sm-node" :class="{ sel: selState === 'pending' }" data-state="pending" @click="selectState('pending')">
            <rect class="sm-box" x="30" y="36" width="124" height="46" rx="10" fill="#f1efeb" stroke="#7d7669" stroke-width="1.6"></rect>
            <text x="92" y="63" text-anchor="middle" font-size="13" font-weight="600" fill="#2c2a26">pending</text>
          </g>
          <g class="sm-node" :class="{ sel: selState === 'in_progress' }" data-state="in_progress" @click="selectState('in_progress')">
            <rect class="sm-box" x="250" y="36" width="124" height="46" rx="10" fill="#edf2f8" stroke="#2f5d8a" stroke-width="1.6"></rect>
            <text x="312" y="63" text-anchor="middle" font-size="13" font-weight="600" fill="#2c2a26">in_progress</text>
          </g>
          <g class="sm-node" :class="{ sel: selState === 'review' }" data-state="review" @click="selectState('review')">
            <rect class="sm-box" x="470" y="36" width="124" height="46" rx="10" fill="#faf3e3" stroke="#a97a1f" stroke-width="1.6"></rect>
            <text x="532" y="63" text-anchor="middle" font-size="13" font-weight="600" fill="#2c2a26">review</text>
          </g>
          <g class="sm-node" :class="{ sel: selState === 'done' }" data-state="done" @click="selectState('done')">
            <rect class="sm-box" x="690" y="36" width="124" height="46" rx="10" fill="#ecf4ef" stroke="#2e7d4f" stroke-width="1.6"></rect>
            <text x="752" y="63" text-anchor="middle" font-size="13" font-weight="600" fill="#2c2a26">done</text>
            <text x="752" y="102" text-anchor="middle" font-size="10" fill="#a89f93">终态</text>
          </g>
          <g class="sm-node" :class="{ sel: selState === 'blocked' }" data-state="blocked" @click="selectState('blocked')">
            <rect class="sm-box" x="250" y="150" width="124" height="46" rx="10" fill="#f9efed" stroke="#b03a2e" stroke-width="1.4" stroke-dasharray="5 4"></rect>
            <text x="312" y="177" text-anchor="middle" font-size="13" font-weight="600" fill="#2c2a26">blocked</text>
          </g>
          <g class="sm-node" :class="{ sel: selState === 'cancelled' }" data-state="cancelled" @click="selectState('cancelled')">
            <rect class="sm-box" x="690" y="150" width="124" height="46" rx="10" fill="#f9efed" stroke="#b03a2e" stroke-width="1.4" stroke-dasharray="5 4"></rect>
            <text x="752" y="177" text-anchor="middle" font-size="13" font-weight="600" fill="#2c2a26">cancelled</text>
            <text x="752" y="216" text-anchor="middle" font-size="10" fill="#a89f93">终态</text>
          </g>
        </svg>
        <div class="legend">
          <span class="item"><span class="sw"></span>主链路 / 回退</span>
          <span class="item"><span class="sw dash"></span>异常与取消</span>
          <span class="item"><span class="sw box"></span>异常状态（虚线框）</span>
          <span class="item" style="color:var(--faint)">点击节点查看门禁与出入边</span>
        </div>
        <div class="sm-detail" id="sm-detail" :class="{ show: !!detail }">
          <template v-if="detail">
            <div><b>{{ detail.state }}</b><span class="cnt">{{ detail.count }}</span></div>
            <div>{{ detail.gate }}</div>
            <div style="margin-top:6px;color:var(--muted)">入边：{{ detail.ins.length ? detail.ins.join(' / ') : '无' }}　出边：{{ detail.outs.length ? detail.outs.join(' / ') : '无（终态）' }}</div>
          </template>
        </div>
      </div>
      <div class="card">
        <h3>允许的状态转移</h3>
        <table>
          <thead><tr><th>当前状态</th><th>可转移到</th></tr></thead>
          <tbody>
            <tr><td class="mono">pending</td><td>in_progress · blocked · cancelled</td></tr>
            <tr><td class="mono">in_progress</td><td>review · blocked · cancelled</td></tr>
            <tr><td class="mono">review</td><td>in_progress · done · blocked · cancelled</td></tr>
            <tr><td class="mono">blocked</td><td>pending · in_progress · cancelled</td></tr>
            <tr><td class="mono">done</td><td>无（终态，后续变更建新任务）</td></tr>
            <tr><td class="mono">cancelled</td><td>无（终态，重启建新任务）</td></tr>
          </tbody>
        </table>
        <h3 style="margin-top:12px">门禁要点</h3>
        <ol class="steps" style="columns:1">
          <li>不得跳过 <b>review</b> 直接进入 done</li>
          <li>review 需<b>审查记录 + 新鲜验证证据</b>；声明原型的还需原型采纳记录</li>
          <li>done 需<b>用户验收</b>（轻量自动完成条件除外）</li>
          <li>验证失败/审查有问题回 <b>in_progress</b>，不设 revision 状态</li>
          <li>review/blocked/done 时必须维护 <b>next_action</b>（required/action/message）</li>
        </ol>
      </div>
    </div>
  </section>
</template>

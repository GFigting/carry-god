<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { ProjectMeta, TaskRecord } from '../types'

const props = defineProps<{ tasks: TaskRecord[]; projectMeta: Record<string, ProjectMeta> }>()

const STATUS_ORDER = ['pending', 'in_progress', 'review', 'blocked', 'done', 'cancelled']
const STATUS_SORT = ['review', 'blocked', 'pending', 'in_progress', 'done', 'cancelled']
const STATUS_CLASS: Record<string, string> = {
  pending: 'pend',
  in_progress: 'prog',
  review: 'rev',
  done: 'done',
  cancelled: 'warn',
  blocked: 'warn',
}
const SOURCE_LABEL: Record<string, string> = {
  status_history: '状态历史',
  git: '文件提交日',
  created_at: '创建日',
  unknown: '未知',
}

const activeTasks = computed(() => props.tasks.filter((t) => !t.archived))
const archivedTasks = computed(() => props.tasks.filter((t) => t.archived))

function countBy(arr: TaskRecord[], key: 'status' | 'project'): Record<string, number> {
  const m: Record<string, number> = {}
  for (const t of arr) m[t[key]] = (m[t[key]] || 0) + 1
  return m
}

const activeByStatus = computed(() => countBy(activeTasks.value, 'status'))

interface ChipDef {
  key: string | null
  scope: 'active' | 'archived'
  n: number
  label: string
  cls: string
}

const chipsDef = computed<ChipDef[]>(() => [
  { key: null, scope: 'active', n: activeTasks.value.length, label: '活跃任务', cls: 'c-all' },
  { key: 'review', scope: 'active', n: activeByStatus.value.review || 0, label: 'review', cls: 'c-rev' },
  { key: 'in_progress', scope: 'active', n: activeByStatus.value.in_progress || 0, label: 'in_progress', cls: 'c-prog' },
  { key: 'pending', scope: 'active', n: activeByStatus.value.pending || 0, label: 'pending', cls: 'c-pend' },
  { key: 'blocked', scope: 'active', n: activeByStatus.value.blocked || 0, label: 'blocked', cls: 'c-warn' },
  { key: 'done', scope: 'active', n: activeByStatus.value.done || 0, label: 'done', cls: 'c-done' },
  { key: 'cancelled', scope: 'active', n: activeByStatus.value.cancelled || 0, label: 'cancelled', cls: 'c-warn' },
  { key: null, scope: 'archived', n: archivedTasks.value.length, label: '已归档', cls: '' },
])

const selected = ref<{ proj: string; status: string | null; archived: boolean; sort: 'status' | 'dwell' | 'project' }>({
  proj: '全部',
  status: null,
  archived: false,
  sort: 'status',
})
const openTask = ref<TaskRecord | null>(null)
const copiedKey = ref<string | null>(null)
const keyword = ref('')

function rowKey(t: TaskRecord): string {
  return `${t.project}/${t.id}`
}

function statusColor(s: string): string {
  const cls = STATUS_CLASS[s]
  return cls === 'warn' ? 'var(--warn)' : cls === 'prog' ? 'var(--prog)' : cls === 'rev' ? 'var(--rev)' : 'var(--pend)'
}

// ---- 待验收队列：状态为 review，或显式要求用户操作 ----
interface QueueItem {
  key: string
  task: TaskRecord
  project: string
  id: string
  status: string
  waiting: boolean
  days: number | null
  source: string
  message: string
}

const queue = computed<QueueItem[]>(() => props.tasks
  // 与 scripts/acceptance-queue.mjs 同口径：review 或显式要求用户操作；done/cancelled 不误入队列
  .filter((t) => !t.archived && (t.status === 'review' || t.next_action?.required === true))
  .map((t) => {
    const waiting = t.next_action?.required === true || t.next_user_action?.required === true
    const message = (waiting ? t.next_user_action?.message : t.next_action?.message) || t.next_action?.message || t.next_user_action?.message || ''
    return {
      key: rowKey(t),
      task: t,
      project: t.project,
      id: t.id,
      status: t.status,
      waiting,
      days: t.days_in_status,
      source: t.dwell_source,
      message,
    }
  })
  .sort((a, b) => Number(b.waiting) - Number(a.waiting)
    || (b.days ?? -1) - (a.days ?? -1)
    || a.project.localeCompare(b.project)
    || a.id.localeCompare(b.id)))

const staleCount = computed(() => queue.value.filter((item) => (item.days ?? 0) >= 3).length)

// 队列分组：待审查可直接勾选验收；等待用户是阻塞项；其它留给维护者排查。
const queueGroups = computed(() => {
  const groups = [
    { key: 'review', label: '待审查', hint: '可勾选验收', items: [] as QueueItem[] },
    { key: 'user', label: '等待用户操作', hint: '需要你决定或补充信息', items: [] as QueueItem[] },
    { key: 'other', label: '其它待办', hint: '', items: [] as QueueItem[] },
  ]
  for (const item of queue.value) {
    if (item.status === 'review') groups[0].items.push(item)
    else if (item.waiting) groups[1].items.push(item)
    else groups[2].items.push(item)
  }
  return groups.filter((group) => group.items.length > 0)
})

// ---- 开发态批量验收：构建产物不含写控件，也不发写请求 ----
const isDev = import.meta.env.DEV
const selectedIds = ref<string[]>([])
const confirming = ref(false)
const note = ref('')
const submitting = ref(false)
const writeResult = ref<{ ok: boolean; text: string } | null>(null)
const acceptedNotice = ref<{ ids: string[] } | null>(null)
const noteInput = ref<HTMLInputElement | null>(null)

const reviewQueue = computed(() => queue.value.filter((item) => item.status === 'review'))
const allSelected = computed(() => reviewQueue.value.length > 0
  && reviewQueue.value.every((item) => selectedIds.value.includes(item.id)))
const someSelected = computed(() => selectedIds.value.length > 0 && !allSelected.value)

// 任务被验收或快照重建后，选择集只保留仍可验收的项。
watch(queue, () => {
  const acceptable = new Set(reviewQueue.value.map((item) => item.id))
  selectedIds.value = selectedIds.value.filter((id) => acceptable.has(id))
  if (confirming.value && selectedIds.value.length === 0) confirming.value = false
})

function toggleSelect(id: string) {
  const index = selectedIds.value.indexOf(id)
  if (index >= 0) selectedIds.value = selectedIds.value.filter((item) => item !== id)
  else selectedIds.value = [...selectedIds.value, id]
}

function toggleAll() {
  selectedIds.value = allSelected.value ? [] : reviewQueue.value.map((item) => item.id)
}

function startConfirm() {
  if (!selectedIds.value.length) return
  note.value = ''
  writeResult.value = null
  confirming.value = true
  nextTick(() => noteInput.value?.focus())
}

function cancelConfirm() {
  if (submitting.value) return
  confirming.value = false
}

async function submitAccept() {
  if (!selectedIds.value.length || submitting.value) return
  submitting.value = true
  writeResult.value = null
  try {
    const res = await fetch('/api/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CG-Write': '1' },
      body: JSON.stringify({ ids: selectedIds.value, note: note.value }),
    })
    const data = await res.json().catch(() => ({ ok: false, error: '响应不是 JSON' })) as { ok?: boolean; ids?: string[]; output?: string; error?: string }
    if (!res.ok || !data.ok) {
      writeResult.value = { ok: false, text: data.error || `验收失败（HTTP ${res.status}）` }
      return
    }
    writeResult.value = { ok: true, text: `已验收 ${data.ids?.length ?? selectedIds.value.length} 项；已写回 task.yaml，页面将自动刷新` }
    // 整页刷新会清空内存状态，用 sessionStorage 把结果带过刷新。
    try {
      sessionStorage.setItem('cg-accepted', JSON.stringify({ ids: data.ids ?? selectedIds.value }))
    } catch {
      // 隐私模式等场景写入失败时，至少保留当前页提示。
    }
    selectedIds.value = []
    confirming.value = false
  } catch (err) {
    writeResult.value = { ok: false, text: `请求失败：${(err as Error).message}` }
  } finally {
    submitting.value = false
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && confirming.value && !submitting.value) {
    event.preventDefault()
    confirming.value = false
  }
}

// ---- 矩阵 ----
const projects = computed(() => Object.keys(props.projectMeta)
  .filter((p) => props.projectMeta[p].tasks + props.projectMeta[p].archived > 0)
  .sort((a, b) => (props.projectMeta[b].tasks + props.projectMeta[b].archived) - (props.projectMeta[a].tasks + props.projectMeta[a].archived)))

const matrixRows = computed(() => projects.value.map((p) => {
  const rows = props.tasks.filter((t) => t.project === p)
  const by = countBy(rows, 'status')
  const cells = STATUS_ORDER.map((s) => {
    const n = by[s] || 0
    const pendingRows = activeTasks.value.filter((t) => t.status === s && t.project === p)
    const maxDays = pendingRows.reduce((max, t) => Math.max(max, t.days_in_status ?? -1), -1)
    const finite = maxDays >= 0
    return {
      status: s,
      n,
      clickable: pendingRows.length > 0,
      stale: finite && maxDays >= 3 && s !== 'done' && s !== 'cancelled',
      maxDays: finite ? maxDays : null,
      color: n > 0 && s !== 'done' ? statusColor(s) : undefined,
    }
  })
  return {
    project: p,
    cells,
    archived: props.projectMeta[p].archived,
    total: rows.length,
  }
}))

// ---- 明细 ----
const scopeTasks = computed(() => (selected.value.archived ? archivedTasks.value : activeTasks.value))
const projWithActive = computed(() => ['全部', ...new Set(scopeTasks.value.map((t) => t.project))])

const detailRows = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  const rows = scopeTasks.value.filter((t) => (selected.value.proj === '全部' || t.project === selected.value.proj)
    && (!selected.value.status || t.status === selected.value.status)
    && (!kw || (t.id + ' ' + t.goal).toLowerCase().includes(kw)))
  const byProject = (a: TaskRecord, b: TaskRecord) => a.project.localeCompare(b.project) || a.id.localeCompare(b.id)
  if (selected.value.sort === 'dwell') {
    return rows.sort((a, b) => (b.days_in_status ?? -1) - (a.days_in_status ?? -1) || byProject(a, b))
  }
  if (selected.value.sort === 'status') {
    const rank = (s: string) => { const i = STATUS_SORT.indexOf(s); return i === -1 ? STATUS_SORT.length : i }
    return rows.sort((a, b) => rank(a.status) - rank(b.status) || (b.days_in_status ?? -1) - (a.days_in_status ?? -1) || byProject(a, b))
  }
  return rows.sort(byProject)
})

const filterLabel = computed(() => {
  const parts: string[] = []
  if (selected.value.archived) parts.push('已归档')
  if (selected.value.status) parts.push(selected.value.status)
  if (selected.value.proj !== '全部') parts.push(selected.value.proj)
  if (keyword.value.trim()) parts.push('搜索「' + keyword.value.trim() + '」')
  return parts.length ? ' — 筛选：' + parts.join(' / ') : ''
})

const showClear = computed(() => selected.value.status !== null || selected.value.proj !== '全部' || keyword.value.trim() !== '')

function clearAll() {
  keyword.value = ''
  setFilter('全部', null)
}

function setFilter(proj: string, status: string | null) {
  selected.value = { ...selected.value, proj, status, archived: false }
}

function setChip(chip: ChipDef) {
  selected.value = { ...selected.value, proj: '全部', status: chip.key, archived: chip.scope === 'archived' }
}

function isChipOn(chip: ChipDef): boolean {
  return selected.value.archived === (chip.scope === 'archived') && selected.value.status === chip.key
}

function setSort(sort: 'status' | 'dwell' | 'project') {
  selected.value = { ...selected.value, sort }
}

function deliveryLabel(t: TaskRecord): string {
  return t.delivery_path === '(默认standard)' ? 'standard (默认)' : t.delivery_path
}

function dwellClass(days: number | null): string {
  if (days === null) return ''
  if (days >= 7) return 'dwell stale'
  if (days >= 3) return 'dwell watch'
  return 'dwell'
}

function dwellLabel(days: number | null): string {
  return days === null ? '—' : `${days} 天`
}

function shortTime(value: string | null): string {
  return value ? value.slice(0, 16).replace('T', ' ') : ''
}

function sourceLabel(t: TaskRecord): string {
  return SOURCE_LABEL[t.dwell_source] || t.dwell_source
}

function nextText(t: TaskRecord): string {
  const parts: string[] = []
  if (t.next_action?.action) parts.push(t.next_action.action)
  if (t.next_action?.message) parts.push(t.next_action.message)
  if (t.next_user_action?.action) parts.push('用户动作：' + t.next_user_action.action)
  if (t.next_user_action?.message && t.next_user_action.message !== t.next_action?.message) parts.push(t.next_user_action.message)
  return parts.join(' · ') || '（未填写）'
}

function historyText(t: TaskRecord): string {
  if (!t.status_history.length) return '（无状态历史）'
  return t.status_history.map((item) => item.status + (item.at ? ' · ' + shortTime(item.at) : '')).join(' → ')
}

function historyTitle(t: TaskRecord): string {
  const withReason = t.status_history.filter((item) => item.reason)
  return withReason.length ? withReason.map((item) => `${item.status}：${item.reason}`).join('\n') : ''
}

function commandFor(t: TaskRecord): string {
  return `node scripts/acceptance-queue.mjs --accept ${t.id} --note "验收通过"`
}

async function copyCommand(t: TaskRecord) {
  const text = commandFor(t)
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    document.execCommand('copy')
    area.remove()
  }
  copiedKey.value = rowKey(t)
  setTimeout(() => {
    if (copiedKey.value === rowKey(t)) copiedKey.value = null
  }, 1600)
}

function toggleTask(t: TaskRecord) {
  openTask.value = openTask.value && rowKey(openTask.value) === rowKey(t) ? null : t
}

function isOpen(t: TaskRecord): boolean {
  return !!openTask.value && rowKey(openTask.value) === rowKey(t)
}

// 视图可复现：筛选、排序与展开状态同步到地址栏，刷新或分享链接即还原。
function syncUrl() {
  const params = new URLSearchParams(location.search)
  params.delete('cell')
  const set = (key: string, value: string | null) => {
    if (value) params.set(key, value)
    else params.delete(key)
  }
  set('proj', selected.value.proj === '全部' ? null : selected.value.proj)
  set('status', selected.value.status)
  set('sort', selected.value.sort === 'status' ? null : selected.value.sort)
  set('archived', selected.value.archived ? '1' : null)
  set('q', keyword.value.trim() || null)
  set('task', openTask.value ? rowKey(openTask.value) : null)
  const query = params.toString()
  history.replaceState(null, '', `${location.pathname}${query ? `?${query}` : ''}${location.hash}`)
}

watch([selected, openTask, keyword], syncUrl, { deep: true })

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  try {
    const raw = sessionStorage.getItem('cg-accepted')
    if (raw) {
      const parsed = JSON.parse(raw) as { ids?: unknown }
      if (Array.isArray(parsed.ids)) acceptedNotice.value = { ids: parsed.ids.filter((id): id is string => typeof id === 'string') }
      sessionStorage.removeItem('cg-accepted')
    }
  } catch {
    // 存储不可用或内容损坏时忽略，不影响页面。
  }
  const params = new URLSearchParams(location.search)
  const cell = params.get('cell')
  if (cell) {
    const sep = cell.indexOf(':')
    if (sep > 0) setFilter(cell.slice(0, sep), cell.slice(sep + 1))
  }
  const status = params.get('status')
  if (status) selected.value = { ...selected.value, status, archived: false }
  const proj = params.get('proj')
  if (proj) selected.value = { ...selected.value, proj }
  const sort = params.get('sort')
  if (sort === 'status' || sort === 'dwell' || sort === 'project') selected.value = { ...selected.value, sort }
  const q = params.get('q')
  if (q) keyword.value = q
  if (params.get('archived') === '1') selected.value = { ...selected.value, archived: true }
  const task = params.get('task')
  if (task) {
    const hit = props.tasks.find((t) => rowKey(t) === task || t.id === task)
    if (hit) openTask.value = hit
  }
})

onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <section id="board">
    <div class="sec-head"><span class="sec-no">03</span><h2>任务看板</h2></div>
    <p class="sec-desc">扫描 <code>local/projects/*/tasks/**/task.yaml</code> 生成；停留天数取状态历史，缺失时退回文件提交日与创建日。归档任务单独计数，不代表 done 或验收。</p>

    <div class="card queue-card" id="acceptance-queue">
      <h3>
        待验收队列（{{ queue.length }} 项）
        <span class="q-hint">review 或要求用户操作；{{ staleCount }} 项停留 ≥3 天</span>
      </h3>

      <div v-if="isDev" class="accept-bar" id="accept-bar">
        <span class="dev-tag">本地开发态</span>
        <label class="sel-all">
          <input
            type="checkbox"
            :checked="allSelected"
            :indeterminate="someSelected"
            :disabled="reviewQueue.length === 0"
            @change="toggleAll"
          />
          全选可验收（{{ reviewQueue.length }} 项）
        </label>
        <button type="button" class="btn-primary" :disabled="selectedIds.length === 0 || submitting" @click="startConfirm">
          批量验收{{ selectedIds.length ? ` ${selectedIds.length} 项` : '' }}
        </button>
        <span class="sel-hint">只验收 review；会写回 task.yaml，构建产物不含此控件</span>
        <p v-if="writeResult && !confirming" class="write-msg" :class="writeResult.ok ? 'ok' : 'bad'">{{ writeResult.text }}</p>
      </div>

      <div v-if="isDev && confirming" class="confirm-box" id="accept-confirm" role="group" aria-labelledby="accept-confirm-title">
        <h4 id="accept-confirm-title">确认验收 {{ selectedIds.length }} 项？</h4>
        <ul class="confirm-ids">
          <li v-for="id in selectedIds" :key="id">{{ id }}</li>
        </ul>
        <label class="confirm-note">
          验收说明（可选，写入状态历史）
          <input ref="noteInput" v-model="note" type="text" maxlength="200" placeholder="例如：页面与证据已核对" />
        </label>
        <div class="confirm-actions">
          <button type="button" class="btn-primary" :disabled="submitting" @click="submitAccept">{{ submitting ? '验收中…' : '确认验收' }}</button>
          <button type="button" class="btn-ghost" :disabled="submitting" @click="cancelConfirm">取消（Esc）</button>
        </div>
        <p v-if="writeResult" class="write-msg" :class="writeResult.ok ? 'ok' : 'bad'">{{ writeResult.text }}</p>
      </div>

      <div v-if="isDev && acceptedNotice" class="accept-notice" role="status">
        <span>已验收 {{ acceptedNotice.ids.length }} 项：<span class="mono">{{ acceptedNotice.ids.join('、') }}</span></span>
        <button type="button" class="btn-ghost" @click="acceptedNotice = null">知道了</button>
      </div>

      <p v-if="queue.length === 0" class="q-empty">当前没有待验收任务。</p>
      <template v-for="group in queueGroups" :key="group.key">
        <h4 class="q-group">{{ group.label }}（{{ group.items.length }}）<span v-if="group.hint" class="q-hint">{{ group.hint }}</span></h4>
        <div v-for="item in group.items" :key="item.key" class="q-row" :class="{ stale: (item.days ?? 0) >= 7, watch: (item.days ?? 0) >= 3 && (item.days ?? 0) < 7 }">
        <div class="q-who">
          <div class="q-head">
            <input
              v-if="isDev"
              class="q-box"
              type="checkbox"
              :disabled="item.status !== 'review'"
              :checked="selectedIds.includes(item.id)"
              :aria-label="`选择 ${item.project}/${item.id}${item.status !== 'review' ? '（非 review，不可验收）' : ''}`"
              @change="toggleSelect(item.id)"
            />
            <span class="mono q-proj">{{ item.project }}</span>
          </div>
          <span class="mono q-id">{{ item.id }}</span>
        </div>
        <div class="q-body">
          <span class="pill" :class="STATUS_CLASS[item.status]">{{ item.status }}</span>
          <span :class="dwellClass(item.days)">{{ dwellLabel(item.days) }}</span>
          <span class="q-tag">{{ item.waiting ? '等待用户' : '审查中' }}</span>
          <span v-if="item.task.has_review && item.task.has_verification" class="q-sugg ok">产物已齐，可验收</span>
          <span v-if="(item.days ?? 0) >= 7" class="q-sugg stale">≥7 天建议优先处理</span>
          <span class="q-src">停留来源：{{ SOURCE_LABEL[item.source] || item.source }}</span>
          <p class="q-msg">{{ item.message || '（未填写下一步说明）' }}</p>
        </div>
        <button type="button" class="copy-btn" @click="copyCommand(item.task)">
          {{ copiedKey === item.key ? '已复制' : '复制验收命令' }}
        </button>
        </div>
      </template>
    </div>

    <div class="chips" id="stat-chips">
      <button
        v-for="chip in chipsDef"
        :key="chip.label"
        type="button"
        class="stat"
        :class="[chip.cls, { on: isChipOn(chip) }]"
        @click="setChip(chip)"
      >
        <span class="n">{{ chip.n }}</span>
        <span class="l">{{ chip.label }}</span>
      </button>
    </div>

    <div class="card" style="overflow-x:auto">
      <h3>项目 × 状态矩阵 <span class="q-hint">悬浮可见该状态最久停留；点击筛选下方明细</span></h3>
      <table id="matrix" style="margin-top:8px">
        <thead>
          <tr>
            <th>项目</th>
            <th v-for="s in STATUS_ORDER" :key="s" class="num">{{ s }}</th>
            <th class="num">归档</th>
            <th class="num">合计</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in matrixRows" :key="row.project">
            <td class="mono">{{ row.project }}</td>
            <td v-for="cell in row.cells" :key="cell.status" class="num"
                :class="{ clickable: cell.clickable, stale: cell.stale, on: !selected.archived && selected.proj === row.project && selected.status === cell.status }"
                :style="cell.color ? { color: cell.color } : undefined"
                :title="cell.clickable ? `点击筛选下方明细${cell.maxDays !== null ? ` · 最久 ${cell.maxDays} 天` : ''}` : undefined"
                @click="cell.clickable && setFilter(row.project, cell.status)">{{ cell.n === 0 ? '–' : cell.n }}</td>
            <td class="num">{{ row.archived }}</td>
            <td class="num">{{ row.total }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="card" style="margin-top:16px">
      <h3>任务明细（{{ detailRows.length }} 项）<span class="q-hint">{{ filterLabel }}</span></h3>
      <div class="filters" id="proj-filters">
        <button v-for="p in projWithActive" :key="p" type="button" :class="{ on: selected.proj === p }" @click="setFilter(p, selected.status)">{{ p }}</button>
        <button v-if="showClear" type="button" @click="clearAll">清除筛选</button>
      </div>
      <div class="filters" id="sort-filters">
        <span class="f-label">排序</span>
        <button type="button" :class="{ on: selected.sort === 'status' }" @click="setSort('status')">按状态</button>
        <button type="button" :class="{ on: selected.sort === 'dwell' }" @click="setSort('dwell')">停留最久</button>
        <button type="button" :class="{ on: selected.sort === 'project' }" @click="setSort('project')">按项目</button>
      </div>
      <div class="filters" id="search-filter">
        <label class="f-label" for="task-search">搜索</label>
        <input id="task-search" v-model="keyword" type="search" class="search-input"
               placeholder="任务 ID 或目标关键词" aria-label="按任务 ID 或目标关键词搜索" />
        <button v-if="keyword" type="button" @click="keyword = ''">清空搜索</button>
      </div>
      <div style="overflow-x:auto">
        <table id="active-table">
          <thead><tr><th>项目</th><th>任务</th><th>状态</th><th class="num">停留（天）</th><th>工作流</th><th>交付路径</th></tr></thead>
          <tbody>
            <tr v-if="detailRows.length === 0">
              <td colspan="6" style="color:var(--faint)">无匹配任务</td>
            </tr>
            <template v-for="t in detailRows" :key="t.project + '/' + t.id">
              <tr class="task-row"
                  :class="{ open: isOpen(t) }"
                  tabindex="0"
                  role="button"
                  :aria-expanded="isOpen(t) ? 'true' : 'false'"
                  @click="toggleTask(t)"
                  @keydown.enter.prevent="toggleTask(t)"
                  @keydown.space.prevent="toggleTask(t)">
                <td class="mono">{{ t.project }}</td>
                <td class="mono">{{ t.id }}</td>
                <td><span class="pill" :class="STATUS_CLASS[t.status]">{{ t.status }}</span></td>
                <td class="num"><span :class="dwellClass(t.days_in_status)">{{ t.days_in_status === null ? '—' : t.days_in_status }}</span></td>
                <td class="mono">{{ t.workflow }}</td>
                <td class="mono">{{ deliveryLabel(t) }}</td>
              </tr>
              <tr v-if="isOpen(t)" class="task-detail">
                <td colspan="6">
                  <div class="td-grid">
                    <div class="td-k">目标</div>
                    <div class="td-v">{{ t.goal || '（未填写）' }}</div>
                    <div class="td-k">创建 / 更新</div>
                    <div class="td-v mono">{{ t.created_at || '—' }} → {{ t.updated_at || '—' }}</div>
                    <div class="td-k">进入当前状态</div>
                    <div class="td-v mono">{{ t.entered_at || '—' }} · 来源 {{ sourceLabel(t) }}</div>
                    <div class="td-k">停留</div>
                    <div class="td-v mono">{{ dwellLabel(t.days_in_status) }}（{{ sourceLabel(t) }}）</div>
                    <div class="td-k">下一步</div>
                    <div class="td-v">{{ nextText(t) }}</div>
                    <div class="td-k">状态历史</div>
                    <div class="td-v hist-line" :title="historyTitle(t)">{{ historyText(t) }}</div>
                    <div class="td-k">文件</div>
                    <div class="td-v mono">{{ t.task_file }}</div>
                  </div>
                  <button v-if="!t.archived && t.status === 'review'" type="button" class="copy-btn" @click.stop="copyCommand(t)">
                    {{ copiedKey === rowKey(t) ? '已复制' : '复制验收命令' }}
                  </button>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

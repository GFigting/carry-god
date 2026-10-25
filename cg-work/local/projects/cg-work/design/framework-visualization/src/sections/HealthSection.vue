<script setup lang="ts">
import { computed } from 'vue'
import type { Snapshot } from '../types'

const props = defineProps<{ snapshot: Snapshot }>()

const rqProjects = computed(() => Object.keys(props.snapshot.projectMeta)
  .filter((p) => props.snapshot.projectMeta[p].requirements + props.snapshot.projectMeta[p].requirementsArchived > 0)
  .sort((a, b) => props.snapshot.projectMeta[b].requirements - props.snapshot.projectMeta[a].requirements))

const rqMax = computed(() => Math.max(...rqProjects.value.map((p) => props.snapshot.projectMeta[p].requirements + props.snapshot.projectMeta[p].requirementsArchived), 1))
const rqTotal = computed(() => Object.values(props.snapshot.projectMeta).reduce((s, m) => s + m.requirements, 0))
const rqArch = computed(() => Object.values(props.snapshot.projectMeta).reduce((s, m) => s + m.requirementsArchived, 0))
const archivedCount = computed(() => props.snapshot.tasks.filter((t) => t.archived).length)

const healthChips = computed(() => [
  ['框架版本', 'v' + props.snapshot.version],
  ['技能', props.snapshot.skills.total + '（自有 ' + props.snapshot.skills.framework + ' / 镜像 ' + props.snapshot.skills.mirror + '）'],
  ['受管项目', Object.keys(props.snapshot.projectMeta).length + ' 个'],
  ['任务记录', props.snapshot.tasks.length + ' 个（归档 ' + archivedCount.value + '）'],
])

const checkDetail = computed(() => {
  const when = props.snapshot.check.stale ? 'dev server 启动时 npm run check' : '最近一次构建时 npm run check'
  return props.snapshot.check.ok
    ? when + '：' + props.snapshot.check.detail
    : when + ' 未通过：' + props.snapshot.check.detail
})

const fileCounts = computed(() => 'core ' + props.snapshot.files.core + ' · workflows ' + props.snapshot.files.workflows + ' · scripts ' + props.snapshot.files.scripts + ' · test ' + props.snapshot.files.tests + ' 个文件')
</script>

<template>
  <section id="health">
    <div class="sec-head"><span class="sec-no">06</span><h2>需求箱与框架健康</h2></div>
    <p class="sec-desc">需求箱只允许用户手动添加原始需求，Agent 不生成；深色为存量、浅色为已归档。</p>
    <div class="grid g2">
      <div class="card">
        <h3>需求箱存量（按项目）</h3>
        <div id="rq-list" style="margin-top:10px">
          <div v-for="p in rqProjects" :key="p" class="rq-row">
            <div class="name">{{ p }}</div>
            <div class="rq-track">
              <div class="rq-fill" :style="{ width: snapshot.projectMeta[p].requirements / rqMax * 100 + '%' }"></div>
              <div class="rq-arch" :style="{ width: snapshot.projectMeta[p].requirementsArchived / rqMax * 100 + '%' }"></div>
            </div>
            <div class="n">{{ snapshot.projectMeta[p].requirements }}{{ snapshot.projectMeta[p].requirementsArchived ? ' +' + snapshot.projectMeta[p].requirementsArchived : '' }}</div>
          </div>
          <p style="font-size:14px;color:var(--muted);margin-top:8px">合计存量 {{ rqTotal }} 包{{ rqArch ? '，已归档 ' + rqArch + ' 包' : '' }}</p>
        </div>
      </div>
      <div class="card">
        <h3>框架健康</h3>
        <div class="chips" style="margin-top:10px;margin-bottom:6px" id="health-chips">
          <div v-for="[label, value] in healthChips" :key="label" class="stat">
            <div class="n">{{ value }}</div>
            <div class="l">{{ label }}</div>
          </div>
        </div>
        <p style="font-size:14px;color:var(--muted)" id="health-detail">{{ checkDetail }}</p>
        <p style="font-size:14px;color:var(--muted);margin-top:8px">目录文件数：<span id="file-counts">{{ fileCounts }}</span></p>
      </div>
    </div>
  </section>
</template>

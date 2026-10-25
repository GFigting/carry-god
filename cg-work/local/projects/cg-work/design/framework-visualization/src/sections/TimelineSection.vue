<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { CommitDay } from '../types'

const props = defineProps<{ commits: CommitDay[] }>()

const totalCommits = computed(() => props.commits.reduce((s, c) => s + c.n, 0))
const activeDays = computed(() => props.commits.filter((c) => c.n > 0).length)
const maxN = computed(() => Math.max(...props.commits.map((c) => c.n), 1))
const last7 = computed(() => props.commits.slice(-7).reduce((s, c) => s + c.n, 0))
const peak = computed(() => props.commits.reduce((a, b) => (b.n > a.n ? b : a), props.commits[0]))

const stats = computed(() => [
  ['提交总数', String(totalCommits.value)],
  ['活跃天数', String(activeDays.value)],
  ['峰值单日', peak.value.n + '（' + peak.value.date + '）'],
  ['近 7 天', String(last7.value)],
])

const peaks = computed(() => [...props.commits].sort((a, b) => b.n - a.n).slice(0, 3))

const peaksHtml = computed(() => '高产期：<b>' + peaks.value.map((p) => p.date + ' × ' + p.n).join('</b> · <b>') + '</b>（点击柱子查看当日提交）')

const axisLabels = computed(() => props.commits.flatMap((c, i) => {
  if (!c.date.endsWith('-01') && i !== props.commits.length - 1) return []
  const left = props.commits.length > 1 ? (i / (props.commits.length - 1) * 100) + '%' : '0%'
  return [{ text: c.date.slice(0, 7), left }]
}))

const selDay = ref<string | null>(null)
const selectedCommit = computed(() => (selDay.value ? props.commits.find((c) => c.date === selDay.value) || null : null))

function showDay(date: string) {
  const c = props.commits.find((x) => x.date === date)
  if (!c || c.n === 0) return
  selDay.value = selDay.value === date ? null : date
}

function isWeekend(date: string): boolean {
  const day = new Date(date + 'T00:00:00').getDay()
  return day === 0 || day === 6
}

function isPeak(c: CommitDay): boolean {
  return peaks.value.some((p) => p.date === c.date) && c.n > 0
}

onMounted(() => {
  const day = new URLSearchParams(location.search).get('day')
  if (day) showDay(day)
})
</script>

<template>
  <section id="timeline">
    <div class="sec-head"><span class="sec-no">05</span><h2>提交时间线</h2></div>
    <p class="sec-desc">git log 自 <span id="tl-since">{{ commits[0].date }}</span> 起按日聚合；框架侧提交（含框架受管项目任务记录）。</p>
    <div class="tl-stats" id="tl-stats">
      <div v-for="[label, n] in stats" :key="label" class="stat c-all">
        <div class="n">{{ n }}</div>
        <div class="l">{{ label }}</div>
      </div>
    </div>
    <div class="tl-chart" id="tl-chart">
      <div v-for="c in commits" :key="c.date" class="tl-day" :class="{ weekend: isWeekend(c.date), peak: isPeak(c), 'has-commits': c.n > 0, sel: selDay === c.date }" :data-date="c.date" @click="c.n > 0 && showDay(c.date)">
        <div class="tip">{{ c.date }} · {{ c.n }} commits</div>
        <div class="bar" :style="{ height: c.n / maxN * 100 + '%' }"></div>
      </div>
    </div>
    <div class="tl-axis" id="tl-axis">
      <span v-for="(a, i) in axisLabels" :key="i" :style="{ left: a.left }">{{ a.text }}</span>
    </div>
    <div id="tl-detail" :class="{ show: !!selectedCommit }">
      <template v-if="selectedCommit">
        <h4><span>{{ selectedCommit.date }} · {{ selectedCommit.n }} commits</span><button class="close" @click="showDay(selectedCommit.date)">收起</button></h4>
        <ul>
          <li v-for="(title, i) in selectedCommit.titles" :key="i">{{ title }}</li>
        </ul>
      </template>
    </div>
    <div class="tl-peaks" id="tl-peaks" v-html="peaksHtml"></div>
  </section>
</template>

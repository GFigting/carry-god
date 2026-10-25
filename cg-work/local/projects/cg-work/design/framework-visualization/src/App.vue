<script setup lang="ts">
import { DATA } from './data'
import MapSection from './sections/MapSection.vue'
import StateMachineSection from './sections/StateMachineSection.vue'
import BoardSection from './sections/BoardSection.vue'
import WorkflowsSection from './sections/WorkflowsSection.vue'
import TimelineSection from './sections/TimelineSection.vue'
import HealthSection from './sections/HealthSection.vue'

const projectCount = Object.keys(DATA.projectMeta).length
</script>

<template>
  <div class="wrap">
    <header class="top">
      <div class="top-row">
        <h1>cg-work 框架全景</h1>
        <span class="ver" id="ver">v{{ DATA.version }}</span>
        <span class="badge" id="check-badge" :class="DATA.check.ok ? 'ok' : 'fail'"
              :title="`校验于 ${DATA.check.checked_at}${DATA.check.stale ? '（dev server 启动时执行，任务变更不会重跑）' : ''}`">
          <span class="dot"></span><span id="check-text">{{ DATA.check.ok ? 'npm run check 通过' : 'npm run check 失败' }}{{ DATA.check.stale ? '（启动时）' : '' }}</span>
        </span>
        <span class="snap" id="snap">快照 {{ DATA.generated_at }}</span>
      </div>
      <p class="sub">内部 AI 软件开发框架 · 只读可视化镜像 — 一页看全：目录职责、任务状态机、实时看板、工作流、交付路径与提交活跃度。构建产物为构建时快照；dev 下任务变更会自动刷新。</p>
    </header>

    <nav>
      <a href="#map">框架地图</a>
      <a href="#state">状态机</a>
      <a href="#board">任务看板</a>
      <a href="#workflows">工作流</a>
      <a href="#timeline">提交时间线</a>
      <a href="#health">需求箱与健康</a>
    </nav>

    <MapSection :skills="DATA.skills" :project-count="projectCount" />
    <StateMachineSection :tasks="DATA.tasks" />
    <BoardSection :tasks="DATA.tasks" :project-meta="DATA.projectMeta" />
    <WorkflowsSection :tasks="DATA.tasks" />
    <TimelineSection :commits="DATA.commits" />
    <HealthSection :snapshot="DATA" />

    <footer>
      <span>数据快照：<span id="foot-snap">{{ DATA.generated_at }}</span> · 只读镜像，不替代 <code>npm run check</code> / <code>npm run queue</code></span>
      <span>刷新：在本目录执行 <code>npm run build</code></span>
    </footer>
  </div>
</template>

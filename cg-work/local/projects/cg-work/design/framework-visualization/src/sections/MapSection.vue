<script setup lang="ts">
import type { Snapshot } from '../types'

defineProps<{ skills: Snapshot['skills']; projectCount: number }>()
</script>

<template>
  <section id="map">
    <div class="sec-head"><span class="sec-no">01</span><h2>框架地图</h2></div>
    <p class="sec-desc">五大目录各唯一职责；规则正文以 <b>README.md</b> 与 <b>core/</b> 为唯一来源，本页不复制规则、只做导航。</p>
    <div class="grid g-map">
      <div class="card"><h3><span class="path">AGENTS.md · README.md</span></h3><p>路由与唯一推荐入口：项目识别门禁 → 项目上下文 → 低风险判断 → 任务记录 → 技能加载 → review 收尾 → <code>npm run check</code>。</p></div>
      <div class="card"><h3><span class="path">core/</span></h3><p>规则正文唯一来源：工作模型（状态机/证据生命周期）、项目上下文、命名与提交、框架维护、特殊操作授权边界 + 模板。</p></div>
      <div class="card"><h3><span class="path">workflows/</span></h3><p>按开发意图的 8 个流程，共享同一阶段契约；技能引用分 <code>framework:</code> / <code>project:</code> 两类。</p></div>
      <div class="card"><h3><span class="path">skills/</span></h3><p><span class="big" id="sk-total">{{ skills.total }}</span> 个技能：<span id="sk-split">{{ skills.framework }} 框架自有 + {{ skills.localized }} 本地化 + {{ skills.mirror }} 原始镜像</span>。原始镜像保持上游原样，不做本地改写。</p></div>
      <div class="card"><h3><span class="path">scripts/</span></h3><p>结构/锚点/镜像一致性校验与任务工具：check、queue、archive、migrate、task-stamp。</p></div>
      <div class="card"><h3><span class="path">local/</span></h3><p><span class="big" id="proj-count">{{ projectCount }}</span> 个受管项目的上下文、需求箱与任务产物；业务项目真实数据保持本地不入库。</p></div>
    </div>
    <div class="grid g2" style="margin-top:16px">
      <div class="card">
        <h3>规则优先级（冲突时自上而下）</h3>
        <div class="chain">
          <span class="node hi">用户明确要求</span><span class="sep">&gt;</span>
          <span class="node">项目自身规则</span><span class="sep">&gt;</span>
          <span class="node">core/</span><span class="sep">&gt;</span>
          <span class="node">workflows/</span><span class="sep">&gt;</span>
          <span class="node">skills/ 建议</span>
        </div>
      </div>
      <div class="card">
        <h3>提交口径</h3>
        <p>框架内容默认全部提交；业务项目数据、需求、任务与报告保持本地。收尾只建本地 commit；推送/合并/部署需单独授权。</p>
      </div>
    </div>
    <div class="card" style="margin-top:16px">
      <h3>使用顺序（README 十步）</h3>
      <ol class="steps">
        <li><b>读入口</b>：AGENTS.md + README.md</li>
        <li><b>项目识别</b>：framework:project-discovery</li>
        <li><b>上下文检查</b>：缺失则 project-initialization</li>
        <li><b>低风险判断</b>：纯文案/样式走免记录路径</li>
        <li><b>建任务</b>：其他变更创建 pending task</li>
        <li><b>加载技能</b>：按流程声明 required skills</li>
        <li><b>决策预检</b>：高风险等待用户确认</li>
        <li><b>证据留痕</b>：计划/审查/验证分阶段落盘</li>
        <li><b>校验</b>：npm run check / npm run queue</li>
        <li><b>授权边界</b>：外部/破坏性操作先读 special-operations</li>
      </ol>
    </div>
  </section>
</template>

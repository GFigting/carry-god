import path from 'node:path';

const rules = [
  ['fix', /(报错|错误|故障|修复|bug|broken|error|wrong|失败)/i],
  ['optimize', /(性能|速度|耗时|成本|优化|慢|performance|latency|cost|optimi[sz])/i],
  ['refactor', /(重构|整理结构|技术债|架构改善|refactor|restructure)/i],
  ['prototype', /(原型|交互|视觉|设计方案|验证方案|prototype|ux|ui)/i],
  ['review', /(审查|评审|检查|验证|复盘|review|audit|inspect)/i],
  ['work', /(新增|增加|支持|实现|开发|功能|需求|feature|add|build|implement)/i]
];

export function classifyRequest(text) {
  const matches = rules.filter(([, pattern]) => pattern.test(text)).map(([type]) => type);
  const unique = [...new Set(matches)];
  if (unique.length === 1) return { type: unique[0], confidence: 'high', matched_types: unique, open_questions: [] };
  if (unique.length > 1) return {
    type: 'work', confidence: 'low', matched_types: unique,
    open_questions: [`需求同时包含 ${unique.join('、')} 等意图，请确认主要目标。`]
  };
  return { type: 'work', confidence: 'low', matched_types: [], open_questions: ['无法判断这是新功能、修复、重构、优化、原型还是审查，请确认需求类型。'] };
}

export function titleFromRequest(text) {
  const normalized = text.trim().replace(/\s+/g, ' ');
  return normalized.length > 80 ? `${normalized.slice(0, 77)}...` : normalized;
}

export function makeTaskId(existingIds, now = new Date()) {
  const date = now.toISOString().slice(0, 10).replaceAll('-', '');
  const prefix = `TASK-${date}-`;
  const used = existingIds.filter((id) => id.startsWith(prefix)).map((id) => Number(id.slice(prefix.length))).filter(Number.isInteger);
  const next = used.length ? Math.max(...used) + 1 : 1;
  return `${prefix}${String(next).padStart(3, '0')}`;
}

export function projectPathFromConfig(project) { return project ? path.resolve(project) : process.cwd(); }

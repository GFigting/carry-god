export const TYPES = new Set(['work', 'fix', 'refactor', 'optimize', 'prototype', 'review']);
export const STATES = ['draft', 'ready', 'in_progress', 'under_review', 'blocked', 'revision', 'done', 'cancelled', 'archived'];

const transitions = {
  draft: ['ready', 'cancelled'], ready: ['in_progress', 'cancelled'],
  in_progress: ['under_review', 'blocked', 'cancelled'], blocked: ['in_progress', 'cancelled'],
  under_review: ['done', 'revision', 'cancelled'], revision: ['in_progress', 'cancelled'],
  done: ['archived'], archived: [], cancelled: []
};

export function canTransition(from, to) { return transitions[from]?.includes(to) ?? false; }
export function allowedTransitions(from) { return transitions[from] ?? []; }

export interface TaskAction {
  required: boolean
  action: string
  message: string
}

export interface StatusEntry {
  status: string
  at: string | null
  reason: string
}

export interface TaskRecord {
  id: string
  project: string
  status: string
  workflow: string
  delivery_path: string
  role: string
  archived: boolean
  goal: string
  created_at: string | null
  updated_at: string | null
  entered_at: string | null
  days_in_status: number | null
  dwell_source: 'status_history' | 'git' | 'created_at' | 'unknown'
  next_action: TaskAction | null
  next_user_action: TaskAction | null
  status_history: StatusEntry[]
  has_review: boolean
  has_verification: boolean
  task_file: string
}

export interface ProjectMeta {
  tasks: number
  archived: number
  requirements: number
  requirementsArchived: number
}

export interface CommitDay {
  date: string
  n: number
  titles: string[]
}

export interface Snapshot {
  generated_at: string
  version: string
  check: { ok: boolean; detail: string; checked_at: string; stale: boolean }
  skills: { total: number; framework: number; localized: number; mirror: number }
  files: { core: number; workflows: number; scripts: number; tests: number }
  tasks: TaskRecord[]
  projectMeta: Record<string, ProjectMeta>
  commits: CommitDay[]
}

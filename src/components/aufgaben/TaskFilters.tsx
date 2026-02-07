'use client'

import Select from '@/components/ui/Select'
import { TASK_STATUS_OPTIONS } from '@/lib/constants'
import type { Profile, Project, TaskStatus } from '@/lib/types/database'

type FilterValues = {
  status: TaskStatus | ''
  assigned_to: string
  project_id: string
}

export default function TaskFilters({
  filters,
  onChange,
  profiles,
  projects,
}: {
  filters: FilterValues
  onChange: (filters: FilterValues) => void
  profiles: Profile[]
  projects: Project[]
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <div className="w-40">
        <Select
          value={filters.status}
          onChange={(e) => onChange({ ...filters, status: e.target.value as TaskStatus | '' })}
          placeholder="Alle Status"
          options={TASK_STATUS_OPTIONS.map((s) => ({ value: s.value, label: s.label }))}
        />
      </div>
      <div className="w-44">
        <Select
          value={filters.assigned_to}
          onChange={(e) => onChange({ ...filters, assigned_to: e.target.value })}
          placeholder="Alle Mitglieder"
          options={profiles.map((p) => ({ value: p.id, label: p.full_name }))}
        />
      </div>
      <div className="w-44">
        <Select
          value={filters.project_id}
          onChange={(e) => onChange({ ...filters, project_id: e.target.value })}
          placeholder="Alle Projekte"
          options={projects.map((p) => ({ value: p.id, label: p.name }))}
        />
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import Button from '@/components/ui/Button'
import Tabs from '@/components/ui/Tabs'
import TaskList from '@/components/aufgaben/TaskList'
import TaskKanban from '@/components/aufgaben/TaskKanban'
import TaskFilters from '@/components/aufgaben/TaskFilters'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useTasks } from '@/lib/hooks/useTasks'
import { useProjects } from '@/lib/hooks/useProjects'
import { useProfiles } from '@/lib/hooks/useUser'
import type { TaskStatus } from '@/lib/types/database'

type ViewMode = 'liste' | 'kanban'

export default function AufgabenPage() {
  const [view, setView] = useState<ViewMode>('liste')
  const [filters, setFilters] = useState({
    status: '' as TaskStatus | '',
    assigned_to: '',
    project_id: '',
  })

  const { tasks, loading, updateTask, setTasksLocal } = useTasks(filters)
  const { projects } = useProjects()
  const { profiles } = useProfiles()

  async function handleStatusChange(taskId: string, newStatus: TaskStatus) {
    // Optimistic update
    setTasksLocal((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    )
    await updateTask(taskId, { status: newStatus })
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Aufgaben</h1>
        <Link href="/aufgaben/neu">
          <Button>
            <Plus size={16} /> Neue Aufgabe
          </Button>
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <TaskFilters
          filters={filters}
          onChange={setFilters}
          profiles={profiles}
          projects={projects}
        />
        <Tabs
          tabs={[
            { value: 'liste' as ViewMode, label: 'Liste' },
            { value: 'kanban' as ViewMode, label: 'Kanban' },
          ]}
          active={view}
          onChange={setView}
        />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : view === 'liste' ? (
        <TaskList tasks={tasks} />
      ) : (
        <TaskKanban tasks={tasks} onStatusChange={handleStatusChange} />
      )}
    </div>
  )
}

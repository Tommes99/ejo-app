'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import Button from '@/components/ui/Button'
import ProjectForm from '@/components/projekte/ProjectForm'
import TaskList from '@/components/aufgaben/TaskList'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import EmptyState from '@/components/ui/EmptyState'
import { createClient } from '@/lib/supabase/client'
import type { Project, Task } from '@/lib/types/database'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const [projectRes, tasksRes] = await Promise.all([
        supabase.from('projects').select('*').eq('id', params.id).single(),
        supabase
          .from('tasks')
          .select('*, assigned_profile:profiles!tasks_assigned_to_fkey(*), project:projects(*)')
          .eq('project_id', params.id)
          .order('created_at', { ascending: false }),
      ])
      setProject(projectRes.data)
      setTasks(tasksRes.data || [])
      setLoading(false)
    }
    fetchData()
  }, [params.id])

  if (loading) return <LoadingSpinner />
  if (!project) return <p className="text-gray-500">Projekt nicht gefunden.</p>

  if (editing) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Projekt bearbeiten</h1>
        <div className="mx-auto max-w-2xl">
          <ProjectForm
            project={project}
            onSubmit={async (data) => {
              const supabase = createClient()
              const { data: updated } = await supabase
                .from('projects')
                .update(data)
                .eq('id', project.id)
                .select()
                .single()
              if (updated) setProject(updated)
              setEditing(false)
            }}
            onDelete={async () => {
              const supabase = createClient()
              await supabase.from('projects').delete().eq('id', project.id)
              router.push('/projekte')
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="h-4 w-4 rounded-full"
            style={{ backgroundColor: project.color }}
          />
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setEditing(true)}>
            Bearbeiten
          </Button>
          <Link href={`/aufgaben/neu?project=${project.id}`}>
            <Button>
              <Plus size={16} /> Aufgabe hinzufügen
            </Button>
          </Link>
        </div>
      </div>

      {project.description && (
        <p className="mb-6 text-sm text-gray-600">{project.description}</p>
      )}

      <h2 className="mb-3 text-lg font-semibold text-gray-800">
        Aufgaben ({tasks.length})
      </h2>

      {tasks.length === 0 ? (
        <EmptyState message="Noch keine Aufgaben in diesem Projekt." />
      ) : (
        <TaskList tasks={tasks} />
      )}
    </div>
  )
}

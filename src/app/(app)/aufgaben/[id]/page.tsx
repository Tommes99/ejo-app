'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import TaskForm from '@/components/aufgaben/TaskForm'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useProjects } from '@/lib/hooks/useProjects'
import { useProfiles } from '@/lib/hooks/useUser'
import { createClient } from '@/lib/supabase/client'
import type { Task } from '@/lib/types/database'

export default function TaskDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const { projects } = useProjects()
  const { profiles } = useProfiles()

  useEffect(() => {
    async function fetchTask() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('tasks')
          .select('*, assigned_profile:profiles!tasks_assigned_to_fkey(*), project:projects(*)')
          .eq('id', params.id)
          .single()
        if (error) console.error('fetchTask error:', error.message)
        setTask(data)
      } catch (err) {
        console.error('fetchTask error:', err)
      }
      setLoading(false)
    }
    fetchTask()
  }, [params.id])

  if (loading) return <LoadingSpinner />
  if (!task) return <p className="text-gray-500">Aufgabe nicht gefunden.</p>

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Aufgabe bearbeiten</h1>
      <div className="mx-auto max-w-2xl">
        <TaskForm
          task={task}
          profiles={profiles}
          projects={projects}
          onSubmit={async (data) => {
            const supabase = createClient()
            const { error } = await supabase.from('tasks').update(data).eq('id', task.id)
            if (error) throw new Error(error.message)
            router.push('/aufgaben')
          }}
          onDelete={async () => {
            const supabase = createClient()
            const { error } = await supabase.from('tasks').delete().eq('id', task.id)
            if (error) throw new Error(error.message)
            router.push('/aufgaben')
          }}
        />
      </div>
    </div>
  )
}

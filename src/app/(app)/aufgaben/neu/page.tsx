'use client'

import { useRouter } from 'next/navigation'
import TaskForm from '@/components/aufgaben/TaskForm'
import { useTasks } from '@/lib/hooks/useTasks'
import { useProjects } from '@/lib/hooks/useProjects'
import { useProfiles } from '@/lib/hooks/useUser'

export default function NeueAufgabePage() {
  const router = useRouter()
  const { createTask } = useTasks()
  const { projects } = useProjects()
  const { profiles } = useProfiles()

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Neue Aufgabe</h1>
      <div className="mx-auto max-w-2xl">
        <TaskForm
          profiles={profiles}
          projects={projects}
          onSubmit={async (data) => {
            await createTask(data)
            router.push('/aufgaben')
          }}
        />
      </div>
    </div>
  )
}

'use client'

import { useRouter } from 'next/navigation'
import ProjectForm from '@/components/projekte/ProjectForm'
import { useProjects } from '@/lib/hooks/useProjects'

export default function NeuesProjektPage() {
  const router = useRouter()
  const { createProject } = useProjects()

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Neues Projekt</h1>
      <div className="mx-auto max-w-2xl">
        <ProjectForm
          onSubmit={async (data) => {
            await createProject(data)
            router.push('/projekte')
          }}
        />
      </div>
    </div>
  )
}

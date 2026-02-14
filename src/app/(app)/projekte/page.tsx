'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import Button from '@/components/ui/Button'
import ProjectCard from '@/components/projekte/ProjectCard'
import EmptyState from '@/components/ui/EmptyState'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useProjects } from '@/lib/hooks/useProjects'

export default function ProjektePage() {
  const { projects, loading } = useProjects()

  const active = projects.filter((p) => p.status !== 'archiviert')
  const archived = projects.filter((p) => p.status === 'archiviert')

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Projekte</h1>
        <Link href="/projekte/neu">
          <Button>
            <Plus size={16} /> Neues Projekt
          </Button>
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : projects.length === 0 ? (
        <EmptyState
          message="Noch keine Projekte vorhanden."
          action={
            <Link href="/projekte/neu">
              <Button>Erstes Projekt erstellen</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-8">
          {active.length > 0 && (
            <div>
              <h2 className="mb-3 text-lg font-semibold text-gray-800">In Bearbeitung</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {active.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </div>
          )}

          {archived.length > 0 && (
            <div>
              <h2 className="mb-3 text-lg font-semibold text-gray-500">Archiviert</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {archived.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

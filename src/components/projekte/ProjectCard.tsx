import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import { PROJECT_STATUS_OPTIONS } from '@/lib/constants'
import type { Project } from '@/lib/types/database'

export default function ProjectCard({ project }: { project: Project }) {
  const statusOption = PROJECT_STATUS_OPTIONS.find((s) => s.value === project.status)

  return (
    <Link
      href={`/projekte/${project.id}`}
      className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="mb-2 flex items-center gap-2">
        <div
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: project.color }}
        />
        <h3 className="flex-1 font-medium text-gray-900">{project.name}</h3>
        {statusOption && project.status === 'archiviert' && (
          <Badge className={statusOption.color}>{statusOption.label}</Badge>
        )}
      </div>
      {project.description && (
        <p className="text-sm text-gray-500 line-clamp-2">{project.description}</p>
      )}
    </Link>
  )
}

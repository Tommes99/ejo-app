import Link from 'next/link'
import type { Project } from '@/lib/types/database'

export default function ProjectCard({ project }: { project: Project }) {
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
        <h3 className="font-medium text-gray-900">{project.name}</h3>
      </div>
      {project.description && (
        <p className="text-sm text-gray-500 line-clamp-2">{project.description}</p>
      )}
    </Link>
  )
}

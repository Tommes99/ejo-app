import Link from 'next/link'
import { Calendar, User } from 'lucide-react'
import TaskStatusBadge from './TaskStatusBadge'
import { formatDate } from '@/lib/utils'
import type { Task } from '@/lib/types/database'

export default function TaskCard({ task }: { task: Task }) {
  return (
    <Link
      href={`/aufgaben/${task.id}`}
      className="block rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{task.title}</h3>
        <TaskStatusBadge status={task.status} />
      </div>

      {task.description && (
        <p className="mb-2 text-xs text-gray-500 line-clamp-2">{task.description}</p>
      )}

      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
        {task.assigned_profile && (
          <span className="flex items-center gap-1">
            <User size={12} />
            {task.assigned_profile.full_name}
          </span>
        )}
        {task.deadline && (
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {formatDate(task.deadline)}
          </span>
        )}
        {task.project && (
          <span
            className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
            style={{ backgroundColor: task.project.color }}
          >
            {task.project.name}
          </span>
        )}
      </div>
    </Link>
  )
}

import Link from 'next/link'
import Card from '@/components/ui/Card'
import TaskStatusBadge from '@/components/aufgaben/TaskStatusBadge'
import { formatDate } from '@/lib/utils'
import type { Task } from '@/lib/types/database'

export default function UpcomingTasks({ tasks }: { tasks: Task[] }) {
  const upcoming = tasks
    .filter((t) => t.deadline && t.status !== 'archiviert')
    .sort((a, b) => (a.deadline ?? '') > (b.deadline ?? '') ? 1 : -1)
    .slice(0, 5)

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Nächste Aufgaben</h2>
        <Link href="/aufgaben" className="text-sm text-blue-600 hover:text-blue-500">
          Alle
        </Link>
      </div>
      {upcoming.length === 0 ? (
        <p className="text-sm text-gray-500">Keine anstehenden Aufgaben.</p>
      ) : (
        <div className="space-y-2">
          {upcoming.map((task) => (
            <Link
              key={task.id}
              href={`/aufgaben/${task.id}`}
              className="flex items-center justify-between rounded-md p-2 text-sm hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                <TaskStatusBadge status={task.status} />
                <span className="text-gray-900 line-clamp-1">{task.title}</span>
              </div>
              {task.deadline && (
                <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                  {formatDate(task.deadline)}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </Card>
  )
}

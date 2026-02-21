'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Card from '@/components/ui/Card'
import TaskStatusBadge from '@/components/aufgaben/TaskStatusBadge'
import { formatDate } from '@/lib/utils'
import type { Task } from '@/lib/types/database'

const PAGE_SIZE = 5

export default function UpcomingTasks({ tasks, userId }: { tasks: Task[]; userId?: string }) {
  const [onlyMine, setOnlyMine] = useState(true)
  const [page, setPage] = useState(0)

  const filtered = tasks
    .filter((t) => t.status !== 'archiviert')
    .filter((t) => !onlyMine || !userId || t.assigned_to === userId)
    .sort((a, b) => {
      if (a.deadline && b.deadline) return a.deadline > b.deadline ? 1 : -1
      if (a.deadline) return -1
      if (b.deadline) return 1
      return 0
    })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const handleToggle = () => {
    setOnlyMine(!onlyMine)
    setPage(0)
  }

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Nächste Aufgaben</h2>
        <div className="flex items-center gap-3">
          {userId && (
            <button
              onClick={handleToggle}
              className={`text-xs px-2 py-1 rounded-full transition-colors ${
                onlyMine
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {onlyMine ? 'Meine' : 'Alle'}
            </button>
          )}
          <Link href="/aufgaben" className="text-sm text-blue-600 hover:text-blue-500">
            Alle →
          </Link>
        </div>
      </div>
      {paged.length === 0 ? (
        <p className="text-sm text-gray-500">Keine anstehenden Aufgaben.</p>
      ) : (
        <div className="space-y-2">
          {paged.map((task) => (
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
      {totalPages > 1 && (
        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 0}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-default"
          >
            <ChevronLeft size={14} /> Zurück
          </button>
          <span className="text-xs text-gray-400">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages - 1}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-default"
          >
            Weiter <ChevronRight size={14} />
          </button>
        </div>
      )}
    </Card>
  )
}
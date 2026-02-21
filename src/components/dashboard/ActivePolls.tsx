'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { formatRelative } from '@/lib/utils'
import type { Poll } from '@/lib/types/database'

const PAGE_SIZE = 5

export default function ActivePolls({ polls }: { polls: Poll[] }) {
  const [page, setPage] = useState(0)
  const active = polls.filter((p) => p.status === 'aktiv')
  const totalPages = Math.ceil(active.length / PAGE_SIZE)
  const paged = active.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  if (active.length === 0) {
    return (
      <Card>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Abstimmungen</h2>
        <p className="text-sm text-gray-500">Keine offenen Abstimmungen.</p>
      </Card>
    )
  }

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Abstimmungen</h2>
        <Link href="/abstimmungen" className="text-sm text-blue-600 hover:text-blue-500">
          Alle anzeigen
        </Link>
      </div>
      <div className="space-y-2">
        {paged.map((poll) => (
          <Link
            key={poll.id}
            href={`/abstimmungen/${poll.id}`}
            className="flex items-center justify-between rounded-md p-2 text-sm hover:bg-gray-50"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-gray-900 line-clamp-1">{poll.title}</span>
              <Badge className="bg-blue-50 text-blue-700 text-[10px] flex-shrink-0">
                {poll.poll_type === 'date_poll' ? 'Termin' : 'Entscheidung'}
              </Badge>
            </div>
            <div className="flex items-center gap-2 ml-2 flex-shrink-0">
              {poll.voted_by_me ? (
                <CheckCircle2 size={14} className="text-green-500" />
              ) : (
                <Badge className="bg-orange-100 text-orange-700 text-[10px]">Ausstehend</Badge>
              )}
              <span className="text-xs text-gray-400">{formatRelative(poll.created_at)}</span>
            </div>
          </Link>
        ))}
      </div>
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
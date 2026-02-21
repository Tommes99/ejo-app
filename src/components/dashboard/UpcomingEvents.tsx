'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Card from '@/components/ui/Card'
import { formatDate } from '@/lib/utils'
import type { CalendarEvent } from '@/lib/types/database'

const PAGE_SIZE = 5

export default function UpcomingEvents({ events }: { events: CalendarEvent[] }) {
  const [page, setPage] = useState(0)
  const today = new Date().toISOString().split('T')[0]
  const upcoming = events
    .filter((e) => e.end_date >= today)
    .sort((a, b) => (a.start_date > b.start_date ? 1 : -1))

  const totalPages = Math.ceil(upcoming.length / PAGE_SIZE)
  const paged = upcoming.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Nächste Events</h2>
        <Link href="/kalender" className="text-sm text-blue-600 hover:text-blue-500">
          Kalender
        </Link>
      </div>
      {paged.length === 0 ? (
        <p className="text-sm text-gray-500">Keine anstehenden Events.</p>
      ) : (
        <div className="space-y-2">
          {paged.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between rounded-md p-2 text-sm hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: event.color }}
                />
                <span className="text-gray-900 line-clamp-1">{event.title}</span>
              </div>
              <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                {formatDate(event.start_date)}
                {event.end_date !== event.start_date && ` – ${formatDate(event.end_date)}`}
              </span>
            </div>
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
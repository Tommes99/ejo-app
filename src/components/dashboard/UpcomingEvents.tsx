import Link from 'next/link'
import Card from '@/components/ui/Card'
import { formatDate } from '@/lib/utils'
import type { CalendarEvent } from '@/lib/types/database'

export default function UpcomingEvents({ events }: { events: CalendarEvent[] }) {
  const today = new Date().toISOString().split('T')[0]
  const upcoming = events
    .filter((e) => e.end_date >= today)
    .sort((a, b) => (a.start_date > b.start_date ? 1 : -1))
    .slice(0, 5)

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Nächste Events</h2>
        <Link href="/kalender" className="text-sm text-blue-600 hover:text-blue-500">
          Kalender
        </Link>
      </div>
      {upcoming.length === 0 ? (
        <p className="text-sm text-gray-500">Keine anstehenden Events.</p>
      ) : (
        <div className="space-y-2">
          {upcoming.map((event) => (
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
    </Card>
  )
}

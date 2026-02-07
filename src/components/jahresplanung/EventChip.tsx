import type { CalendarEvent } from '@/lib/types/database'

export default function EventChip({
  event,
  onClick,
}: {
  event: CalendarEvent
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full truncate rounded px-1.5 py-0.5 text-left text-[10px] font-medium text-white transition-opacity hover:opacity-80"
      style={{ backgroundColor: event.color }}
      title={event.title}
    >
      {event.title}
    </button>
  )
}

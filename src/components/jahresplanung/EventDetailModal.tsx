'use client'

import { useEffect, useState } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { CalendarEvent, Profile } from '@/lib/types/database'

export default function EventDetailModal({
  event,
  open,
  onClose,
  onEdit,
  onDelete,
}: {
  event: CalendarEvent | null
  open: boolean
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const [responsibles, setResponsibles] = useState<Profile[]>([])

  useEffect(() => {
    if (!event) return
    async function fetchResponsibles() {
      const supabase = createClient()
      const { data } = await supabase
        .from('event_responsibles')
        .select('user_id, profiles(*)')
        .eq('event_id', event!.id)
      setResponsibles(
        (data || [])
          .map((r) => r.profiles as unknown as Profile)
          .filter(Boolean)
      )
    }
    fetchResponsibles()
  }, [event])

  if (!event) return null

  return (
    <Modal open={open} onClose={onClose} title={event.title}>
      <div className="space-y-3">
        <div>
          <span className="text-xs font-medium text-gray-500">Datum</span>
          <p className="text-sm">
            {formatDate(event.start_date)}
            {event.end_date !== event.start_date && ` – ${formatDate(event.end_date)}`}
          </p>
        </div>

        {event.description && (
          <div>
            <span className="text-xs font-medium text-gray-500">Beschreibung</span>
            <p className="text-sm">{event.description}</p>
          </div>
        )}

        {event.notes && (
          <div>
            <span className="text-xs font-medium text-gray-500">Notizen</span>
            <p className="text-sm whitespace-pre-wrap">{event.notes}</p>
          </div>
        )}

        {responsibles.length > 0 && (
          <div>
            <span className="text-xs font-medium text-gray-500">Verantwortliche</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {responsibles.map((p) => (
                <span
                  key={p.id}
                  className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800"
                >
                  {p.full_name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button onClick={onEdit}>Bearbeiten</Button>
          <Button variant="danger" onClick={onDelete}>
            Löschen
          </Button>
        </div>
      </div>
    </Modal>
  )
}

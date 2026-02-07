'use client'

import { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import { Calendar, dayjsLocalizer, type View, type SlotInfo, type ToolbarProps } from 'react-big-calendar'
import withDragAndDrop, {
  type EventInteractionArgs,
} from 'react-big-calendar/lib/addons/dragAndDrop'
import dayjs from 'dayjs'
import 'dayjs/locale/de'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import TaskStatusBadge from '@/components/aufgaben/TaskStatusBadge'
import EventForm from '@/components/jahresplanung/EventForm'
import { formatDate } from '@/lib/utils'
import type { Task, CalendarEvent, EventTemplate, Profile } from '@/lib/types/database'

dayjs.locale('de')
const localizer = dayjsLocalizer(dayjs)

type CalendarEntry = {
  id: string
  title: string
  start: Date
  end: Date
  allDay: boolean
  type: 'task' | 'event'
  color: string
  original: Task | CalendarEvent
}

const DnDCalendar = withDragAndDrop<CalendarEntry>(Calendar)

const messages = {
  today: 'Heute',
  previous: '',
  next: '',
  month: 'Monat',
  week: 'Woche',
  day: 'Tag',
  agenda: 'Agenda',
  date: 'Datum',
  time: 'Uhrzeit',
  event: 'Termin',
  noEventsInRange: 'Keine Termine in diesem Zeitraum.',
  showMore: (total: number) => `+${total} weitere`,
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Parse YYYY-MM-DD as local date (not UTC) to avoid timezone off-by-one
function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// Custom toolbar with arrow icons and no view buttons (managed by parent)
function CustomToolbar({ label, onNavigate }: ToolbarProps<CalendarEntry>) {
  return (
    <div className="rbc-toolbar">
      <span className="rbc-btn-group">
        <button type="button" onClick={() => onNavigate('PREV')}>
          <ChevronLeft size={16} />
        </button>
        <button type="button" onClick={() => onNavigate('TODAY')}>
          Heute
        </button>
        <button type="button" onClick={() => onNavigate('NEXT')}>
          <ChevronRight size={16} />
        </button>
      </span>
      <span className="rbc-toolbar-label">{label}</span>
      <span className="rbc-btn-group" />
    </div>
  )
}

export default function CalendarViewComponent({
  tasks,
  events,
  templates,
  profiles,
  onCreateEvent,
  onUpdateEvent,
  onDeleteEvent,
  initialView = 'month',
  onViewChange,
}: {
  tasks: Task[]
  events: CalendarEvent[]
  templates: EventTemplate[]
  profiles: Profile[]
  onCreateEvent: (data: {
    title: string
    description: string
    start_date: string
    end_date: string
    color: string
    notes: string
    template_id: string | null
    responsible_user_ids: string[]
  }) => Promise<unknown>
  onUpdateEvent: (
    id: string,
    updates: Partial<CalendarEvent>
  ) => Promise<unknown>
  onDeleteEvent: (id: string) => Promise<unknown>
  initialView?: 'month' | 'week'
  onViewChange?: (view: 'month' | 'week') => void
}) {
  const [view, setView] = useState<View>(initialView)
  const [date, setDate] = useState(new Date())

  useEffect(() => {
    setView(initialView)
  }, [initialView])
  const [selectedTask, setSelectedTask] = useState<CalendarEntry | null>(null)

  // Event form (create + edit)
  const [formOpen, setFormOpen] = useState(false)
  const [formInitialStart, setFormInitialStart] = useState('')
  const [formInitialEnd, setFormInitialEnd] = useState('')
  const [formKey, setFormKey] = useState(0)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)

  // Prevent onSelectSlot from firing when clicking an event
  const eventClickedRef = useRef(false)

  function handleViewChange(newView: View) {
    setView(newView)
    if (onViewChange && (newView === 'month' || newView === 'week')) {
      onViewChange(newView)
    }
  }

  const calendarEntries = useMemo<CalendarEntry[]>(() => {
    const taskEntries: CalendarEntry[] = tasks
      .filter((t) => t.deadline)
      .map((t) => ({
        id: t.id,
        title: t.title,
        start: parseLocalDate(t.deadline!),
        end: parseLocalDate(t.deadline!),
        allDay: true,
        type: 'task' as const,
        color: t.project?.color || '#6B7280',
        original: t,
      }))

    const eventEntries: CalendarEntry[] = events.map((e) => {
      // react-big-calendar uses exclusive end dates for allDay events
      // Add 1 day to end_date so multi-day events render as continuous bars
      const endDisplay = parseLocalDate(e.end_date)
      endDisplay.setDate(endDisplay.getDate() + 1)

      return {
        id: e.id,
        title: e.title,
        start: parseLocalDate(e.start_date),
        end: endDisplay,
        allDay: true,
        type: 'event' as const,
        color: e.color,
        original: e,
      }
    })

    return [...taskEntries, ...eventEntries]
  }, [tasks, events])

  const eventPropGetter = useCallback((entry: CalendarEntry) => ({
    style: {
      backgroundColor: entry.color,
      borderColor: entry.color,
      borderRadius: '4px',
      opacity: 0.9,
      cursor: 'pointer',
      fontSize: '13px',
    },
  }), [])

  // Click/drag on empty slot -> create event with pre-selected date range
  function handleSelectSlot(slotInfo: SlotInfo) {
    // Prevent opening create form when an event was clicked
    if (eventClickedRef.current) return
    const start = toDateStr(slotInfo.start)
    // In month view, end is exclusive (next day after selection)
    const endDate = new Date(slotInfo.end)
    endDate.setDate(endDate.getDate() - 1)
    const end = toDateStr(endDate.getTime() < slotInfo.start.getTime() ? slotInfo.start : endDate)
    setFormInitialStart(start)
    setFormInitialEnd(end)
    setEditingEvent(null)
    setFormKey((k) => k + 1)
    setFormOpen(true)
  }

  // Drag-and-drop move or resize an event
  function handleEventDropOrResize({ event, start, end }: EventInteractionArgs<CalendarEntry>) {
    if (event.type !== 'event') return
    const startDate = toDateStr(start as Date)
    // react-big-calendar gives exclusive end for allDay, subtract 1 day
    const endRaw = new Date(end as Date)
    endRaw.setDate(endRaw.getDate() - 1)
    const endDate = toDateStr(endRaw.getTime() < (start as Date).getTime() ? (start as Date) : endRaw)
    onUpdateEvent(event.id, { start_date: startDate, end_date: endDate })
  }

  // Click on event -> edit form for events, detail modal for tasks
  function handleSelectEvent(entry: CalendarEntry) {
    eventClickedRef.current = true
    setTimeout(() => { eventClickedRef.current = false }, 0)

    if (entry.type === 'task') {
      setSelectedTask(entry)
    } else {
      setEditingEvent(entry.original as CalendarEvent)
      setFormKey((k) => k + 1)
      setFormOpen(true)
    }
  }

  return (
    <>
      <div style={{ height: 'calc(100vh - 180px)', minHeight: 500 }}>
        <DnDCalendar
          localizer={localizer}
          events={calendarEntries}
          view={view}
          onView={handleViewChange}
          date={date}
          onNavigate={setDate}
          views={['month', 'week']}
          messages={messages}
          eventPropGetter={eventPropGetter}
          onSelectEvent={handleSelectEvent}
          selectable
          onSelectSlot={handleSelectSlot}
          onEventDrop={handleEventDropOrResize}
          onEventResize={handleEventDropOrResize}
          resizable
          draggableAccessor={(entry) => entry.type === 'event'}
          popup
          style={{ height: '100%' }}
          components={{ toolbar: CustomToolbar }}
        />
      </div>

      {/* Task detail modal */}
      {selectedTask && (() => {
        const task = selectedTask.original as Task
        return (
          <Modal
            open={!!selectedTask}
            onClose={() => setSelectedTask(null)}
            title={selectedTask.title}
          >
            <div className="space-y-3">
              <div className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                Aufgabe
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500">Status</span>
                <div className="mt-0.5">
                  <TaskStatusBadge status={task.status} />
                </div>
              </div>
              {task.deadline && (
                <div>
                  <span className="text-xs font-medium text-gray-500">Fällig am</span>
                  <p className="text-sm">{formatDate(task.deadline)}</p>
                </div>
              )}
              <Link href={`/aufgaben/${selectedTask.id}`}>
                <Button>Details anzeigen</Button>
              </Link>
            </div>
          </Modal>
        )
      })()}

      {/* Event form (create + edit) */}
      {formOpen && (
        <EventForm
          key={formKey}
          open={formOpen}
          onClose={() => { setFormOpen(false); setEditingEvent(null) }}
          event={editingEvent}
          templates={templates}
          profiles={profiles}
          initialDate={formInitialStart}
          initialEndDate={formInitialEnd}
          onSubmit={async (data) => {
            if (editingEvent) {
              await onUpdateEvent(editingEvent.id, data)
            } else {
              await onCreateEvent(data)
            }
          }}
          onDelete={editingEvent ? async () => { await onDeleteEvent(editingEvent.id) } : undefined}
        />
      )}
    </>
  )
}

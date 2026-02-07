'use client'

import { useState, useMemo, Fragment } from 'react'
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'
import EventChip from './EventChip'
import EventDetailModal from './EventDetailModal'
import EventForm from './EventForm'
import Button from '@/components/ui/Button'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { isValidDay } from '@/lib/utils'
import { useEvents, useEventTemplates } from '@/lib/hooks/useEvents'
import { useProfiles } from '@/lib/hooks/useUser'
import type { CalendarEvent } from '@/lib/types/database'

const MONTHS = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1)
const WEEKDAY_LABELS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']

// Parse YYYY-MM-DD as local date (not UTC) to avoid timezone off-by-one
function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function YearGrid() {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)
  const { events, createEvent, updateEvent, deleteEvent } = useEvents()
  const { templates } = useEventTemplates()
  const { profiles } = useProfiles()

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [newEventDate, setNewEventDate] = useState('')

  // Pre-compute weekday for each cell
  const weekdayMap = useMemo(() => {
    const map: Record<string, string> = {}
    for (let m = 0; m < 12; m++) {
      const daysInMonth = new Date(year, m + 1, 0).getDate()
      for (let d = 1; d <= daysInMonth; d++) {
        const dow = new Date(year, m, d).getDay()
        map[`${m + 1}-${d}`] = WEEKDAY_LABELS[dow]
      }
    }
    return map
  }, [year])

  // Map events to grid cells
  const eventsByCell = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {}
    events.forEach((event) => {
      const start = parseLocalDate(event.start_date)
      const end = parseLocalDate(event.end_date)

      const date = new Date(start)
      while (date <= end) {
        if (date.getFullYear() === year) {
          const key = `${date.getMonth() + 1}-${date.getDate()}`
          if (!map[key]) map[key] = []
          if (!map[key].find((e) => e.id === event.id)) {
            map[key].push(event)
          }
        }
        date.setDate(date.getDate() + 1)
      }
    })
    return map
  }, [events, year])

  function handleCellClick(month: number, day: number) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    setNewEventDate(dateStr)
    setEditingEvent(null)
    setFormOpen(true)
  }

  function handleEventClick(event: CalendarEvent) {
    setSelectedEvent(event)
    setDetailOpen(true)
  }

  function handleEdit() {
    setDetailOpen(false)
    setEditingEvent(selectedEvent)
    setFormOpen(true)
  }

  async function handleDelete() {
    if (selectedEvent) {
      await deleteEvent(selectedEvent.id)
      setDetailOpen(false)
      setSelectedEvent(null)
    }
  }

  function handleDragEnd(result: DropResult) {
    if (!result.destination) return
    const eventId = result.draggableId
    const [monthStr, dayStr] = result.destination.droppableId.split('-')
    const month = parseInt(monthStr)
    const day = parseInt(dayStr)
    const newDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

    const event = events.find((e) => e.id === eventId)
    if (!event) return

    const daysDiff =
      Math.round(
        (parseLocalDate(event.end_date).getTime() - parseLocalDate(event.start_date).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    const newEnd = parseLocalDate(newDate)
    newEnd.setDate(newEnd.getDate() + daysDiff)
    const endStr = toDateStr(newEnd)

    updateEvent(eventId, { start_date: newDate, end_date: endStr })
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setYear((y) => y - 1)}
            className="rounded p-1 hover:bg-gray-100"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="min-w-[3rem] text-center text-lg font-bold">{year}</span>
          <button
            onClick={() => setYear((y) => y + 1)}
            className="rounded p-1 hover:bg-gray-100"
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={() => setYear(currentYear)}
            className="ml-2 rounded-md px-2.5 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Heute
          </button>
        </div>
        <Button
          onClick={() => {
            setNewEventDate('')
            setEditingEvent(null)
            setFormOpen(true)
          }}
        >
          <Plus size={16} /> Neues Event
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <div
            className="grid"
            style={{
              gridTemplateColumns: '48px repeat(12, minmax(100px, 1fr))',
            }}
          >
            {/* Header row */}
            <div className="sticky left-0 z-10 border-b border-r border-gray-200 bg-gray-100 p-1" />
            {MONTHS.map((month) => (
              <div
                key={month}
                className="border-b border-r border-gray-200 bg-gray-100 p-1 text-center text-xs font-semibold text-gray-700"
              >
                {month}
              </div>
            ))}

            {/* Day rows */}
            {DAYS.map((day) => (
              <Fragment key={`row-${day}`}>
                <div
                  className="sticky left-0 z-10 border-b border-r border-gray-200 bg-gray-50 p-1 text-center text-xs font-medium text-gray-600"
                >
                  {day}
                </div>
                {MONTHS.map((_, monthIdx) => {
                  const month = monthIdx + 1
                  const valid = isValidDay(month, day, year)
                  const cellKey = `${month}-${day}`
                  const cellEvents = eventsByCell[cellKey] || []
                  const weekday = weekdayMap[cellKey]
                  const isWeekend = weekday === 'Sa' || weekday === 'So'

                  if (!valid) {
                    return (
                      <div
                        key={`${month}-${day}`}
                        className="border-b border-r border-gray-100 bg-gray-100"
                      />
                    )
                  }

                  return (
                    <Droppable key={`${month}-${day}`} droppableId={cellKey}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          onDoubleClick={() => handleCellClick(month, day)}
                          className={`relative min-h-[28px] cursor-pointer border-b border-r border-gray-100 p-0.5 transition-colors ${
                            snapshot.isDraggingOver
                              ? 'bg-blue-50'
                              : isWeekend
                                ? 'bg-gray-50/80'
                                : 'hover:bg-gray-50'
                          }`}
                        >
                          <span className={`absolute right-0.5 top-0 text-[9px] leading-tight ${
                            isWeekend ? 'font-medium text-red-400' : 'text-gray-300'
                          }`}>
                            {weekday}
                          </span>
                          <div className="flex flex-wrap gap-0.5">
                            {cellEvents.map((event, idx) => (
                              <Draggable key={event.id} draggableId={event.id} index={idx}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={cellEvents.length > 1 ? 'flex-1 min-w-0' : 'w-full'}
                                  >
                                    <EventChip
                                      event={event}
                                      onClick={() => handleEventClick(event)}
                                    />
                                  </div>
                                )}
                              </Draggable>
                            ))}
                          </div>
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  )
                })}
              </Fragment>
            ))}
          </div>
        </div>
      </DragDropContext>

      <EventDetailModal
        event={selectedEvent}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <EventForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingEvent(null)
        }}
        event={editingEvent}
        templates={templates}
        profiles={profiles}
        initialDate={newEventDate}
        onSubmit={async (data) => {
          if (editingEvent) {
            await updateEvent(editingEvent.id, data)
          } else {
            await createEvent(data)
          }
        }}
      />
    </div>
  )
}

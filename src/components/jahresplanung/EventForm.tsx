'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { createClient } from '@/lib/supabase/client'
import type { CalendarEvent, EventTemplate, Profile } from '@/lib/types/database'

export default function EventForm({
  open,
  onClose,
  event,
  templates,
  profiles,
  initialDate,
  initialEndDate,
  onSubmit,
  onDelete,
}: {
  open: boolean
  onClose: () => void
  event?: CalendarEvent | null
  templates: EventTemplate[]
  profiles: Profile[]
  initialDate?: string
  initialEndDate?: string
  onSubmit: (data: {
    title: string
    description: string
    start_date: string
    end_date: string
    color: string
    notes: string
    template_id: string | null
    responsible_user_ids: string[]
  }) => Promise<void>
  onDelete?: () => Promise<void>
}) {
  const [title, setTitle] = useState(event?.title || '')
  const [description, setDescription] = useState(event?.description || '')
  const [startDate, setStartDate] = useState(event?.start_date || initialDate || '')
  const [endDate, setEndDate] = useState(event?.end_date || initialEndDate || initialDate || '')
  const [color, setColor] = useState(event?.color || '#10B981')
  const [notes, setNotes] = useState(event?.notes || '')
  const [templateId, setTemplateId] = useState(event?.template_id || '')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Load existing responsible users when editing an event
  useEffect(() => {
    if (!event) return
    async function loadResponsibles() {
      const supabase = createClient()
      const { data } = await supabase
        .from('event_responsibles')
        .select('user_id')
        .eq('event_id', event!.id)
      if (data) {
        setSelectedUsers(data.map((r) => r.user_id))
      }
    }
    loadResponsibles()
  }, [event])

  function handleTemplateChange(id: string) {
    setTemplateId(id)
    const template = templates.find((t) => t.id === id)
    if (template) {
      setTitle(template.default_title)
      setDescription(template.default_description || '')
      setColor(template.default_color)
    }
  }

  function toggleUser(userId: string) {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await onSubmit({
      title,
      description,
      start_date: startDate,
      end_date: endDate || startDate,
      color,
      notes,
      template_id: templateId || null,
      responsible_user_ids: selectedUsers,
    })
    setLoading(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={event ? 'Event bearbeiten' : 'Neues Event'}>
      <form onSubmit={handleSubmit} className="space-y-3">
        {templates.length > 0 && (
          <Select
            id="template"
            label="Vorlage"
            value={templateId}
            onChange={(e) => handleTemplateChange(e.target.value)}
            placeholder="Keine Vorlage"
            options={templates.map((t) => ({ value: t.id, label: t.name }))}
          />
        )}

        <Input
          id="title"
          label="Titel"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div>
          <label htmlFor="eventDesc" className="mb-1 block text-sm font-medium text-gray-700">
            Beschreibung
          </label>
          <textarea
            id="eventDesc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            id="startDate"
            label="Startdatum"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
          <Input
            id="endDate"
            label="Enddatum"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="color" className="mb-1 block text-sm font-medium text-gray-700">
            Farbe
          </label>
          <input
            id="color"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-8 w-16 cursor-pointer rounded border border-gray-300"
          />
        </div>

        <div>
          <label htmlFor="notes" className="mb-1 block text-sm font-medium text-gray-700">
            Notizen
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {profiles.length > 0 && (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Verantwortliche</label>
            <div className="flex flex-wrap gap-2">
              {profiles.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggleUser(p.id)}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                    selectedUsers.includes(p.id)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {p.full_name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 pt-2">
          <Button type="submit" disabled={loading || !title.trim() || !startDate}>
            {loading ? 'Wird gespeichert...' : 'Speichern'}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Abbrechen
          </Button>
          {event && onDelete && (
            <div className="ml-auto">
              {showDeleteConfirm ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-red-600">Löschen?</span>
                  <Button type="button" variant="danger" size="sm" onClick={async () => { await onDelete(); onClose() }}>Ja</Button>
                  <Button type="button" variant="secondary" size="sm" onClick={() => setShowDeleteConfirm(false)}>Nein</Button>
                </div>
              ) : (
                <Button type="button" variant="danger" onClick={() => setShowDeleteConfirm(true)}>Löschen</Button>
              )}
            </div>
          )}
        </div>
      </form>
    </Modal>
  )
}

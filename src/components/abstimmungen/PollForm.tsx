'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { POLL_TYPE_OPTIONS } from '@/lib/constants'
import type { Profile, CalendarEvent, PollType } from '@/lib/types/database'

type OptionEntry = {
  label: string
  option_date: string
  option_time_start: string
  option_time_end: string
}

export default function PollForm({
  profiles,
  events,
  linkedEventId,
  onSubmit,
}: {
  profiles: Profile[]
  events: CalendarEvent[]
  linkedEventId?: string
  onSubmit: (data: {
    title: string
    description: string
    poll_type: PollType
    deadline: string | null
    allow_vote_change: boolean
    show_results_before_voting: boolean
    linked_event_id: string | null
    options: { label: string; option_date?: string | null; option_time_start?: string | null; option_time_end?: string | null }[]
    participant_user_ids: string[]
  }) => Promise<void>
}) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [pollType, setPollType] = useState<PollType>('decision_poll')
  const [deadline, setDeadline] = useState('')
  const [allowVoteChange, setAllowVoteChange] = useState(true)
  const [showResults, setShowResults] = useState(true)
  const [linkedEvent, setLinkedEvent] = useState(linkedEventId || '')
  const [options, setOptions] = useState<OptionEntry[]>([
    { label: '', option_date: '', option_time_start: '', option_time_end: '' },
    { label: '', option_date: '', option_time_start: '', option_time_end: '' },
  ])
  const [allUsers, setAllUsers] = useState(true)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function addOption() {
    setOptions((prev) => [...prev, { label: '', option_date: '', option_time_start: '', option_time_end: '' }])
  }

  function removeOption(index: number) {
    if (options.length <= 2) return
    setOptions((prev) => prev.filter((_, i) => i !== index))
  }

  function updateOption(index: number, field: keyof OptionEntry, value: string) {
    setOptions((prev) => prev.map((opt, i) => (i === index ? { ...opt, [field]: value } : opt)))
  }

  function toggleUser(userId: string) {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const validOptions = pollType === 'date_poll'
      ? options.filter((o) => o.option_date)
      : options.filter((o) => o.label.trim())

    if (validOptions.length < 2) {
      setError('Mindestens 2 Optionen sind erforderlich.')
      return
    }

    setLoading(true)
    try {
      await onSubmit({
        title,
        description,
        poll_type: pollType,
        deadline: deadline || null,
        allow_vote_change: allowVoteChange,
        show_results_before_voting: showResults,
        linked_event_id: linkedEvent || null,
        options: validOptions.map((o) => ({
          label: pollType === 'date_poll'
            ? `${o.option_date}${o.option_time_start ? ` ${o.option_time_start}` : ''}${o.option_time_end ? `–${o.option_time_end}` : ''}`
            : o.label,
          option_date: pollType === 'date_poll' ? o.option_date || null : null,
          option_time_start: pollType === 'date_poll' && o.option_time_start ? o.option_time_start : null,
          option_time_end: pollType === 'date_poll' && o.option_time_end ? o.option_time_end : null,
        })),
        participant_user_ids: allUsers ? [] : selectedUsers,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern.')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <Input
        id="title"
        label="Titel"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        placeholder="z.B. Termin Sommerlager oder Welches Logo?"
      />

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
          Beschreibung
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Optionale Beschreibung..."
        />
      </div>

      <Select
        id="pollType"
        label="Typ"
        value={pollType}
        onChange={(e) => setPollType(e.target.value as PollType)}
        options={POLL_TYPE_OPTIONS.map((t) => ({ value: t.value, label: t.label }))}
      />

      {/* Options */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {pollType === 'date_poll' ? 'Terminoptionen' : 'Optionen'}
        </label>
        <div className="space-y-2">
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              {pollType === 'date_poll' ? (
                <>
                  <input
                    type="date"
                    value={opt.option_date}
                    onChange={(e) => updateOption(i, 'option_date', e.target.value)}
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="time"
                    value={opt.option_time_start}
                    onChange={(e) => updateOption(i, 'option_time_start', e.target.value)}
                    className="w-24 rounded-md border border-gray-300 px-2 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Von"
                  />
                  <span className="text-gray-400">–</span>
                  <input
                    type="time"
                    value={opt.option_time_end}
                    onChange={(e) => updateOption(i, 'option_time_end', e.target.value)}
                    className="w-24 rounded-md border border-gray-300 px-2 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Bis"
                  />
                </>
              ) : (
                <input
                  type="text"
                  value={opt.label}
                  onChange={(e) => updateOption(i, 'label', e.target.value)}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder={`Option ${i + 1}`}
                  required
                />
              )}
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(i)}
                  className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addOption}
          className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-500"
        >
          <Plus size={14} /> Option hinzufügen
        </button>
      </div>

      {/* Participants */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Zielgruppe</label>
        <label className="mb-2 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={allUsers}
            onChange={(e) => setAllUsers(e.target.checked)}
            className="rounded border-gray-300"
          />
          <span className="text-gray-700">Alle Nutzer</span>
        </label>
        {!allUsers && profiles.length > 0 && (
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
        )}
      </div>

      {/* Settings */}
      <div className="space-y-2">
        <Input
          id="deadline"
          label="Frist (optional)"
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />

        {events.length > 0 && (
          <Select
            id="linkedEvent"
            label="Verknüpftes Event (optional)"
            value={linkedEvent}
            onChange={(e) => setLinkedEvent(e.target.value)}
            placeholder="Kein Event"
            options={events.map((ev) => ({ value: ev.id, label: ev.title }))}
          />
        )}

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={allowVoteChange}
            onChange={(e) => setAllowVoteChange(e.target.checked)}
            className="rounded border-gray-300"
          />
          <span className="text-gray-700">Stimme ändern erlauben</span>
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showResults}
            onChange={(e) => setShowResults(e.target.checked)}
            className="rounded border-gray-300"
          />
          <span className="text-gray-700">Ergebnisse vor Abstimmung anzeigen</span>
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading || !title.trim()}>
          {loading ? 'Wird erstellt...' : 'Abstimmung erstellen'}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Abbrechen
        </Button>
      </div>
    </form>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { TASK_STATUS_OPTIONS } from '@/lib/constants'
import type { Task, TaskStatus, Profile, Project } from '@/lib/types/database'

export default function TaskForm({
  task,
  profiles,
  projects,
  onSubmit,
  onDelete,
}: {
  task?: Task
  profiles: Profile[]
  projects: Project[]
  onSubmit: (data: {
    title: string
    description: string
    status: TaskStatus
    assigned_to: string | null
    project_id: string | null
    deadline: string | null
  }) => Promise<void>
  onDelete?: () => Promise<void>
}) {
  const router = useRouter()
  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [status, setStatus] = useState<TaskStatus>(task?.status || 'offen')
  const [assignedTo, setAssignedTo] = useState(task?.assigned_to || '')
  const [projectId, setProjectId] = useState(task?.project_id || '')
  const [deadline, setDeadline] = useState(task?.deadline || '')
  const [loading, setLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await onSubmit({
      title,
      description,
      status,
      assigned_to: assignedTo || null,
      project_id: projectId || null,
      deadline: deadline || null,
    })
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="title"
        label="Titel"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        placeholder="Aufgabentitel"
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
        id="status"
        label="Status"
        value={status}
        onChange={(e) => setStatus(e.target.value as TaskStatus)}
        options={TASK_STATUS_OPTIONS.map((s) => ({ value: s.value, label: s.label }))}
      />

      <Select
        id="assignedTo"
        label="Zugewiesen an"
        value={assignedTo}
        onChange={(e) => setAssignedTo(e.target.value)}
        placeholder="Nicht zugewiesen"
        options={profiles.map((p) => ({ value: p.id, label: p.full_name }))}
      />

      <Select
        id="projectId"
        label="Projekt"
        value={projectId}
        onChange={(e) => setProjectId(e.target.value)}
        placeholder="Kein Projekt"
        options={projects.map((p) => ({ value: p.id, label: p.name }))}
      />

      <Input
        id="deadline"
        label="Fällig am"
        type="date"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
      />

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={loading || !title.trim()}>
          {loading ? 'Wird gespeichert...' : task ? 'Speichern' : 'Erstellen'}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Abbrechen
        </Button>

        {task && onDelete && (
          <div className="ml-auto">
            {showDeleteConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-600">Wirklich löschen?</span>
                <Button type="button" variant="danger" size="sm" onClick={onDelete}>
                  Ja
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Nein
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="danger"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Löschen
              </Button>
            )}
          </div>
        )}
      </div>
    </form>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { PROJECT_COLORS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Project } from '@/lib/types/database'

export default function ProjectForm({
  project,
  onSubmit,
  onDelete,
}: {
  project?: Project
  onSubmit: (data: { name: string; description: string; color: string }) => Promise<void>
  onDelete?: () => Promise<void>
}) {
  const router = useRouter()
  const [name, setName] = useState(project?.name || '')
  const [description, setDescription] = useState(project?.description || '')
  const [color, setColor] = useState(project?.color || PROJECT_COLORS[0])
  const [loading, setLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await onSubmit({ name, description, color })
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="name"
        label="Projektname"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        placeholder="z.B. Sommerlager 2026"
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

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Farbe</label>
        <div className="flex flex-wrap gap-2">
          {PROJECT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={cn(
                'h-8 w-8 rounded-full border-2 transition-transform',
                color === c ? 'scale-110 border-gray-900' : 'border-transparent'
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={loading || !name.trim()}>
          {loading ? 'Wird gespeichert...' : project ? 'Speichern' : 'Erstellen'}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Abbrechen
        </Button>

        {project && onDelete && (
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
              <Button type="button" variant="danger" onClick={() => setShowDeleteConfirm(true)}>
                Löschen
              </Button>
            )}
          </div>
        )}
      </div>
    </form>
  )
}

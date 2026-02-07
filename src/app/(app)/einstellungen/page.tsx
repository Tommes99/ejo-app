'use client'

import { useState } from 'react'
import { Plus, Trash2, Pencil } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import Modal from '@/components/ui/Modal'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import EmptyState from '@/components/ui/EmptyState'
import Tabs from '@/components/ui/Tabs'
import { useEventTemplates } from '@/lib/hooks/useEvents'
import { useProfiles } from '@/lib/hooks/useUser'
import type { EventTemplate } from '@/lib/types/database'

type SettingsTab = 'vorlagen' | 'benutzer'

export default function EinstellungenPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('vorlagen')

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Einstellungen</h1>

      <Tabs
        tabs={[
          { value: 'vorlagen' as SettingsTab, label: 'Event-Vorlagen' },
          { value: 'benutzer' as SettingsTab, label: 'Benutzer' },
        ]}
        active={activeTab}
        onChange={setActiveTab}
      />

      <div className="mt-6">
        {activeTab === 'vorlagen' && <TemplateSection />}
        {activeTab === 'benutzer' && <UserSection />}
      </div>
    </div>
  )
}

function TemplateSection() {
  const { templates, loading, createTemplate, updateTemplate, deleteTemplate } =
    useEventTemplates()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<EventTemplate | null>(null)
  const [name, setName] = useState('')
  const [defaultTitle, setDefaultTitle] = useState('')
  const [defaultColor, setDefaultColor] = useState('#3B82F6')
  const [defaultDescription, setDefaultDescription] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  function openCreate() {
    setEditing(null)
    setName('')
    setDefaultTitle('')
    setDefaultColor('#3B82F6')
    setDefaultDescription('')
    setFormOpen(true)
  }

  function openEdit(template: EventTemplate) {
    setEditing(template)
    setName(template.name)
    setDefaultTitle(template.default_title)
    setDefaultColor(template.default_color)
    setDefaultDescription(template.default_description || '')
    setFormOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormLoading(true)
    const data = {
      name,
      default_title: defaultTitle || name,
      default_color: defaultColor,
      default_description: defaultDescription || undefined,
    }
    if (editing) {
      await updateTemplate(editing.id, data)
    } else {
      await createTemplate(data)
    }
    setFormLoading(false)
    setFormOpen(false)
  }

  async function handleDelete(id: string) {
    await deleteTemplate(id)
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Event-Vorlagen</h2>
        <Button onClick={openCreate}>
          <Plus size={16} /> Neue Vorlage
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : templates.length === 0 ? (
        <EmptyState
          message="Noch keine Vorlagen vorhanden."
          action={<Button onClick={openCreate}>Erste Vorlage erstellen</Button>}
        />
      ) : (
        <div className="space-y-2">
          {templates.map((template) => (
            <Card key={template.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: template.default_color }}
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">{template.name}</p>
                  <p className="text-xs text-gray-500">
                    Titel: {template.default_title}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => openEdit(template)}
                  className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  title="Bearbeiten"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => handleDelete(template.id)}
                  className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                  title="Löschen"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Vorlage bearbeiten' : 'Neue Vorlage'}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            id="templateName"
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="z.B. Mitarbeiterkreis"
          />
          <Input
            id="templateTitle"
            label="Standard-Titel"
            value={defaultTitle}
            onChange={(e) => setDefaultTitle(e.target.value)}
            placeholder="Wird beim Erstellen vorausgefüllt"
          />
          <div>
            <label htmlFor="templateDesc" className="mb-1 block text-sm font-medium text-gray-700">
              Standard-Beschreibung
            </label>
            <textarea
              id="templateDesc"
              value={defaultDescription}
              onChange={(e) => setDefaultDescription(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="templateColor" className="mb-1 block text-sm font-medium text-gray-700">
              Farbe
            </label>
            <input
              id="templateColor"
              type="color"
              value={defaultColor}
              onChange={(e) => setDefaultColor(e.target.value)}
              className="h-8 w-16 cursor-pointer rounded border border-gray-300"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={formLoading || !name.trim()}>
              {formLoading ? 'Wird gespeichert...' : 'Speichern'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setFormOpen(false)}>
              Abbrechen
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  )
}

function UserSection() {
  const { profiles, loading } = useProfiles()

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Registrierte Benutzer</h2>
        <p className="text-sm text-gray-500">
          Alle in der Plattform registrierten Benutzer und ihre E-Mail-Adressen.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : profiles.length === 0 ? (
        <EmptyState message="Noch keine Benutzer registriert." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  E-Mail
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Registriert am
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {profiles.map((profile) => (
                <tr key={profile.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">
                        {profile.full_name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </div>
                      {profile.full_name}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                    {profile.email}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                    {profile.created_at
                      ? new Date(profile.created_at).toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })
                      : '–'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

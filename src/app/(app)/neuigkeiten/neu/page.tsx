'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useNews } from '@/lib/hooks/useNews'

export default function NeueNeuigkeitPage() {
  const router = useRouter()
  const { createNews } = useNews()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [pinned, setPinned] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await createNews({ title, content, pinned })
    setLoading(false)
    router.push('/neuigkeiten')
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Neue Neuigkeit</h1>
      <div className="mx-auto max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="title"
            label="Titel"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Titel der Neuigkeit"
          />

          <div>
            <label htmlFor="content" className="mb-1 block text-sm font-medium text-gray-700">
              Inhalt
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={6}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Was gibt es Neues?"
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-gray-700">Anheften (wird oben angezeigt)</span>
          </label>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading || !title.trim() || !content.trim()}>
              {loading ? 'Wird veröffentlicht...' : 'Veröffentlichen'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Abbrechen
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

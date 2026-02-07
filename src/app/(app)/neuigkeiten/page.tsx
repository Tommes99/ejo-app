'use client'

import Link from 'next/link'
import { Plus, Pin, Trash2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { formatRelative } from '@/lib/utils'
import { useNews } from '@/lib/hooks/useNews'

export default function NeuigkeitenPage() {
  const { news, loading, deleteNews } = useNews()

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Neuigkeiten</h1>
        <Link href="/neuigkeiten/neu">
          <Button>
            <Plus size={16} /> Neue Neuigkeit
          </Button>
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : news.length === 0 ? (
        <EmptyState
          message="Noch keine Neuigkeiten vorhanden."
          action={
            <Link href="/neuigkeiten/neu">
              <Button>Erste Neuigkeit erstellen</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {news.map((post) => (
            <Card key={post.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {post.pinned && <Pin size={14} className="text-blue-500" />}
                    <h2 className="text-lg font-semibold text-gray-900">{post.title}</h2>
                  </div>
                  <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{post.content}</p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                    {post.author && <span>{post.author.full_name}</span>}
                    <span>{formatRelative(post.created_at)}</span>
                  </div>
                </div>
                <button
                  onClick={() => deleteNews(post.id)}
                  className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                  title="Löschen"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

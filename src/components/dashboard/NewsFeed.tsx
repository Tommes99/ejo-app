'use client'

import Link from 'next/link'
import { Pin } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { formatRelative } from '@/lib/utils'
import type { NewsPost } from '@/lib/types/database'

export default function NewsFeed({ news }: { news: NewsPost[] }) {
  if (news.length === 0) {
    return (
      <Card>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Neuigkeiten</h2>
        <p className="text-sm text-gray-500">Noch keine Neuigkeiten vorhanden.</p>
        <Link href="/neuigkeiten/neu" className="mt-3 inline-block">
          <Button size="sm">Erste Neuigkeit erstellen</Button>
        </Link>
      </Card>
    )
  }

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Neuigkeiten</h2>
        <Link href="/neuigkeiten/neu">
          <Button size="sm">Neu</Button>
        </Link>
      </div>
      <div className="space-y-3">
        {news.slice(0, 5).map((post) => (
          <div key={post.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
            <div className="flex items-start gap-2">
              {post.pinned && <Pin size={12} className="mt-1 text-blue-500" />}
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">{post.title}</h3>
                <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">{post.content}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                  {post.author && <span>{post.author.full_name}</span>}
                  <span>{formatRelative(post.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {news.length > 5 && (
        <Link href="/neuigkeiten" className="mt-3 block text-sm text-blue-600 hover:text-blue-500">
          Alle Neuigkeiten anzeigen
        </Link>
      )}
    </Card>
  )
}

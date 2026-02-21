'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Pin, ChevronLeft, ChevronRight } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { formatRelative } from '@/lib/utils'
import type { NewsPost } from '@/lib/types/database'

const PAGE_SIZE = 10

export default function NewsFeed({ news }: { news: NewsPost[] }) {
  const [page, setPage] = useState(0)
  const totalPages = Math.ceil(news.length / PAGE_SIZE)
  const paged = news.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

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
        {paged.map((post) => (
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
      {totalPages > 1 && (
        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 0}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-default"
          >
            <ChevronLeft size={14} /> Zurück
          </button>
          <span className="text-xs text-gray-400">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages - 1}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-default"
          >
            Weiter <ChevronRight size={14} />
          </button>
        </div>
      )}
    </Card>
  )
}
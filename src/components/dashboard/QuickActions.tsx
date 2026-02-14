import Link from 'next/link'
import { Plus, FolderOpen, CalendarDays, BarChart3 } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function QuickActions() {
  return (
    <div className="flex flex-wrap gap-3">
      <Link href="/aufgaben/neu">
        <Button>
          <Plus size={16} /> Neue Aufgabe
        </Button>
      </Link>
      <Link href="/projekte/neu">
        <Button variant="secondary">
          <FolderOpen size={16} /> Neues Projekt
        </Button>
      </Link>
      <Link href="/kalender">
        <Button variant="secondary">
          <CalendarDays size={16} /> Kalender
        </Button>
      </Link>
      <Link href="/abstimmungen/neu">
        <Button variant="secondary">
          <BarChart3 size={16} /> Neue Abstimmung
        </Button>
      </Link>
    </div>
  )
}

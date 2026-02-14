export const TASK_STATUS_OPTIONS = [
  { value: 'offen' as const, label: 'Offen', color: 'bg-gray-100 text-gray-800' },
  { value: 'in_bearbeitung' as const, label: 'In Bearbeitung', color: 'bg-blue-100 text-blue-800' },
  { value: 'erledigt' as const, label: 'Erledigt', color: 'bg-green-100 text-green-800' },
  { value: 'archiviert' as const, label: 'Archiviert', color: 'bg-slate-100 text-slate-500' },
]

export const NAV_ITEMS = [
  { href: '/dashboard', label: 'Startseite', icon: 'Home' as const },
  { href: '/kalender', label: 'Kalender', icon: 'CalendarDays' as const },
  { href: '/aufgaben', label: 'Aufgaben', icon: 'CheckSquare' as const },
  { href: '/projekte', label: 'Projekte', icon: 'FolderOpen' as const },
  { href: '/neuigkeiten', label: 'Neuigkeiten', icon: 'Newspaper' as const },
  { href: '/abstimmungen', label: 'Abstimmungen', icon: 'BarChart3' as const },
  { href: '/einstellungen', label: 'Einstellungen', icon: 'Settings' as const },
]

export const DEFAULT_EVENT_TEMPLATES = [
  { name: 'Mitarbeiterkreis', default_title: 'Mitarbeiterkreis', default_color: '#3B82F6' },
  { name: 'Zeltlager', default_title: 'Zeltlager', default_color: '#10B981' },
  { name: 'Aktion', default_title: 'Aktion', default_color: '#EF4444' },
  { name: 'Konfi-Arbeit', default_title: 'Konfi-Arbeit', default_color: '#8B5CF6' },
  { name: 'Elternabend', default_title: 'Elternabend', default_color: '#F59E0B' },
  { name: 'Gottesdienst', default_title: 'Gottesdienst', default_color: '#06B6D4' },
]

export const POLL_STATUS_OPTIONS = [
  { value: 'aktiv' as const, label: 'Aktiv', color: 'bg-green-100 text-green-800' },
  { value: 'geschlossen' as const, label: 'Geschlossen', color: 'bg-gray-100 text-gray-800' },
  { value: 'archiviert' as const, label: 'Archiviert', color: 'bg-slate-100 text-slate-500' },
]

export const POLL_TYPE_OPTIONS = [
  { value: 'date_poll' as const, label: 'Terminumfrage' },
  { value: 'decision_poll' as const, label: 'Entscheidungsumfrage' },
]

export const PROJECT_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316', '#84CC16', '#6366F1',
]

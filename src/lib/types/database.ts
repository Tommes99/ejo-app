export type Profile = {
  id: string
  full_name: string
  email: string
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export type Project = {
  id: string
  name: string
  description: string | null
  color: string
  created_by: string
  created_at: string
  updated_at: string
}

export type TaskStatus = 'offen' | 'in_bearbeitung' | 'erledigt' | 'archiviert'

export type Task = {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  assigned_to: string | null
  project_id: string | null
  deadline: string | null
  position: number
  created_by: string
  created_at: string
  updated_at: string
  // Joined fields
  assigned_profile?: Profile | null
  project?: Project | null
}

export type EventTemplate = {
  id: string
  name: string
  default_title: string
  default_description: string | null
  default_color: string
  created_at: string
}

export type CalendarEvent = {
  id: string
  title: string
  description: string | null
  start_date: string
  end_date: string
  all_day: boolean
  color: string
  notes: string | null
  template_id: string | null
  created_by: string
  created_at: string
  updated_at: string
  // Joined fields
  responsibles?: Profile[]
}

export type NewsPost = {
  id: string
  title: string
  content: string
  pinned: boolean
  author_id: string
  created_at: string
  updated_at: string
  // Joined fields
  author?: Profile | null
}

'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Users, UserPlus, X } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import ProjectForm from '@/components/projekte/ProjectForm'
import TaskList from '@/components/aufgaben/TaskList'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import EmptyState from '@/components/ui/EmptyState'
import { PROJECT_STATUS_OPTIONS } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'
import type { Project, Task, Profile } from '@/lib/types/database'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [members, setMembers] = useState<Profile[]>([])
  const [allProfiles, setAllProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [showAddMember, setShowAddMember] = useState(false)

  const fetchData = useCallback(async () => {
    const supabase = createClient()
    const [projectRes, tasksRes, membersRes, profilesRes] = await Promise.all([
      supabase.from('projects').select('*').eq('id', params.id).single(),
      supabase
        .from('tasks')
        .select('*, assigned_profile:profiles!tasks_assigned_to_fkey(*), project:projects(*)')
        .eq('project_id', params.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('project_members')
        .select('user_id, profiles(*)')
        .eq('project_id', params.id),
      supabase.from('profiles').select('*').order('full_name'),
    ])
    setProject(projectRes.data)
    setTasks(tasksRes.data || [])
    setMembers(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (membersRes.data || [])
        .map((m: any) => m.profiles)
        .filter((p: any): p is Profile => p !== null)
    )
    setAllProfiles(profilesRes.data || [])
    setLoading(false)
  }, [params.id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) return <LoadingSpinner />
  if (!project) return <p className="text-gray-500">Projekt nicht gefunden.</p>

  const statusOption = PROJECT_STATUS_OPTIONS.find((s) => s.value === project.status)

  async function handleStatusToggle() {
    const newStatus = project!.status === 'in_bearbeitung' ? 'archiviert' : 'in_bearbeitung'
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', project!.id)
        .select()
        .single()
      if (error) console.error('Status toggle error:', error.message)
      if (data) setProject(data)
    } catch (err) {
      console.error('Status toggle error:', err)
    }
  }

  async function handleAddMember(userId: string) {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('project_members')
        .insert({ project_id: project!.id, user_id: userId })
      if (!error) {
        const profile = allProfiles.find((p) => p.id === userId)
        if (profile) setMembers((prev) => [...prev, profile])
      } else {
        console.error('Add member error:', error.message)
      }
    } catch (err) {
      console.error('Add member error:', err)
    }
    setShowAddMember(false)
  }

  async function handleRemoveMember(userId: string) {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('project_id', project!.id)
        .eq('user_id', userId)
      if (!error) {
        setMembers((prev) => prev.filter((m) => m.id !== userId))
      } else {
        console.error('Remove member error:', error.message)
      }
    } catch (err) {
      console.error('Remove member error:', err)
    }
  }

  if (editing) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Projekt bearbeiten</h1>
        <div className="mx-auto max-w-2xl">
          <ProjectForm
            project={project}
            onSubmit={async (data) => {
              const supabase = createClient()
              const { data: updated, error } = await supabase
                .from('projects')
                .update(data)
                .eq('id', project.id)
                .select()
                .single()
              if (error) throw new Error(error.message)
              if (updated) setProject(updated)
              setEditing(false)
            }}
            onDelete={async () => {
              const supabase = createClient()
              const { error } = await supabase.from('projects').delete().eq('id', project.id)
              if (error) throw new Error(error.message)
              router.push('/projekte')
            }}
          />
        </div>
      </div>
    )
  }

  const availableProfiles = allProfiles.filter(
    (p) => !members.some((m) => m.id === p.id)
  )

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="h-4 w-4 rounded-full"
            style={{ backgroundColor: project.color }}
          />
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          {statusOption && (
            <Badge className={statusOption.color}>{statusOption.label}</Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={handleStatusToggle}>
            {project.status === 'in_bearbeitung' ? 'Archivieren' : 'Reaktivieren'}
          </Button>
          <Button variant="secondary" onClick={() => setEditing(true)}>
            Bearbeiten
          </Button>
          <Link href={`/aufgaben/neu?project=${project.id}`}>
            <Button>
              <Plus size={16} /> Aufgabe hinzufügen
            </Button>
          </Link>
        </div>
      </div>

      {/* Description */}
      {project.description && (
        <Card className="mb-6">
          <h2 className="mb-2 text-sm font-semibold text-gray-700">Beschreibung</h2>
          <p className="whitespace-pre-wrap text-sm text-gray-600">{project.description}</p>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Tasks - takes 2 cols */}
        <div className="md:col-span-2">
          <Card>
            <h2 className="mb-3 text-lg font-semibold text-gray-800">
              Aufgaben ({tasks.length})
            </h2>
            {tasks.length === 0 ? (
              <EmptyState message="Noch keine Aufgaben in diesem Projekt." />
            ) : (
              <TaskList tasks={tasks} />
            )}
          </Card>
        </div>

        {/* Members sidebar */}
        <div>
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <Users size={18} /> Mitglieder ({members.length})
              </h2>
              <button
                onClick={() => setShowAddMember(!showAddMember)}
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                title="Mitglied hinzufügen"
              >
                <UserPlus size={16} />
              </button>
            </div>

            {showAddMember && availableProfiles.length > 0 && (
              <div className="mb-3 rounded-md border border-gray-200 p-2">
                <p className="mb-2 text-xs font-medium text-gray-500">Mitglied hinzufügen</p>
                <div className="max-h-40 space-y-1 overflow-y-auto">
                  {availableProfiles.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleAddMember(p.id)}
                      className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-gray-50"
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">
                        {p.full_name.charAt(0).toUpperCase()}
                      </div>
                      {p.full_name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {members.length === 0 ? (
              <p className="text-sm text-gray-500">Noch keine Mitglieder zugewiesen.</p>
            ) : (
              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-md px-2 py-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">
                        {member.full_name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-gray-900">{member.full_name}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                      title="Entfernen"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

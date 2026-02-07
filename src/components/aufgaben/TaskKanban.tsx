'use client'

import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd'
import TaskStatusBadge from './TaskStatusBadge'
import { Calendar, User } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { TASK_STATUS_OPTIONS } from '@/lib/constants'
import type { Task, TaskStatus } from '@/lib/types/database'
import Link from 'next/link'

const COLUMNS: TaskStatus[] = ['offen', 'in_bearbeitung', 'erledigt', 'archiviert']

export default function TaskKanban({
  tasks,
  onStatusChange,
}: {
  tasks: Task[]
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void
}) {
  function handleDragEnd(result: DropResult) {
    if (!result.destination) return
    const taskId = result.draggableId
    const newStatus = result.destination.droppableId as TaskStatus
    if (newStatus !== result.source.droppableId) {
      onStatusChange(taskId, newStatus)
    }
  }

  function getColumnTasks(status: TaskStatus) {
    return tasks.filter((t) => t.status === status)
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((status) => {
          const label = TASK_STATUS_OPTIONS.find((s) => s.value === status)?.label || status
          const columnTasks = getColumnTasks(status)

          return (
            <div key={status} className="w-72 min-w-[288px] flex-shrink-0">
              <div className="mb-2 flex items-center gap-2">
                <TaskStatusBadge status={status} />
                <span className="text-xs text-gray-500">{columnTasks.length}</span>
              </div>

              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[200px] space-y-2 rounded-lg border-2 border-dashed p-2 transition-colors ${
                      snapshot.isDraggingOver
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    {columnTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <Link
                              href={`/aufgaben/${task.id}`}
                              className="block rounded-md border border-gray-200 bg-white p-3 shadow-sm"
                            >
                              <h4 className="mb-1 text-sm font-medium text-gray-900 line-clamp-2">
                                {task.title}
                              </h4>
                              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                {task.assigned_profile && (
                                  <span className="flex items-center gap-1">
                                    <User size={11} />
                                    {task.assigned_profile.full_name}
                                  </span>
                                )}
                                {task.deadline && (
                                  <span className="flex items-center gap-1">
                                    <Calendar size={11} />
                                    {formatDate(task.deadline)}
                                  </span>
                                )}
                                {task.project && (
                                  <span
                                    className="rounded-full px-1.5 py-0.5 text-[10px] font-medium text-white"
                                    style={{ backgroundColor: task.project.color }}
                                  >
                                    {task.project.name}
                                  </span>
                                )}
                              </div>
                            </Link>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          )
        })}
      </div>
    </DragDropContext>
  )
}

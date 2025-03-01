import { Draggable } from 'react-beautiful-dnd'
import { useState } from 'react'
import { TaskDetailModal } from './TaskDetailModal'

interface TaskProps {
  task: any
  index: number
}

export const Task = ({ task, index }: TaskProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const completedSubtasks = task.subtasks?.filter((s: any) => s.completed).length || 0
  const totalSubtasks = task.subtasks?.length || 0

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => setIsModalOpen(true)}
          className="bg-white p-4 rounded shadow cursor-pointer hover:bg-gray-50"
        >
          <div className="flex items-center gap-2 mb-2">
            {task.labels && task.labels.map((label: string) => (
              <span 
                key={label}
                className="text-xs px-2 py-1 rounded"
                style={{ backgroundColor: getLabelColor(label) }}
              >
                {label}
              </span>
            ))}
          </div>

          <div className="flex items-center mb-2">
            <span 
              className={`h-3 w-3 rounded-full mr-2 ${
                getPriorityColor(task.priority)
              }`}
            />
            <h4 className="font-semibold">{task.title}</h4>
          </div>

          {task.description && (
            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
          )}

          {totalSubtasks > 0 && (
            <div className="text-xs text-gray-500">
              {completedSubtasks}/{totalSubtasks} subtasks
            </div>
          )}

          <TaskDetailModal
            task={task}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onUpdate={(updatedTask: any) => {
              // Propagate changes up
            }}
            onDelete={() => {
              // Handle deletion
            }}
          />
        </div>
      )}
    </Draggable>
  )
}

const getLabelColor = (label: string) => {
  const colors: { [key: string]: string } = {
    Design: '#ef4444',
    Development: '#2563eb',
    Testing: '#16a34a',
    Urgent: '#eab308'
  }
  return colors[label] || '#64748b'
}

const getPriorityColor = (priority: string) => {
  const colors: { [key: string]: string } = {
    urgent: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#22c55e'
  }
  return colors[priority] || '#64748b'
}
import { Draggable } from 'react-beautiful-dnd'
import { useState } from 'react'
import { TaskDetailModal } from './TaskDetailModal'

interface TaskProps {
  task: any
  index: number
  onUpdate?: (updatedTask: any) => void
  onDelete?: (taskId: string) => void
}

export const Task = ({ task, index, onUpdate, onDelete }: TaskProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Safety check for task data
  if (!task || !task._id) {
    console.error('Invalid task data:', task);
    return null;
  }

  const completedSubtasks = task.subtasks?.filter((s: any) => s.completed).length || 0
  const totalSubtasks = task.subtasks?.length || 0

  const handleTaskUpdate = (updatedTask: any) => {
    if (onUpdate) {
      onUpdate(updatedTask);
    }
    setIsModalOpen(false);
  }

  const handleTaskDelete = () => {
    if (onDelete) {
      onDelete(task._id);
    }
    setIsModalOpen(false);
  }

  return (
    <Draggable draggableId={task._id.toString()} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => setIsModalOpen(true)}
          className="bg-white dark:bg-gray-700 p-4 rounded shadow cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          <div className="flex items-center gap-2 mb-2">
            {task.labels && task.labels.map((label: string) => (
              <span 
                key={label}
                className="text-xs px-2 py-1 rounded text-white"
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
            <h4 className="font-semibold dark:text-white">{task.title}</h4>
          </div>

          {task.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">{task.description}</p>
          )}

          {totalSubtasks > 0 && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center">
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 mr-2">
                <div 
                  className="bg-blue-500 h-1.5 rounded-full" 
                  style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
                ></div>
              </div>
              {completedSubtasks}/{totalSubtasks}
            </div>
          )}

          <TaskDetailModal
            task={task}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onUpdate={handleTaskUpdate}
            onDelete={handleTaskDelete}
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
    Urgent: '#eab308',
    Bug: '#dc2626',
    Feature: '#8b5cf6',
    Documentation: '#0ea5e9'
  }
  return colors[label] || '#64748b'
}

const getPriorityColor = (priority: string) => {
  const colors: { [key: string]: string } = {
    urgent: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500'
  }
  return colors[priority?.toLowerCase()] || 'bg-gray-500'
}
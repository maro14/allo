//src/components/Board/TaskDetailModal.tsx
import { useState, useRef, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { TaskType } from './Column'
import { CheckIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface TaskDetailModalProps {
  task: TaskType | null
  isOpen: boolean
  onClose: () => void
  onDelete?: (taskId: string) => void
  onUpdate?: (taskId: string, updatedTask: Partial<TaskType>) => void
}

export const TaskDetailModal = ({ 
  task, 
  isOpen, 
  onClose,
  onDelete,
  onUpdate
}: TaskDetailModalProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [editedDescription, setEditedDescription] = useState('')
  const [completedSubtasks, setCompletedSubtasks] = useState<string[]>([])
  const modalHeaderRef = useRef<HTMLDivElement>(null)

  // Initialize edit form when task changes or edit mode is activated
  useEffect(() => {
    if (task) {
      setEditedTitle(task.title)
      setEditedDescription(task.description || '')
      
      // Initialize completed subtasks from task data if available
      const completed = task.subtasks
        ?.filter(subtask => subtask.completed)
        .map(subtask => subtask._id) || []
      setCompletedSubtasks(completed)
    }
  }, [task])

  if (!task) return null

  const handleSaveChanges = async () => {
    if (!task || !onUpdate) return
    
    try {
      await onUpdate(task._id, {
        title: editedTitle,
        description: editedDescription
      })
      setIsEditing(false)
    } catch (err) {
      console.error('Failed to update task:', err)
    }
  }

  const handleDeleteTask = async () => {
    if (!task || !onDelete) return
    
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await onDelete(task._id)
        onClose()
      } catch (err) {
        console.error('Failed to delete task:', err)
      }
    }
  }

  const toggleSubtask = async (subtaskId: string) => {
    if (!task || !onUpdate) return
    
    const isCompleted = completedSubtasks.includes(subtaskId)
    const newCompletedSubtasks = isCompleted
      ? completedSubtasks.filter(id => id !== subtaskId)
      : [...completedSubtasks, subtaskId]
    
    setCompletedSubtasks(newCompletedSubtasks)
    
    // Update subtasks in the task
    const updatedSubtasks = task.subtasks?.map(subtask => ({
      ...subtask,
      completed: newCompletedSubtasks.includes(subtask._id)
    }))
    
    try {
      await onUpdate(task._id, { subtasks: updatedSubtasks })
    } catch (err) {
      console.error('Failed to update subtask status:', err)
    }
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      maxWidth="max-w-lg"
      dragHandleRef={modalHeaderRef}
    >
      <div 
        ref={modalHeaderRef} 
        className="flex justify-between items-center mb-4 cursor-move"
      >
        {isEditing ? (
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="text-lg font-medium w-full p-1 border-b border-gray-300 dark:border-gray-600 
                     bg-transparent focus:outline-none focus:border-blue-500"
            placeholder="Task title"
          />
        ) : (
          <h2 className="text-lg font-medium text-gray-800 dark:text-white">{task.title}</h2>
        )}
        
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button 
                onClick={handleSaveChanges}
                className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
              >
                <CheckIcon className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setIsEditing(false)}
                className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setIsEditing(true)}
                className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              {onDelete && (
                <button 
                  onClick={handleDeleteTask}
                  className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Description */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Description</h3>
        {isEditing ? (
          <textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md 
                     bg-transparent focus:outline-none focus:border-blue-500 resize-none"
            rows={3}
            placeholder="Add a description..."
          />
        ) : (
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {task.description || "No description provided."}
          </p>
        )}
      </div>
      
      {/* Subtasks */}
      {task.subtasks && task.subtasks.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Subtasks ({completedSubtasks.length}/{task.subtasks.length})
          </h3>
          <div className="space-y-2">
            {task.subtasks.map((subtask) => (
              <div 
                key={subtask._id} 
                className="flex items-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-md"
              >
                <input
                  type="checkbox"
                  checked={completedSubtasks.includes(subtask._id)}
                  onChange={() => toggleSubtask(subtask._id)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span 
                  className={`ml-2 ${
                    completedSubtasks.includes(subtask._id) 
                      ? 'line-through text-gray-400 dark:text-gray-500' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {subtask.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Labels</h3>
          <div className="flex flex-wrap gap-2">
            {task.labels.map((label) => {
              // Find the label color from your LABELS constant
              const labelColor = 
                ['Design', 'Development', 'Testing', 'Urgent'].includes(label)
                  ? {
                      'Design': '#ef4444',
                      'Development': '#2563eb',
                      'Testing': '#16a34a',
                      'Urgent': '#eab308'
                    }[label]
                  : '#9ca3af';
                  
              return (
                <span 
                  key={label}
                  className="px-2 py-1 rounded-full text-xs text-white"
                  style={{ backgroundColor: labelColor }}
                >
                  {label}
                </span>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Priority */}
      {task.priority && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Priority</h3>
          <div className="flex items-center">
            <span 
              className="h-3 w-3 rounded-full mr-2"
              style={{ 
                backgroundColor: 
                  task.priority === 'urgent' ? '#ef4444' :
                  task.priority === 'high' ? '#f97316' :
                  task.priority === 'medium' ? '#eab308' :
                  '#22c55e' // low
              }}
            />
            <span className="text-gray-700 dark:text-gray-300 capitalize">
              {task.priority}
            </span>
          </div>
        </div>
      )}
    </Modal>
  )
}
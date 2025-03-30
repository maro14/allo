//src/components/Board/TaskDetailModal.tsx
import { useState, useRef, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { TaskType } from './Column'
import { CheckIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { PrioritySelector } from './PrioritySelector'

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
  const [editedPriority, setEditedPriority] = useState('')
  const [completedSubtasks, setCompletedSubtasks] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [localTask, setLocalTask] = useState<TaskType | null>(null)
  const modalHeaderRef = useRef<HTMLDivElement>(null)

  // Initialize edit form and local task when task changes
  useEffect(() => {
    if (task) {
      setEditedTitle(task.title)
      setEditedDescription(task.description || '')
      setEditedPriority(task.priority || 'medium')
      setLocalTask(task)
      
      // Initialize completed subtasks from task data if available
      const completed = task.subtasks
        ?.filter(subtask => subtask.completed)
        .map(subtask => subtask._id) || []
      setCompletedSubtasks(completed)
      
      // Reset error state when task changes
      setError(null)
      // Reset editing state when task changes
      setIsEditing(false)
    }
  }, [task])

  if (!task) return null

  // Add a keyboard handler for saving with Ctrl+Enter in text areas
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSaveChanges();
    }
  }

  // Optimistic update for task changes
  const handleSaveChanges = async () => {
    if (!task || !onUpdate) return
    
    if (!editedTitle.trim()) {
      setError('Task title cannot be empty')
      return
    }
    
    // Optimistically update UI
    const previousTask = { ...task }
    const updatedTask = {
      ...task,
      title: editedTitle,
      description: editedDescription,
      priority: editedPriority
    }
    setLocalTask(updatedTask)
    setIsEditing(false)
    
    setIsLoading(true)
    setError(null)
    
    try {
      await onUpdate(task._id, {
        title: editedTitle,
        description: editedDescription,
        priority: editedPriority
      })
    } catch (err) {
      console.error('Failed to update task:', err)
      setError('Failed to update task. Please try again.')
      // Revert to previous state on error
      setLocalTask(previousTask)
      setEditedTitle(previousTask.title)
      setEditedDescription(previousTask.description || '')
      setEditedPriority(previousTask.priority || 'medium')
      setIsEditing(true)
    } finally {
      setIsLoading(false)
    }
  }

  // Optimistic update for task deletion
  const handleDeleteTask = async () => {
    if (!task || !onDelete) return
    
    if (window.confirm('Are you sure you want to delete this task?')) {
      // Close modal immediately for better UX
      onClose()
      
      try {
        await onDelete(task._id)
      } catch (err) {
        console.error('Failed to delete task:', err)
        // Could show a toast notification here
      }
    }
  }

  // Optimistic update for subtask toggling
  const toggleSubtask = async (subtaskId: string) => {
    if (!task || !onUpdate) return
    
    const isCompleted = completedSubtasks.includes(subtaskId)
    const newCompletedSubtasks = isCompleted
      ? completedSubtasks.filter(id => id !== subtaskId)
      : [...completedSubtasks, subtaskId]
    
    // Optimistically update UI
    setCompletedSubtasks(newCompletedSubtasks)
    
    // Update subtasks in the local task
    const previousSubtasks = task.subtasks
    const updatedSubtasks = task.subtasks?.map(subtask => ({
      ...subtask,
      completed: newCompletedSubtasks.includes(subtask._id)
    }))
    
    try {
      await onUpdate(task._id, { subtasks: updatedSubtasks })
    } catch (err) {
      console.error('Failed to update subtask status:', err)
      // Revert to previous state on error
      setCompletedSubtasks(previousSubtasks?.filter(s => s.completed).map(s => s._id) || [])
    }
  }

  // Use the actual task or optimistically updated localTask
  const displayTask = localTask || task

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      maxWidth="max-w-lg"
      dragHandleRef={modalHeaderRef}
      closeOnBackdropClick={true}
      hideCloseButton={true}  // Add this prop to hide the X button
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded dark:bg-red-900/30 dark:text-red-400 dark:border-red-700 animate-fadeIn">
          {error}
        </div>
      )}
      
      <div 
        ref={modalHeaderRef} 
        className="flex justify-between items-center mb-6 cursor-move group"
        aria-label="Task details"
      >
        {isEditing ? (
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="text-xl font-medium w-full p-2 border-b-2 border-gray-300 dark:border-gray-600 
                     bg-transparent focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="Task title"
            aria-label="Edit task title"
            disabled={isLoading}
            autoFocus
          />
        ) : (
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {displayTask.title}
          </h2>
        )}
        
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button 
                onClick={handleSaveChanges}
                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full transition-colors flex items-center gap-1"
                aria-label="Save changes"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="h-5 w-5 block rounded-full border-2 border-t-green-600 animate-spin" />
                ) : (
                  <>
                    <CheckIcon className="h-5 w-5" />
                    <span className="text-sm font-medium">Save</span>
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setEditedTitle(task.title)
                  setEditedDescription(task.description || '')
                  setEditedPriority(task.priority || 'medium')
                  setError(null)
                }}
                className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                aria-label="Cancel editing"
                disabled={isLoading}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setIsEditing(true)}
                className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                aria-label="Edit task"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              {onDelete && (
                <button 
                  onClick={handleDeleteTask}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                  aria-label="Delete task"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Description */}
      <div className="mb-8 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center">
          <span className="inline-block w-1 h-4 bg-blue-500 mr-2 rounded"></span>
          Description
        </h3>
        {isEditing ? (
          <textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md 
                     bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all"
            rows={4}
            placeholder="Add a description..."
            disabled={isLoading}
          />
        ) : (
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap pl-3 border-l-2 border-gray-200 dark:border-gray-700">
            {displayTask.description || "No description provided."}
          </p>
        )}
      </div>
      
      {/* Subtasks */}
      {displayTask.subtasks && displayTask.subtasks.length > 0 && (
        <div className="mb-8 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center">
            <span className="inline-block w-1 h-4 bg-purple-500 mr-2 rounded"></span>
            Subtasks ({completedSubtasks.length}/{displayTask.subtasks.length})
          </h3>
          <div className="space-y-2">
            {displayTask.subtasks.map((subtask) => (
              <div 
                key={subtask._id} 
                className="flex items-center p-3 bg-white dark:bg-gray-700 rounded-md shadow-sm hover:shadow transition-shadow"
              >
                <input
                  type="checkbox"
                  checked={completedSubtasks.includes(subtask._id)}
                  onChange={() => toggleSubtask(subtask._id)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span 
                  className={`ml-3 ${
                    completedSubtasks.includes(subtask._id) 
                      ? 'line-through text-gray-400 dark:text-gray-500' 
                      : 'text-gray-700 dark:text-gray-300'
                  } transition-colors`}
                >
                  {subtask.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Labels */}
      {displayTask.labels && displayTask.labels.length > 0 && (
        <div className="mb-8 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center">
            <span className="inline-block w-1 h-4 bg-yellow-500 mr-2 rounded"></span>
            Labels
          </h3>
          <div className="flex flex-wrap gap-2">
            {displayTask.labels.map((label) => {
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
                  className="px-3 py-1 rounded-full text-xs font-medium text-white shadow-sm"
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
      {displayTask.priority && (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg mb-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center">
            <span className="inline-block w-1 h-4 bg-red-500 mr-2 rounded"></span>
            Priority
          </h3>
          {isEditing ? (
            <PrioritySelector 
              priority={editedPriority} 
              onChange={setEditedPriority} 
            />
          ) : (
            <div className="flex items-center">
              <span 
                className="h-3 w-3 rounded-full mr-2"
                style={{ 
                  backgroundColor: 
                    displayTask.priority === 'urgent' ? '#ef4444' :
                    displayTask.priority === 'high' ? '#f97316' :
                    displayTask.priority === 'medium' ? '#eab308' :
                    '#22c55e' // low
                }}
              />
              <span className="text-gray-700 dark:text-gray-300 capitalize font-medium">
                {displayTask.priority || 'medium'}
              </span>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}

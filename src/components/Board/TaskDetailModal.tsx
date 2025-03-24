// src/components/TaskDetailModal.tsx
import { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { LabelSelector } from './LabelSelector'
import { PrioritySelector } from './PrioritySelector'
import { useDraggable } from '../../hooks/useDraggable'

interface TaskDetailModalProps {
  task: any
  isOpen: boolean
  onClose: () => void
  onUpdate: (updatedTask: any) => void
  onDelete: () => void
}

export const TaskDetailModal = ({
  task,
  isOpen,
  onClose,
  onUpdate,
  onDelete
}: TaskDetailModalProps) => {
  // Task state management
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description)
  const [subtasks, setSubtasks] = useState(task.subtasks || [])
  const [labels, setLabels] = useState(task.labels || [])
  const [priority, setPriority] = useState(task.priority || 'medium')

  // Draggable modal functionality
  const { position, dragRef, handleMouseDown, resetPosition } = useDraggable()

  // Reset position and drag operations when modal opens
  useEffect(() => {
    if (isOpen) {
      resetPosition()
      
      // Reset any ongoing drag operations from other libraries
      const resetDragOperations = () => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
      }
      setTimeout(resetDragOperations, 0)
    }
  }, [isOpen, resetPosition])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const updatedTask = { 
      ...task, 
      title, 
      description,
      subtasks,
      labels,
      priority
    }
    
    const response = await fetch(`/api/tasks/${task._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedTask)
    })
    
    if (response.ok) {
      onUpdate(updatedTask)
      onClose()
    }
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      await fetch(`/api/tasks/${task._id}`, { method: 'DELETE' })
      onDelete()
      onClose()
    }
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      position={position}
      dragHandleRef={dragRef}
      className="max-w-2xl"
    >
      {/* Drag handle with improved styling */}
      <div 
        ref={dragRef}
        onMouseDown={handleMouseDown}
        className="bg-gray-100 dark:bg-gray-800 p-2 cursor-move rounded-t-lg mb-4 text-center"
      >
        <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 mx-auto rounded-full" />
      </div>

      {/* Modal header with task title */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
          Task Details
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Edit task information and manage subtasks
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Input with improved styling */}
        <div>
          <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title
          </label>
          <input
            id="task-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white transition-colors"
          />
        </div>

        {/* Description Textarea with improved styling */}
        <div>
          <label htmlFor="task-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            id="task-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white transition-colors"
            rows={3}
          />
        </div>

        {/* Two-column layout for priority and labels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Priority Selector */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</h3>
            <PrioritySelector 
              priority={priority}
              onChange={setPriority}
            />
          </div>

          {/* Label Selector */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Labels</h3>
            <LabelSelector 
              selectedLabels={labels}
              onChange={setLabels}
            />
          </div>
        </div>

        {/* Subtasks Section with improved styling */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Subtasks</h3>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {subtasks.map((subtask: any, index: number) => (
              <div key={subtask._id || index} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700">
                <input
                  type="checkbox"
                  checked={subtask.completed}
                  onChange={(e) => {
                    const newSubtasks = [...subtasks]
                    newSubtasks[index].completed = e.target.checked
                    setSubtasks(newSubtasks)
                    fetch(`/api/tasks/${task._id}/subtasks`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ subtasks: newSubtasks })
                    })
                  }}
                  className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={subtask.title}
                  onChange={(e) => {
                    const newSubtasks = [...subtasks]
                    newSubtasks[index].title = e.target.value
                    setSubtasks(newSubtasks)
                  }}
                  onBlur={() => {
                    fetch(`/api/tasks/${task._id}/subtasks`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ subtasks })
                    })
                  }}
                  className="flex-1 p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white text-sm"
                />
                <button
                  type="button"
                  onClick={() => setSubtasks(subtasks.filter((_: any, i: number) => i !== index))}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setSubtasks([...subtasks, { title: '', completed: false }])}
              className="mt-3 w-full flex items-center justify-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add subtask
            </button>
          </div>
        </div>

        {/* Action Buttons with improved styling */}
        <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
          <button 
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-md shadow-sm hover:shadow transition-all duration-200 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="bg-white dark:bg-gray-800 text-red-600 dark:text-red-500 border border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-3 rounded-md shadow-sm hover:shadow transition-all duration-200 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete
          </button>
        </div>
      </form>
    </Modal>
  )
}
//src/components/TaskFormModal.tsx
import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { LabelSelector } from './LabelSelector'
import { PrioritySelector } from './PrioritySelector'
import { TaskType } from './Column'
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface TaskFormModalProps {
  columnId: string
  isOpen: boolean
  onClose: () => void
  onTaskCreated: (newTask: TaskType) => void
}

export const TaskFormModal = ({ 
  columnId,
  isOpen,
  onClose,
  onTaskCreated
}: TaskFormModalProps) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [subtasks, setSubtasks] = useState<string[]>([])
  const [newSubtask, setNewSubtask] = useState('')
  const [labels, setLabels] = useState<string[]>([])
  const [priority, setPriority] = useState('medium')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const formattedSubtasks = subtasks.map(title => ({ title }))
    
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          description, 
          columnId,
          subtasks: formattedSubtasks,
          labels,
          priority
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to create task (${response.status})`);
      }
      
      const result = await response.json();
      
      // Make sure we're passing the correct task structure to the parent component
      if (result.success && result.data) {
        setTitle('')
        setDescription('')
        setSubtasks([])
        setLabels([])
        setPriority('medium')
        onTaskCreated(result.data)
        onClose()
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create task');
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <h2 className="text-lg font-medium mb-4 p-2">Create a new task</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            className="w-full p-2 border-0 border-b border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-0 focus:border-blue-500 text-gray-800 dark:text-white placeholder-gray-400"
            required
          />
        </div>
        
        {/* Description */}
        <div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="w-full p-2 border-0 border-b border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-0 focus:border-blue-500 text-gray-800 dark:text-white placeholder-gray-400 resize-none"
            rows={2}
          />
        </div>
        
        {/* Subtasks */}
        <div className="pt-2">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 p-1.5">Subtasks</h3>
          <div className="space-y-2">
            {subtasks.map((subtask, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={subtask}
                  onChange={(e) => {
                    const newSubtasks = [...subtasks]
                    newSubtasks[index] = e.target.value
                    setSubtasks(newSubtasks)
                  }}
                  className="flex-1 p-2 border-0 border-b border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-0 focus:border-blue-500 text-gray-800 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newSubtasks = subtasks.filter((_, i) => i !== index)
                    setSubtasks(newSubtasks)
                  }}
                  className="text-gray-400 hover:text-red-500 p-1"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
            
            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                placeholder="Add a subtask"
                className="flex-1 p-2 border-0 border-b border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-0 focus:border-blue-500 text-gray-800 dark:text-white placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => {
                  if (newSubtask.trim()) {
                    setSubtasks([...subtasks, newSubtask])
                    setNewSubtask('')
                  }
                }}
                className="text-blue-500 hover:text-blue-600 p-1"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Two-column layout for Labels and Priority */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          {/* Labels */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Labels</h3>
            <LabelSelector 
              selectedLabels={labels}
              onChange={setLabels}
            />
          </div>

          {/* Priority */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Priority</h3>
            <PrioritySelector 
              priority={priority}
              onChange={setPriority}
            />
          </div>
        </div>

        <button 
          type="submit"
          className="mt-6 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full w-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Create Task
        </button>
      </form>
    </Modal>
  )
}
import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { LabelSelector } from './LabelSelector'
import { PrioritySelector } from './PrioritySelector'

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
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description)
  const [subtasks, setSubtasks] = useState(task.subtasks || [])
  const [labels, setLabels] = useState(task.labels || [])
  const [priority, setPriority] = useState(task.priority || 'medium')

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
    if (confirm('Are you sure?')) {
      await fetch(`/api/tasks/${task._id}`, { method: 'DELETE' })
      onDelete()
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold mb-4">Task Details</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded"
        />
        
        {/* Description */}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded"
          rows={3}
        />
        
        {/* Subtasks */}
        <div>
          <h3 className="font-semibold mb-2">Subtasks</h3>
          {subtasks.map((subtask: any, index: number) => (
            <div key={subtask._id || index} className="flex items-center gap-2">
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
                className="flex-1 p-1 border rounded"
              />
            </div>
          ))}
        </div>

        {/* Labels */}
        <div>
          <h3 className="font-semibold mb-2">Labels</h3>
          <LabelSelector 
            selectedLabels={labels}
            onChange={setLabels}
          />
        </div>

        {/* Priority */}
        <div>
          <h3 className="font-semibold mb-2">Priority</h3>
          <PrioritySelector 
            priority={priority}
            onChange={setPriority}
          />
        </div>

        <div className="flex gap-2">
          <button 
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded flex-1"
          >
            Save
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-500 text-white px-4 py-2 rounded flex-1"
          >
            Delete
          </button>
        </div>
      </form>
    </Modal>
  )
}
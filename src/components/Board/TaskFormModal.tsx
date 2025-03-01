import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { LabelSelector } from './LabelSelector'
import { PrioritySelector } from './PrioritySelector'

interface TaskFormModalProps {
  columnId: string
  isOpen: boolean
  onClose: () => void
  onTaskCreated: () => void
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
    
    if (response.ok) {
      setTitle('')
      setDescription('')
      setSubtasks([])
      setLabels([])
      setPriority('medium')
      onTaskCreated()
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold mb-4">New Task</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          className="w-full p-2 border rounded"
          required
        />
        
        {/* Description */}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="w-full p-2 border rounded"
          rows={3}
        />
        
        {/* Subtasks */}
        <div>
          <h3 className="font-semibold mb-2">Subtasks</h3>
          {subtasks.map((subtask, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={subtask}
                onChange={(e) => {
                  const newSubtasks = [...subtasks]
                  newSubtasks[index] = e.target.value
                  setSubtasks(newSubtasks)
                }}
                className="flex-1 p-1 border rounded"
              />
              <button
                onClick={() => {
                  const newSubtasks = subtasks.filter((_, i) => i !== index)
                  setSubtasks(newSubtasks)
                }}
                className="bg-red-500 text-white px-2 py-1 rounded"
              >
                Remove
              </button>
            </div>
          ))}
          
          <div className="flex gap-2">
            <input
              type="text"
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              placeholder="New subtask"
              className="flex-1 p-1 border rounded"
            />
            <button
              onClick={() => {
                if (newSubtask.trim()) {
                  setSubtasks([...subtasks, newSubtask])
                  setNewSubtask('')
                }
              }}
              className="bg-blue-500 text-white px-2 py-1 rounded"
            >
              Add Subtask
            </button>
          </div>
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

        <button 
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded w-full"
        >
          Create Task
        </button>
      </form>
    </Modal>
  )
}
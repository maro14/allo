import { useState } from 'react'
import { Draggable, Droppable } from 'react-beautiful-dnd'
import { Task } from './Task'
import { TaskFormModal } from './TaskFormModal'

interface ColumnProps {
  column: any
  index: number
}

export const Column = ({ column, index }: ColumnProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <Draggable draggableId={column._id} index={index}>
      {(provided) => (
        <div
          {...provided.draggableProps}
          ref={provided.innerRef}
          className="bg-gray-100 p-4 rounded w-72"
        >
          <div 
            {...provided.dragHandleProps}
            className="flex justify-between items-center mb-4"
          >
            <h3 className="text-lg font-bold">{column.title}</h3>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-500 text-white px-2 py-1 rounded"
            >
              + Add Task
            </button>
          </div>
          
          <Droppable droppableId={column._id} type="task">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="space-y-2 min-h-[200px]"
              >
                {column.tasks.map((task: any, index: number) => (
                  <Task key={task._id} task={task} index={index} />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
          
          <TaskFormModal
            columnId={column._id}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onTaskCreated={() => {
              // Refetch or update parent state
            }}
          />
        </div>
      )}
    </Draggable>
  )
}

export default Column
// components/Board/Column.tsx
import { Draggable, Droppable } from 'react-beautiful-dnd'

const Column = ({ column, tasks, index }) => {
  return (
    <Draggable draggableId={column.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="bg-gray-100 p-4 rounded"
        >
          <h3 {...provided.dragHandleProps}>{column.title}</h3>
          <Droppable droppableId={column.id} type="task">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {tasks.map((task, index) => (
                  <Task key={task.id} task={task} index={index} />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      )}
    </Draggable>
  )
}
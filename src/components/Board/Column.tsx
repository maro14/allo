//src/components/Board/Column.tsx
import { useState } from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { Task } from './Task';
import { TaskFormModal } from './TaskFormModal';
import { Button } from '../ui/Button';
import { PlusIcon } from '@heroicons/react/24/outline';

export interface TaskType {
  _id: string;
  title: string;
  description?: string;
  priority?: string;
  labels?: string[];
  subtasks?: any[];
}

interface ColumnType {
  _id: string;
  title: string;
  tasks: TaskType[];
}

interface ColumnProps {
  column: ColumnType;
  index: number;
  onTaskCreated?: (columnId: string, newTask: TaskType) => void;
}

export const Column = ({ column, index, onTaskCreated }: ColumnProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!column || !column._id) {
    console.error('Invalid column data:', column);
    return <div className="bg-red-100 p-4 rounded">Invalid column data</div>;
  }

  // Ensure we have a string ID for draggable/droppable
  const columnId = column._id ? column._id.toString() : `column-${index}`;

  const handleTaskCreated = (newTask: TaskType) => {
    console.log('New task created:', newTask);
    
    // Propagate the new task to the parent (Board) if a callback is provided.
    if (onTaskCreated) {
      onTaskCreated(column._id, newTask);
    } else {
      // Otherwise, you might choose to re-fetch board data.
      console.log('New task created, but no onTaskCreated callback provided');
    }
    setIsModalOpen(false);
  };

  return (
    <Draggable draggableId={columnId} index={index}>
      {(provided) => (
        <div
          {...provided.draggableProps}
          ref={provided.innerRef}
          className="bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg w-72"
        >
          <div
            {...provided.dragHandleProps}
            className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-base font-medium text-gray-800 dark:text-white flex items-center">
              {column.title}
              <span className="ml-2 text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400">
                {column.tasks?.length || 0}
              </span>
            </h3>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>

          <Droppable
            droppableId={columnId}
            type="task"
          >
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`space-y-2 min-h-[200px] p-2 transition-colors ${
                  snapshot.isDraggingOver
                    ? 'bg-gray-50 dark:bg-gray-800/50'
                    : ''
                }`}
              >
                {(!column.tasks || column.tasks.length === 0) ? (
                  <div className="text-center py-4 text-gray-400 dark:text-gray-500 text-xs">
                    No tasks
                  </div>
                ) : (
                  column.tasks.map((task, taskIndex) => (
                    <Task 
                      key={task._id ? task._id.toString() : `task-${columnId}-${taskIndex}`} 
                      task={task} 
                      index={taskIndex} 
                    />
                  ))
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          <TaskFormModal
            columnId={column._id}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onTaskCreated={handleTaskCreated}
          />
        </div>
      )}
    </Draggable>
  );
};

export default Column;

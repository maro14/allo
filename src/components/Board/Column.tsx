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

  const handleTaskCreated = (newTask: TaskType) => {
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
    <Draggable draggableId={column._id.toString()} index={index}>
      {(provided) => (
        <div
          {...provided.draggableProps}
          ref={provided.innerRef}
          className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-sm w-72"
        >
          <div
            {...provided.dragHandleProps}
            className="flex justify-between items-center mb-4"
          >
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">
              {column.title}
              <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                {column.tasks?.length || 0}
              </span>
            </h3>
            <Button
              onClick={() => setIsModalOpen(true)}
              size="sm"
              className="flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>

          <Droppable
            droppableId={column._id.toString()}
            type="task"
          >
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`space-y-2 min-h-[200px] transition-colors ${
                  snapshot.isDraggingOver
                    ? 'bg-blue-50 dark:bg-blue-900/20'
                    : ''
                } rounded p-1`}
              >
                {(!column.tasks || column.tasks.length === 0) ? (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm italic">
                    No tasks yet
                  </div>
                ) : (
                  column.tasks.map((task, taskIndex) => (
                    <Task key={task._id} task={task} index={taskIndex} />
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
            onTaskCreated={(newTask) => handleTaskCreated(newTask)}
          />
        </div>
      )}
    </Draggable>
  );
};

export default Column;

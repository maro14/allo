//src/components/Board/Column.tsx
import { useState } from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { Task } from './Task';
import { TaskFormModal } from './TaskFormModal';
import { Button } from '../ui/Button';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

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

// Add these to your ColumnProps interface
interface ColumnProps {
  column: ColumnType;
  index: number;
  onTaskCreated?: (columnId: string, newTask: TaskType) => void;
  onDeleteColumn?: (columnId: string) => void;
  onEditColumn?: (columnId: string, currentTitle: string) => void;
  onUpdateColumnTitle?: (columnId: string) => void;
  isEditing?: boolean;
  editingTitle?: string;
  onEditingTitleChange?: (title: string) => void;
}

export const Column = ({ 
  column, 
  index, 
  onTaskCreated,
  onDeleteColumn,
  onEditColumn,
  onUpdateColumnTitle,
  isEditing,
  editingTitle,
  onEditingTitleChange
}: ColumnProps) => {
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

  // Add this to handle form submission for editing
  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateColumnTitle) {
      onUpdateColumnTitle(column._id);
    }
  };

  return (
    <Draggable draggableId={columnId} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="bg-gray-100 dark:bg-gray-800 rounded-md w-80 flex-shrink-0 flex flex-col max-h-[calc(100vh-12rem)]"
        >
          {/* Column Header */}
          <div 
            {...provided.dragHandleProps}
            className="p-3 font-medium flex justify-between items-center bg-gray-200 dark:bg-gray-700 rounded-t-md"
          >
            {isEditing ? (
              <form onSubmit={handleSubmitEdit} className="flex-1">
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => onEditingTitleChange?.(e.target.value)}
                  className="w-full p-1 rounded border border-gray-300 dark:border-gray-600 
                           bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                  autoFocus
                />
                <div className="flex mt-1 space-x-1">
                  <button 
                    type="submit" 
                    className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
                  >
                    Save
                  </button>
                  <button 
                    type="button" 
                    className="text-xs bg-gray-300 dark:bg-gray-600 px-2 py-1 rounded"
                    onClick={() => onEditColumn?.(column._id, column.title)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <h3 className="text-gray-800 dark:text-gray-200">{column.title}</h3>
                <div className="flex space-x-1">
                  <button 
                    onClick={() => onEditColumn?.(column._id, column.title)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => onDeleteColumn?.(column._id)}
                    className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Tasks List */}
          <Droppable droppableId={columnId} type="task">
            {(provided) => (
              <div 
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex-1 overflow-y-auto p-2 space-y-2"
              >
                {column.tasks && column.tasks.length > 0 ? (
                  column.tasks.map((task, taskIndex) => (
                    <Task 
                      key={task._id} 
                      task={task} 
                      index={taskIndex} 
                    />
                  ))
                ) : (
                  <div className="text-gray-400 dark:text-gray-500 text-center p-4 text-sm">
                    No tasks yet
                  </div>
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
          
          {/* Add Task Button */}
          <div className="p-2 border-t border-gray-200 dark:border-gray-700">
            <Button 
              onClick={() => setIsModalOpen(true)} 
              variant="ghost" 
              className="w-full flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Task
            </Button>
          </div>
          
          {/* Task Form Modal */}
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

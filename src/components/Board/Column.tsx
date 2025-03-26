//src/components/Board/Column.tsx
import { useState, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Task } from './Task';
import { TaskFormModal } from './TaskFormModal';
import { Button } from '../ui/Button';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { GripVertical } from 'lucide-react';

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
  boardId: string;
  moveColumn: (dragIndex: number, hoverIndex: number) => void;
  moveTask: (
    taskId: string,
    sourceColumnId: string,
    destinationColumnId: string,
    sourceIndex: number,
    destinationIndex: number
  ) => void;
}

// Column item type
const COLUMN_TYPE = 'column';
const TASK_TYPE = 'task';

export const Column = ({ 
  column, 
  index,
  onTaskCreated,
  onDeleteColumn,
  onEditColumn,
  onUpdateColumnTitle,
  isEditing,
  editingTitle,
  onEditingTitleChange,
  boardId,
  moveColumn,
  moveTask
}: ColumnProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  if (!column || !column._id) {
    console.error('Invalid column data:', column);
    return <div className="bg-red-100 p-4 rounded">Invalid column data</div>;
  }

  // Drag functionality for column
  const [{ isDragging }, drag] = useDrag({
    type: COLUMN_TYPE,
    item: { id: column._id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Drop functionality for column
  const [, drop] = useDrop({
    accept: COLUMN_TYPE,
    hover(item: { id: string; index: number }, monitor) {
      if (!ref.current) return;
      
      const dragIndex = item.index;
      const hoverIndex = index;
      
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) return;
      
      // Determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      
      // Get horizontal middle
      const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
      
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      
      // Get pixels to the left
      const hoverClientX = clientOffset!.x - hoverBoundingRect.left;
      
      // Only perform the move when the mouse has crossed half of the items width
      // When dragging right, only move when the cursor is after 50%
      // When dragging left, only move when the cursor is before 50%
      
      // Dragging right
      if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) return;
      
      // Dragging left
      if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) return;
      
      // Time to actually perform the action
      moveColumn(dragIndex, hoverIndex);
      
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  // Drop functionality for tasks
  const [, dropTask] = useDrop({
    accept: TASK_TYPE,
    drop: () => ({ columnId: column._id }),
  });

  // Connect the drag and drop refs
  drag(drop(ref));

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
    <div
      ref={ref}
      className={`bg-gray-100 dark:bg-gray-800 rounded-md w-80 flex-shrink-0 flex flex-col max-h-[calc(100vh-12rem)] ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div 
        className="p-3 font-medium flex justify-between items-center bg-gray-200 dark:bg-gray-700 rounded-t-md"
      >
        {/* Drag handle with icon */}
        <div 
          className="flex items-center cursor-grab active:cursor-grabbing"
        >
          <div className="mr-2 text-gray-500 dark:text-gray-400">
            <GripVertical size={16} />
          </div>
          
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
            <span className="text-gray-800 dark:text-gray-200">{column.title}</span>
          )}
        </div>

        {/* Column actions */}
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            onClick={() => onEditColumn?.(column._id, column.title)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            onClick={() => onDeleteColumn?.(column._id)}
            className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tasks List */}
      <div
        ref={dropTask}
        className="flex-1 overflow-y-auto p-2 space-y-2"
      >
        {column.tasks && column.tasks.length > 0 ? (
          column.tasks.map((task, taskIndex) => (
            <Task 
              key={task._id} 
              task={task} 
              index={taskIndex}
              columnId={column._id}
              moveTask={moveTask}
            />
          ))
        ) : (
          <div className="text-gray-400 dark:text-gray-500 text-center p-4 text-sm">
            No tasks yet
          </div>
        )}
      </div>
      
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
  );
};

export default Column;

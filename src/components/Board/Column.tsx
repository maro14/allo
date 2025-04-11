//src/components/Board/Column.tsx
import { useState, useRef, useEffect ,memo } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Task } from './Task';
import { TaskFormModal } from './TaskFormModal';
import { Button } from '../ui/Button';
import { PlusIcon } from '@heroicons/react/24/outline';
import { GripVertical, EllipsisVertical } from 'lucide-react';
import { ColumnModal } from './ColumnModal';

// Improve type safety for subtasks
export interface Subtask {
  _id: string;
  title: string;
  completed: boolean;
}

export interface TaskType {
  _id: string;
  title: string;
  description?: string;
  priority?: "urgent" | "high" | "medium" | "low"; // Updated to use specific string literals
  labels?: string[];
  subtasks?: Subtask[];
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
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const taskListRef = useRef<HTMLDivElement>(null); // Add a separate ref for the task list

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
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      
      // Get pixels to the left/top
      const hoverClientX = clientOffset!.x - hoverBoundingRect.left;
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;
      
      // For horizontal movement
      if (Math.abs(hoverClientY - hoverMiddleY) > Math.abs(hoverClientX - hoverMiddleX)) {
        // Vertical movement
        // Dragging downwards
        if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
        
        // Dragging upwards
        if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
      } else {
        // Horizontal movement
        // Dragging right
        if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) return;
        
        // Dragging left
        if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) return;
      }
      
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
    hover(item: { id: string; index: number; columnId: string; type: string }, monitor) {
      // Only handle if it's coming from another column
      if (item.columnId === column._id) return;
      
      // If the column is empty, we'll move the task to index 0
      if (column.tasks.length === 0) {
        moveTask(item.id, item.columnId, column._id, item.index, 0);
        item.index = 0;
        item.columnId = column._id;
      }
    },
    drop: () => ({ columnId: column._id }),
  });

  // Add a drop target for the task list area
  const [, taskListDrop] = useDrop({
    accept: TASK_TYPE,
    hover(item: { id: string; index: number; columnId: string; type: string }, monitor) {
      // Only handle if it's coming from another column
      if (item.columnId === column._id) return;
      
      // If the column is empty, we'll move the task to index 0
      if (column.tasks.length === 0) {
        moveTask(item.id, item.columnId, column._id, item.index, 0);
        item.index = 0;
        item.columnId = column._id;
      }
    }
  });

  // Connect the drag and drop refs
  drag(drop(ref));
  
  // Use useEffect to apply the drop ref to the taskListRef
  useEffect(() => {
    if (taskListRef.current) {
      dropTask(taskListRef.current);
    }
  }, [dropTask]);

  // Also apply taskListDrop to the column ref
  useEffect(() => {
    if (ref.current) {
      taskListDrop(ref.current);
    }
  }, [taskListDrop]);

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

  const handleUpdateColumn = (columnId: string, title: string) => {
    if (onEditingTitleChange) {
      onEditingTitleChange(title);
    }
    if (onUpdateColumnTitle) {
      onUpdateColumnTitle(columnId);
    }
    setIsColumnModalOpen(false);
  };

  return (
    <div
      ref={ref}
      className={`flex flex-col bg-gray-100 dark:bg-gray-800 rounded-lg shadow-sm 
        min-w-[280px] max-w-[280px] h-full
        ${isDragging ? 'opacity-50' : ''}`}
    >
      {/* Column header */}
      <div className="p-3 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
        {/* Drag handle with icon */}
        <div 
          className="flex items-center cursor-grab active:cursor-grabbing"
          aria-label="Drag handle"
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
            onClick={() => setIsColumnModalOpen(true)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
            aria-label="Column options"
          >
            <EllipsisVertical size={18} strokeWidth={2} />
          </Button>
        </div>
      </div>

      {/* Tasks List */}
      <div
        ref={taskListRef} // Use the separate ref here instead of directly using dropTask
        className="flex-1 overflow-y-auto p-2 space-y-2"
        aria-label={`Tasks in ${column.title}`}
        role="list"
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

      {/* Column Modal */}
      <ColumnModal
        isOpen={isColumnModalOpen}
        onClose={() => setIsColumnModalOpen(false)}
        column={column}
        onDelete={onDeleteColumn}
        onUpdate={handleUpdateColumn}
        boardId={boardId}
      />
    </div>
  );
};

export default memo(Column);

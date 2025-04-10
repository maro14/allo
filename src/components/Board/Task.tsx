//src/components/Task.tsx
import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useState } from 'react';
import { TaskDetailModal } from './TaskDetailModal';
import { TaskType } from './Column';

interface TaskProps {
  task: {
    _id: string;
    title: string;
    description?: string;
    priority?: 'urgent' | 'high' | 'medium' | 'low';
    labels?: string[];
    subtasks?: {
      _id: string;
      title: string;
      completed: boolean;
    }[];
  };
  index: number;
  columnId: string;
  onUpdate?: (taskId: string, updates: Partial<TaskProps['task']>) => void;
  onDelete?: (taskId: string) => void;
  moveTask: (
    taskId: string,
    sourceColumnId: string,
    destinationColumnId: string,
    sourceIndex: number,
    destinationIndex: number
  ) => void;
}

// Task item type
const TASK_TYPE = 'task';

export const Task = ({ task, index, columnId, onUpdate, onDelete, moveTask }: TaskProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleUpdateTask = async (taskId: string, updatedTask: Partial<TaskType>) => {
    console.log('Task update requested:', taskId, updatedTask);
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update task: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Task update response:', result);
      
      if (onUpdate) {
        onUpdate(taskId, updatedTask);
      }
      
      return result;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  if (!task || !task._id) {
    console.error('Invalid task data:', task);
    return null;
  }

  const totalSubtasks = task.subtasks?.length || 0;
  const completedSubtasks = task.subtasks?.filter(subtask => subtask.completed).length || 0;

  // Drag functionality for task
  const [{ isDragging }, drag] = useDrag({
    type: TASK_TYPE,
    item: { 
      id: task._id, 
      index,
      columnId,
      type: TASK_TYPE
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Drop functionality for task
  const [, drop] = useDrop({
    accept: TASK_TYPE,
    hover(item: { id: string; index: number; columnId: string; type: string }, monitor) {
      if (!ref.current) return;
      
      const dragIndex = item.index;
      const hoverIndex = index;
      const sourceColumnId = item.columnId;
      const targetColumnId = columnId;
      
      // Don't replace items with themselves
      if (dragIndex === hoverIndex && sourceColumnId === targetColumnId) return;
      
      // Determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      
      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      
      // Get pixels to the top
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;
      
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
      
      // Time to actually perform the action
      moveTask(item.id, sourceColumnId, targetColumnId, dragIndex, hoverIndex);
      
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
      item.columnId = targetColumnId;
    },
  });

  // Connect the drag and drop refs
  drag(drop(ref));

  const handleClick = (e: React.MouseEvent) => {
    // Prevent opening modal when dragging
    if (isDragging) return;
    setIsModalOpen(true);
  };

  // Function to get color for label
  const getLabelColor = (label: string) => {
    const colors: Record<string, string> = {
      'Design': '#ef4444',
      'Development': '#2563eb',
      'Testing': '#16a34a',
      'Bug': '#dc2626',
      'Feature': '#9333ea',
      'Documentation': '#f59e0b',
      'Research': '#0891b2',
      'Urgent': '#eab308'
    };
    
    return colors[label] || '#6b7280'; // Default gray
  };

  // Function to get priority color
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent': return '#ef4444'; // Red
      case 'high': return '#f97316';   // Orange
      case 'medium': return '#eab308'; // Yellow
      case 'low': return '#22c55e';    // Green
      default: return '#6b7280';       // Gray
    }
  };

  return (
    <>
      <div
        ref={ref}
        className={`bg-white dark:bg-gray-700 p-3 rounded-md shadow-sm cursor-pointer 
          hover:shadow-md transition-shadow
          ${isDragging ? 'opacity-50' : ''}`}
        onClick={handleClick}
      >
        {/* Task content */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-gray-900 dark:text-gray-100">{task.title}</h3>
          <div className="w-2 h-2 bg-gray-300 dark:bg-gray-500 rounded-full cursor-grab active:cursor-grabbing" />
        </div>

        {/* Description preview */}
        {task.description && (
          <p className="text-xs text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Priority indicator */}
        {task.priority && (
          <div className="flex items-center gap-1 mb-2">
            <span 
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: getPriorityColor(task.priority) }}
            />
            <span className="text-xs capitalize text-gray-600 dark:text-gray-400">
              {task.priority}
            </span>
          </div>
        )}

        {task.labels && task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {task.labels.map((label: string) => (
              <span
                key={label}
                className="px-2 py-0.5 text-xs rounded-full"
                style={{ backgroundColor: getLabelColor(label) + '20', color: getLabelColor(label) }}
              >
                {label}
              </span>
            ))}
          </div>
        )}

        {totalSubtasks > 0 && (
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center">
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 mr-2">
              <div 
                className="bg-blue-500 h-1.5 rounded-full" 
                style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
              ></div>
            </div>
            {completedSubtasks}/{totalSubtasks}
          </div>
        )}
      </div>

      <TaskDetailModal
        task={task}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDelete={onDelete}
        onUpdate={handleUpdateTask}
      />
    </>
  );
};
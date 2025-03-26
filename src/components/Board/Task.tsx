//src/components/Task.tsx
import { Draggable } from 'react-beautiful-dnd'
import { useState } from 'react'
import { TaskDetailModal } from './TaskDetailModal'

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
  onUpdate?: (taskId: string, updates: Partial<TaskProps['task']>) => void;
  onDelete?: (taskId: string) => void;
}

export const Task = ({ task, index, onUpdate, onDelete }: TaskProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!task || !task._id) {
    console.error('Invalid task data:', task);
    return null;
  }

  const totalSubtasks = task.subtasks?.length || 0;
  const completedSubtasks = task.subtasks?.filter(subtask => subtask.completed).length || 0;

  const handleClick = (e: React.MouseEvent) => {
    // Prevent opening modal when dragging
    if (e.defaultPrevented) return;
    setIsModalOpen(true);
  };

  return (
    <>
      <Draggable draggableId={task._id.toString()} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`bg-white dark:bg-gray-700 p-3 rounded-md shadow-sm cursor-pointer 
              hover:shadow-md transition-shadow
              ${snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-500 opacity-90' : ''}`}
            onClick={handleClick}
          >
            <div 
              {...provided.dragHandleProps}
              className="flex items-center justify-between mb-2"
            >
              <h3 className="font-medium text-gray-900 dark:text-gray-100">{task.title}</h3>
              <div className="w-2 h-2 bg-gray-300 dark:bg-gray-500 rounded-full cursor-grab active:cursor-grabbing" />
            </div>

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
            {task.priority && (
              <div className={`inline-flex items-center mt-2 ${getPriorityColor(task.priority)} px-2 py-0.5 rounded text-white text-xs`}>
                {task.priority}
              </div>
            )}
            {totalSubtasks > 0 && (
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {completedSubtasks} of {totalSubtasks} subtasks
              </div>
            )}
          </div>
        )}
      </Draggable>

      <TaskDetailModal
        task={task}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </>
  );
};

const getLabelColor = (label: string) => {
  const colors: { [key: string]: string } = {
    Design: '#ef4444',
    Development: '#2563eb',
    Testing: '#16a34a',
    Urgent: '#eab308',
    Bug: '#dc2626',
    Feature: '#8b5cf6',
    Documentation: '#0ea5e9'
  }
  return colors[label] || '#64748b'
}

const getPriorityColor = (priority: string) => {
  const colors: { [key: string]: string } = {
    urgent: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500'
  }
  return colors[priority?.toLowerCase()] || 'bg-gray-500'
}
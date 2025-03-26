//src/components/board.index.tsx
import { useState, useEffect, useCallback } from 'react';
import Column from './Column';
import { Button } from '../ui/Button';
import { PlusIcon } from '@heroicons/react/24/outline';
import { LoadingSpinnerBoard } from './LoadingSpinnerBoard';
import { DragDropProvider } from '../../lib/dnd-provider';

// Define your interfaces
interface Task {
  _id: string;
  title: string;
  description?: string;
  priority?: string;
  labels?: string[];
}

interface Column {
  _id: string;
  title: string;
  tasks: Task[];
}

interface Board {
  _id: string;
  name: string;
  columns: Column[];
}

interface BoardProps {
  boardId: string;
}

const Board = ({ boardId }: BoardProps) => {
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editingColumnTitle, setEditingColumnTitle] = useState('');
  const [isReordering, setIsReordering] = useState(false);

  // Fetch board data
  useEffect(() => {
    if (!boardId) return;

    const fetchBoard = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/boards/${boardId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch board');
        }
        const data = await response.json();
        if (!data.data.columns) {
          data.data.columns = [];
        }
        setBoard(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchBoard();
  }, [boardId]);

  // Move these functions inside the component
  const moveColumn = useCallback(
    async (dragIndex: number, hoverIndex: number) => {
      if (!board) return;
      
      const newColumns = [...board.columns];
      const draggedColumn = newColumns[dragIndex];
      
      // Remove the dragged column
      newColumns.splice(dragIndex, 1);
      // Insert it at the new position
      newColumns.splice(hoverIndex, 0, draggedColumn);
      
      // Update local state immediately for responsive UI
      setBoard({ ...board, columns: newColumns });
      
      // Send update to server
      const columnIds = newColumns.map(col => col._id);
      try {
        await fetch(`/api/columns/reorder`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ boardId, columnIds }),
        });
      } catch (error) {
        console.error('Error reordering columns:', error);
      }
    },
    [board, boardId]
  );

  const moveTask = useCallback(
    async (
      taskId: string,
      sourceColumnId: string,
      destinationColumnId: string,
      sourceIndex: number,
      destinationIndex: number
    ) => {
      if (!board) return;
      
      const sourceColumn = board.columns.find(col => col._id === sourceColumnId);
      const destColumn = board.columns.find(col => col._id === destinationColumnId);
      
      if (!sourceColumn || !destColumn) return;
      
      // Create new arrays for the tasks
      const sourceTasks = Array.from(sourceColumn.tasks);
      const destTasks = sourceColumnId === destinationColumnId 
        ? sourceTasks 
        : Array.from(destColumn.tasks);
      
      // Remove from source
      const [movedTask] = sourceTasks.splice(sourceIndex, 1);
      
      // Add to destination
      if (sourceColumnId === destinationColumnId) {
        sourceTasks.splice(destinationIndex, 0, movedTask);
      } else {
        destTasks.splice(destinationIndex, 0, movedTask);
      }
      
      // Create updated columns
      const updatedColumns = board.columns.map(col => {
        if (col._id === sourceColumnId) {
          return { ...col, tasks: sourceTasks };
        }
        if (col._id === destinationColumnId && sourceColumnId !== destinationColumnId) {
          return { ...col, tasks: destTasks };
        }
        return col;
      });
      
      // Update local state
      setBoard({ ...board, columns: updatedColumns });
      
      // Send update to server
      try {
        await fetch(`/api/tasks/${taskId}/move`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceColumnId,
            destinationColumnId,
            destinationIndex,
          }),
        });
      } catch (error) {
        console.error('Error moving task:', error);
      }
    },
    [board]
  );

  const handleDragEnd = async (result: DropResult) => {
    setIsReordering(true);
    try {
      const { destination, source, type, draggableId } = result;
  
      // If no destination or dropped in same position, do nothing
      if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
        return;
      }
  
      // Handle column reordering
      if (type === 'column') {
        const newColumns = Array.from(board!.columns);
        const [movedColumn] = newColumns.splice(source.index, 1);
        newColumns.splice(destination.index, 0, movedColumn);
        
        // Update local state immediately for responsive UI
        setBoard({ ...board!, columns: newColumns });
        
        // Send update to server
        const columnIds = newColumns.map(col => col._id);
        await fetch(`/api/columns/reorder`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ boardId, columnIds }),
        });
      } 
      // Handle task reordering
      else if (type === 'task') {
        const sourceColumn = board!.columns.find(col => col._id === source.droppableId);
        const destColumn = board!.columns.find(col => col._id === destination.droppableId);
        
        if (!sourceColumn || !destColumn) return;
        
        // Get the task that was moved
        const taskId = draggableId;
        
        // Create new arrays for the tasks
        const sourceTasks = Array.from(sourceColumn.tasks);
        const destTasks = sourceColumn._id === destColumn._id 
          ? sourceTasks 
          : Array.from(destColumn.tasks);
        
        // Remove from source
        const [movedTask] = sourceTasks.splice(source.index, 1);
        
        // Add to destination
        if (sourceColumn._id === destColumn._id) {
          sourceTasks.splice(destination.index, 0, movedTask);
        } else {
          destTasks.splice(destination.index, 0, movedTask);
        }
        
        // Create updated columns
        const updatedColumns = board!.columns.map(col => {
          if (col._id === sourceColumn._id) {
            return { ...col, tasks: sourceTasks };
          }
          if (col._id === destColumn._id && sourceColumn._id !== destColumn._id) {
            return { ...col, tasks: destTasks };
          }
          return col;
        });
        
        // Update local state
        setBoard({ ...board!, columns: updatedColumns });
        
        // Send update to server
        await fetch(`/api/tasks/${taskId}/move`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceColumnId: sourceColumn._id,
            destinationColumnId: destColumn._id,
            destinationIndex: destination.index,
          }),
        });
      }
    } catch (error) {
      console.error('Error during drag and drop:', error);
      // Optionally refresh the board to ensure UI is in sync with server
      // fetchBoard();
    } finally {
      setIsReordering(false);
    }
  };

  const updateTaskOrder = async (
    sourceColumn: Column,
    destColumn: Column,
    source: { index: number },
    destination: { index: number },
    taskId: string
  ) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/move`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceColumnId: sourceColumn._id,
          destinationColumnId: destColumn._id,
          destinationIndex: destination.index,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update task order');
      }
    } catch (err) {
      console.error('Error updating task order:', err);
      alert('Failed to update task order');
    }
  };

  const updateColumnOrder = async (columns: Column[]) => {
    try {
      await fetch(`/api/columns/order`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ columns }),
      });
    } catch (err) {
      console.error('Error updating column order:', err);
      alert('Failed to update column order.');
    }
  };

  const handleAddColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColumnTitle.trim() || !board) return;

    try {
      const response = await fetch(`/api/columns?boardId=${boardId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newColumnTitle }),
      });

      if (!response.ok) {
        throw new Error('Failed to create column');
      }

      const result = await response.json();
      const newColumn = { ...result.data, tasks: [] };
      setBoard({ ...board, columns: [...board.columns, newColumn] });
      setNewColumnTitle('');
      setIsAddingColumn(false);
    } catch (err) {
      console.error('Error adding column:', err);
      alert(err instanceof Error ? err.message : 'Failed to create column');
    }
  };

  const handleTaskCreated = (columnId: string, newTask: Task) => {
    if (!board) return;

    const updatedColumns = board.columns.map((column) => {
      if (column._id === columnId) {
        return { ...column, tasks: [...column.tasks, newTask] };
      }
      return column;
    });

    setBoard({ ...board, columns: updatedColumns });
  };

  const handleDeleteColumn = async (columnId: string) => {
    if (!board) return;

    if (!confirm('Are you sure you want to delete this column and all its tasks?')) {
      return;
    }

    try {
      const response = await fetch(`/api/columns`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ columnId, boardId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete column');
      }

      const updatedColumns = board.columns.filter((column) => column._id !== columnId);
      setBoard({ ...board, columns: updatedColumns });
    } catch (err) {
      console.error('Error deleting column:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete column');
    }
  };

  const handleEditColumn = (columnId: string, currentTitle: string) => {
    setEditingColumnId(columnId);
    setEditingColumnTitle(currentTitle);
  };

  const handleUpdateColumnTitle = async (columnId: string) => {
    if (!board || !editingColumnTitle.trim()) return;

    try {
      const response = await fetch(`/api/columns`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ columnId, boardId, title: editingColumnTitle.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to update column title');
      }

      const updatedColumns = board.columns.map((column) => {
        if (column._id === columnId) {
          return { ...column, title: editingColumnTitle.trim() };
        }
        return column;
      });

      setBoard({ ...board, columns: updatedColumns });
      setEditingColumnId(null);
      setEditingColumnTitle('');
    } catch (err) {
      console.error('Error updating column title:', err);
      alert(err instanceof Error ? err.message : 'Failed to update column title');
    }
  };

  // Loading, error, and empty states
  if (loading) {
    return <LoadingSpinnerBoard size="lg" message="Loading your board..." />;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!board) {
    return <div>Board not found</div>;
  }

  // Main render
  return (
    <div className="h-screen w-screen overflow-auto fixed top-0 left-0 z-10 bg-white dark:bg-gray-900">
      {isReordering && <LoadingSpinnerBoard size="sm" message="Reordering..." />}
      <div className="p-4 h-full">
        <h1 className="text-2xl font-bold mb-4">{board?.name}</h1>
        <DragDropProvider>
          <div className="flex gap-4 overflow-x-auto min-h-[calc(100vh-8rem)] pb-8">
            {board.columns.map((column, index) => (
              <Column
                key={column._id}
                column={column}
                index={index}
                boardId={boardId}
                onTaskCreated={handleTaskCreated}
                onDeleteColumn={handleDeleteColumn}
                onEditColumn={handleEditColumn}
                onUpdateColumnTitle={handleUpdateColumnTitle}
                isEditing={editingColumnId === column._id}
                editingTitle={editingColumnTitle}
                onEditingTitleChange={setEditingColumnTitle}
                moveColumn={moveColumn}
                moveTask={moveTask}
              />
            ))}
            
            <div className="flex-shrink-0 w-80">
              {!isAddingColumn ? (
                <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-3">
                  <Button
                    onClick={() => setIsAddingColumn(true)}
                    className="flex items-center w-full h-12 justify-center"
                    variant="outline"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add Column
                  </Button>
                </div>
              ) : (
                <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-3">
                  <form onSubmit={handleAddColumn} className="flex flex-col">
                    <input
                      type="text"
                      value={newColumnTitle}
                      onChange={(e) => setNewColumnTitle(e.target.value)}
                      placeholder="Column title"
                      className="p-2 border rounded mb-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      autoFocus
                    />
                    <div className="flex space-x-2">
                      <Button type="submit" size="sm">
                        Add
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsAddingColumn(false);
                          setNewColumnTitle('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </DragDropProvider>
      </div>
    </div>
  );
};

export default Board;

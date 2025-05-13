// src/components/board.index.tsx
import { useState, useEffect, useCallback } from 'react';
import Column from './Column';
import { Button } from '../ui/Button';
import { PlusIcon } from '@heroicons/react/24/outline';
import { LoadingSpinnerBoard } from './LoadingSpinnerBoard';
import { DragDropProvider } from '../../lib/dnd-provider';
import { Task, Column, Board, BoardProps, DropResult } from '../../types/boardTypes';



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

  // Helper function to update column order
  const updateColumnsOrder = (columns: Column[], dragIndex: number, hoverIndex: number) => {
    const newColumns = [...columns];
    const [movedColumn] = newColumns.splice(dragIndex, 1);
    newColumns.splice(hoverIndex, 0, movedColumn);
    return newColumns;
  };

  // Helper function to update task position
  const updateTaskPosition = (
    columns: Column[],
    sourceColumnId: string,
    destColumnId: string,
    sourceIndex: number,
    destinationIndex: number,
    taskId: string
  ) => {
    const sourceColumn = columns.find(col => col._id === sourceColumnId);
    const destColumn = columns.find(col => col._id === destColumnId);
    
    if (!sourceColumn || !destColumn) return columns;

    const sourceTasks = [...sourceColumn.tasks];
    const destTasks = sourceColumnId === destColumnId ? sourceTasks : [...destColumn.tasks];
    
    const [movedTask] = sourceTasks.splice(sourceIndex, 1);
    if (sourceColumnId === destColumnId) {
      sourceTasks.splice(destinationIndex, 0, movedTask);
    } else {
      destTasks.splice(destinationIndex, 0, movedTask);
    }

    return columns.map(col => {
      if (col._id === sourceColumnId) return { ...col, tasks: sourceTasks };
      if (col._id === destColumnId) return { ...col, tasks: destTasks };
      return col;
    });
  };

  // Refactored moveColumn function
  const moveColumn = useCallback(
    async (dragIndex: number, hoverIndex: number) => {
      if (!board) return;
      
      const newColumns = updateColumnsOrder(board.columns, dragIndex, hoverIndex);
      setBoard({ ...board, columns: newColumns });
      
      try {
        await fetch(`/api/columns/reorder`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            boardId, 
            columnIds: newColumns.map(col => col._id) 
          }),
        });
      } catch (error) {
        // Remove console.error statement
      }
    },
    [board, boardId]
  );

  // Refactored moveTask function
  const moveTask = useCallback(
    async (
      taskId: string,
      sourceColumnId: string,
      destinationColumnId: string,
      sourceIndex: number,
      destinationIndex: number
    ) => {
      if (!board) return;
      
      const updatedColumns = updateTaskPosition(
        board.columns,
        sourceColumnId,
        destinationColumnId,
        sourceIndex,
        destinationIndex,
        taskId
      );
      
      setBoard({ ...board, columns: updatedColumns });
      
      try {
        await fetch(`/api/tasks/${taskId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceColumnId,
            destinationColumnId,
            destinationIndex,
          }),
        });
      } catch (error) {
        // Remove console.error statement
      }
    },
    [board]
  );

  // Refactored handleDragEnd function
  const handleDragEnd = async (result: DropResult) => {
    setIsReordering(true);
    try {
      const { destination, source, type, draggableId } = result;
  
      if (!destination || (destination.droppableId === source.droppableId && 
                          destination.index === source.index)) {
        setIsReordering(false);
        return;
      }
  
      if (type === 'column') {
        const newColumns = updateColumnsOrder(board!.columns, source.index, destination.index);
        setBoard({ ...board!, columns: newColumns });
        
        await fetch(`/api/columns/reorder`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            boardId, 
            columnIds: newColumns.map(col => col._id) 
          }),
        });
      } 
      else if (type === 'task') {
        const updatedColumns = updateTaskPosition(
          board!.columns,
          source.droppableId,
          destination.droppableId,
          source.index,
          destination.index,
          draggableId
        );
        
        setBoard({ ...board!, columns: updatedColumns });
        
        await fetch(`/api/tasks/${draggableId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceColumnId: source.droppableId,
            destinationColumnId: destination.droppableId,
            destinationIndex: destination.index,
          }),
        });
      }
    } catch (error) {
      console.error('Error during drag and drop:', error);
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
        const response = await fetch(`/api/tasks/${taskId}`, {
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
      // Remove console.error statement
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
    <div className="h-full w-full overflow-auto bg-white dark:bg-gray-900">
      {isReordering && (
        <div className="fixed inset-0 bg-black bg-opacity-20 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
            <LoadingSpinnerBoard size="sm" message="Reordering..." />
          </div>
        </div>
      )}
      <div className="p-4 h-full">
        <h1 className="text-2xl font-bold mb-4">{board?.name}</h1>
        <DragDropProvider>
          <div className="flex gap-4 overflow-x-auto min-h-[calc(100vh-12rem)] pb-8">
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

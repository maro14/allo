//src/components/board.index.tsx
import { useState, useEffect } from 'react';
import { DragDropContext, DropResult, Droppable } from 'react-beautiful-dnd';
import Column from './Column';
import { Button } from '../ui/Button';
import { PlusIcon } from '@heroicons/react/24/outline';
import { LoadingSpinnerBoard } from './LoadingSpinnerBoard';

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

  const reorderTasks = (
    sourceColumn: Column,
    destColumn: Column,
    source: { index: number },
    destination: { index: number }
  ): Column[] => {
    const sourceTasks = Array.from(sourceColumn.tasks);
    const destTasks = Array.from(destColumn.tasks);
    const [movedTask] = sourceTasks.splice(source.index, 1);

    if (sourceColumn._id === destColumn._id) {
      sourceTasks.splice(destination.index, 0, movedTask);
      return board!.columns.map((col) =>
        col._id === sourceColumn._id ? { ...col, tasks: sourceTasks } : col
      );
    } else {
      destTasks.splice(destination.index, 0, movedTask);
      return board!.columns.map((col) => {
        if (col._id === sourceColumn._id) return { ...col, tasks: sourceTasks };
        if (col._id === destColumn._id) return { ...col, tasks: destTasks };
        return col;
      });
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    setIsReordering(true);
    try {
      const { destination, source, type } = result;

      if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
        return;
      }

      if (type === 'column') {
        const newColumns = Array.from(board!.columns);
        const [movedColumn] = newColumns.splice(source.index, 1);
        newColumns.splice(destination.index, 0, movedColumn);
        setBoard({ ...board!, columns: newColumns });
        await updateColumnOrder(newColumns);
      } else {
        const sourceColumn = board!.columns.find((col) => col._id === source.droppableId);
        const destColumn = board!.columns.find((col) => col._id === destination.droppableId);
        if (!sourceColumn || !destColumn) return;

        const updatedColumns = reorderTasks(sourceColumn, destColumn, source, destination);
        setBoard({ ...board!, columns: updatedColumns });
        await updateTaskOrder(sourceColumn, destColumn, source, destination);
      }
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

  if (loading) {
    return <LoadingSpinnerBoard size="lg" message="Loading your board..." />;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!board) {
    return <div>Board not found</div>;
  }

  return (
    <>
      {isReordering && <LoadingSpinnerBoard size="sm" message="Reordering..." />}
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">{board?.name}</h1>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="board" direction="horizontal" type="column">
            {(provided) => (
              <div 
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="flex gap-4 overflow-x-auto min-h-[calc(100vh-12rem)]"
              >
                {board?.columns.map((column, index) => (
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
                    editingTitle={editingColumnId === column._id ? editingColumnTitle : ''}
                    onEditingTitleChange={setEditingColumnTitle}
                  />
                ))}
                {provided.placeholder}
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
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </>
  );
};

export default Board;

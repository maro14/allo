// src/components/Board/index.tsx
import { useState, useEffect, useCallback } from 'react';
import Column from './Column';
import AddColumn from './AddColumn';
import BoardHeader from './BoardHeader';
import { LoadingSpinnerBoard } from './LoadingSpinnerBoard';
import { DragDropProvider } from '../../lib/dnd-provider';
import { Task, Board, BoardProps, DropResult } from '../../types/boardTypes';
import { updateColumnsOrder, updateTaskPosition } from './boardUtils';
import { boardService } from '../../services/boardService';

const Board = ({ boardId }: BoardProps) => {
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editingColumnTitle, setEditingColumnTitle] = useState('');
  const [isReordering, setIsReordering] = useState(false);

  // Fetch board data
  useEffect(() => {
    if (!boardId) return;

    const fetchBoardData = async () => {
      try {
        setLoading(true);
        const data = await boardService.fetchBoard(boardId);
        setBoard(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchBoardData();
  }, [boardId]);

  // Refactored moveColumn function
  const moveColumn = useCallback(
    async (dragIndex: number, hoverIndex: number) => {
      if (!board) return;
      
      const newColumns = updateColumnsOrder(board.columns, dragIndex, hoverIndex);
      setBoard({ ...board, columns: newColumns });
      
      try {
        await boardService.updateColumnOrder(boardId, newColumns.map(col => col._id));
      } catch (error) {
        // Error handling could be improved here
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
      
      // Update the UI immediately for a responsive feel
      const updatedColumns = updateTaskPosition(
        board.columns,
        sourceColumnId,
        destinationColumnId,
        sourceIndex,
        destinationIndex,
        taskId
      );
      
      // Update local state with the new column arrangement
      setBoard({ ...board, columns: updatedColumns });
      
      try {
        // Persist the changes to the server
        await boardService.updateTaskPosition(
          taskId,
          sourceColumnId,
          destinationColumnId,
          destinationIndex
        );
      } catch (error) {
        // Error handling could be improved here
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
        
        // Persist column order to the server
        await boardService.updateColumnOrder(boardId, newColumns.map(col => col._id));
      } 
      // Handle task movement
      else if (type === 'task') {
        const updatedColumns = updateTaskPosition(
          board!.columns,
          source.droppableId,
          destination.droppableId,
          source.index,
          destination.index,
          draggableId
        );
        
        // Update UI immediately
        setBoard({ ...board!, columns: updatedColumns });
        
        // Persist task position to the server
        await boardService.updateTaskPosition(
          draggableId,
          source.droppableId,
          destination.droppableId,
          destination.index
        );
      }
    } catch (error) {
      console.error('Error during drag and drop:', error);
    } finally {
      setIsReordering(false);
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
      await boardService.deleteColumn(columnId, boardId);
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
      await boardService.updateColumnTitle(columnId, boardId, editingColumnTitle.trim());
      
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

  const handleColumnAdded = (newColumn: any) => {
    if (!board) return;
    setBoard({ ...board, columns: [...board.columns, newColumn] });
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
        <BoardHeader boardName={board.name} />
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
            
            <AddColumn 
              boardId={boardId} 
              onColumnAdded={handleColumnAdded} 
            />
          </div>
        </DragDropProvider>
      </div>
    </div>
  );
};

export default Board;

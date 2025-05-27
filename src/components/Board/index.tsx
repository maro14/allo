// src/components/Board/index.tsx
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast'; // Added
import Column from './Column';
import AddColumn from './AddColumn';
import BoardHeader from './BoardHeader';
import { LoadingSpinnerBoard } from './LoadingSpinnerBoard';
import { DragDropProvider } from '../../lib/dnd-provider';
import { Task, Board, BoardProps, DropResult } from '../../types/boardTypes';
import { updateColumnsOrder, updateTaskPosition } from './boardUtils';
import { boardService } from '../../services/boardService';

// Added toastStyle (consider moving to a shared utility if used elsewhere)
const toastStyle = {
  style: {
    border: '1px solid #D1D5DB', // gray-300
    padding: '12px',
    color: '#1F2937', // gray-800
    backgroundColor: '#F9FAFB', // gray-50
  },
  iconTheme: {
    primary: '#EF4444', // red-500
    secondary: '#F9FAFB', // gray-50
  },
};

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
      
      const originalColumns = board.columns;
      const newColumns = updateColumnsOrder(board.columns, dragIndex, hoverIndex);
      setBoard({ ...board, columns: newColumns });
      
      try {
        await boardService.updateColumnOrder(boardId, newColumns.map(col => col._id));
      } catch (error) {
        setBoard({ ...board, columns: originalColumns }); // Revert on error
        toast.error(error instanceof Error ? error.message : 'Failed to reorder column.', toastStyle);
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
      
      const originalColumns = board.columns;
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
        setBoard({ ...board, columns: originalColumns }); // Revert on error
        toast.error(error instanceof Error ? error.message : 'Failed to move task.', toastStyle);
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

    // Consider replacing confirm with a custom modal component for better UX
    if (!confirm('Are you sure you want to delete this column and all its tasks?')) {
      return;
    }

    const originalColumns = board.columns;
    try {
      await boardService.deleteColumn(columnId, boardId);
      const updatedColumns = board.columns.filter((column) => column._id !== columnId);
      setBoard({ ...board, columns: updatedColumns });
      toast.success('Column deleted successfully.', toastStyle);
    } catch (err) {
      setBoard({ ...board, columns: originalColumns }); // Revert on error
      toast.error(err instanceof Error ? err.message : 'Failed to delete column.', toastStyle);
    }
  };

  const handleEditColumn = (columnId: string, currentTitle: string) => {
    setEditingColumnId(columnId);
    setEditingColumnTitle(currentTitle);
  };

  const handleUpdateColumnTitle = async (columnId: string) => {
    if (!board || !editingColumnTitle.trim()) return;

    const originalColumns = board.columns;
    const columnToUpdate = originalColumns.find(col => col._id === columnId);
    const originalTitle = columnToUpdate ? columnToUpdate.title : '';

    try {
      // Optimistically update UI
      const updatedColumnsOptimistic = board.columns.map((column) => {
        if (column._id === columnId) {
          return { ...column, title: editingColumnTitle.trim() };
        }
        return column;
      });
      setBoard({ ...board, columns: updatedColumnsOptimistic });
      setEditingColumnId(null);
      setEditingColumnTitle('');

      await boardService.updateColumnTitle(columnId, boardId, editingColumnTitle.trim());
      toast.success('Column title updated.', toastStyle);      
    } catch (err) {
      // Revert UI on error
      const revertedColumns = board.columns.map((column) => {
        if (column._id === columnId) {
          return { ...column, title: originalTitle }; // Revert to original title
        }
        return column;
      });
      setBoard({ ...board, columns: revertedColumns });
      setEditingColumnId(columnId); // Optionally re-open editing mode or just show error
      setEditingColumnTitle(originalTitle);

      toast.error(err instanceof Error ? err.message : 'Failed to update column title.', toastStyle);
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

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
        // Ensure board has columns array even if API doesn't provide it
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

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId, type } = result;
    
    console.log('Drag end result:', { destination, source, draggableId, type });
    
    if (!destination || 
        (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }
    
    if (!board) return;
    
    if (type === 'column') {
      const newColumns = Array.from(board.columns);
      const [movedColumn] = newColumns.splice(source.index, 1);
      newColumns.splice(destination.index, 0, movedColumn);
    
      setBoard({ ...board, columns: newColumns });
    
      try {
        await fetch(`/api/boards/${boardId}/columns/reorder`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ columnIds: newColumns.map(col => col._id) })
        });
      } catch (err) {
        console.error('Failed to reorder columns:', err);
      }
      
      return;
    }
    
    const sourceColumn = board.columns.find(col => col._id.toString() === source.droppableId);
    const destColumn = board.columns.find(col => col._id.toString() === destination.droppableId);
    
    if (!sourceColumn || !destColumn) {
      console.error('Could not find columns:', { 
        sourceId: source.droppableId, 
        destId: destination.droppableId,
        columns: board.columns.map(c => ({ id: c._id, title: c.title }))
      });
      return;
    }
    
    if (sourceColumn._id === destColumn._id) {
      const newTasks = Array.from(sourceColumn.tasks);
      const [movedTask] = newTasks.splice(source.index, 1);
      newTasks.splice(destination.index, 0, movedTask);
    
      const newColumns = board.columns.map(col => 
         col._id === sourceColumn._id ? { ...col, tasks: newTasks } : col
      );
    
      setBoard({ ...board, columns: newColumns });
    
      try {
        await fetch(`/api/tasks/reorder`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            columnId: sourceColumn._id, 
            taskIds: newTasks.map(task => task._id) 
          })
        });
      } catch (err) {
        console.error('Failed to reorder tasks:', err);
      }
    } else {
      const sourceTasks = Array.from(sourceColumn.tasks);
      const destTasks = Array.from(destColumn.tasks);
      const [movedTask] = sourceTasks.splice(source.index, 1);
      destTasks.splice(destination.index, 0, movedTask);
    
      const newColumns = board.columns.map(col => {
        if (col._id === sourceColumn._id) return { ...col, tasks: sourceTasks };
        if (col._id === destColumn._id) return { ...col, tasks: destTasks };
        return col;
      });
    
      setBoard({ ...board, columns: newColumns });
    
      try {
        await fetch(`/api/tasks/${movedTask._id}/move`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            sourceColumnId: sourceColumn._id,
            destinationColumnId: destColumn._id,
            destinationIndex: destination.index
          })
        });
      } catch (err) {
        console.error('Failed to move task between columns:', err);
      }
    }
  };
  
  const handleAddColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newColumnTitle.trim() || !board) return;
    
    try {
      console.log('Creating column with title:', newColumnTitle, 'for board:', boardId);
      
      const response = await fetch(`/api/columns?boardId=${boardId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newColumnTitle })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Server response:', response.status, errorData);
        throw new Error(errorData.error || `Failed to create column (${response.status})`);
      }
      
      const result = await response.json();
      console.log('Column created successfully:', result);
      
      // Make sure we're adding the column with the correct structure
      const newColumn = {
        ...result.data,
        tasks: [] // Ensure tasks is initialized as an empty array
      };
      
      setBoard({ 
        ...board, 
        columns: [...board.columns, newColumn] 
      });
      
      setNewColumnTitle('');
      setIsAddingColumn(false);
    } catch (err) {
      console.error('Error adding column:', err);
      alert(err instanceof Error ? err.message : 'Failed to create column');
    }
  };
  
  const handleTaskCreated = (columnId: string, newTask: Task) => {
    if (!board) return;
    
    console.log('Task created in column:', columnId, 'Task:', newTask);
    
    const updatedColumns = board.columns.map(column => {
      if (column._id.toString() === columnId) {
        return {
          ...column,
          tasks: [...column.tasks, newTask]
        };
      }
      return column;
    });
    
    setBoard({
      ...board,
      columns: updatedColumns
    });
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
        body: JSON.stringify({ columnId, boardId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete column');
      }
      
      // Update board state by removing the deleted column
      const updatedColumns = board.columns.filter(column => column._id !== columnId);
      setBoard({
        ...board,
        columns: updatedColumns
      });
      
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
        body: JSON.stringify({ 
          columnId, 
          boardId, 
          title: editingColumnTitle.trim() 
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update column title');
      }
      
      // Update board state with the new column title
      const updatedColumns = board.columns.map(column => {
        if (column._id === columnId) {
          return { ...column, title: editingColumnTitle.trim() };
        }
        return column;
      });
      
      setBoard({
        ...board,
        columns: updatedColumns
      });
      
      // Reset editing state
      setEditingColumnId(null);
      setEditingColumnTitle('');
      
    } catch (err) {
      console.error('Error updating column title:', err);
      alert(err instanceof Error ? err.message : 'Failed to update column title');
    }
  };

  // Render loading state
  if (loading) {
    return <LoadingSpinnerBoard size="lg" message="Loading your board..." />;
  }

  // Render error state
  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  // Render empty state if no board
  if (!board) {
    return <div>Board not found</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{board.name}</h1>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex space-x-4 overflow-x-auto pb-4">
          <Droppable droppableId="all-columns" direction="horizontal" type="column">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="flex space-x-4"
              >
                {Array.isArray(board.columns) ? board.columns.map((column, index) => (
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
                )) : null}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
          
          {/* Add column form */}
          <div className="flex-shrink-0 w-80">
            {!isAddingColumn ? (
              <Button onClick={() => setIsAddingColumn(true)} className="flex items-center w-full h-12 justify-center" variant="outline">
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Column
              </Button>
            ) : (
              <form onSubmit={handleAddColumn} className="flex flex-col">
                <input
                  type="text"
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  placeholder="Column title"
                  className="p-2 border rounded mb-2"
                  autoFocus
                />
                <div className="flex space-x-2">
                  <Button type="submit" size="sm">Add</Button>
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
            )}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
};

export default Board;

import { useState, useEffect } from 'react';
import { DragDropContext, DropResult, Droppable } from 'react-beautiful-dnd';
import Column from './Column';
import { Button } from '../ui/Button';
import { PlusIcon } from '@heroicons/react/24/outline';

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
        setBoard(data);
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
      
      const newColumn = await response.json();
      console.log('Column created successfully:', newColumn);
      
      setBoard({ ...board, columns: [...board.columns, { ...newColumn, tasks: [] }] });
      
      setNewColumnTitle('');
      setIsAddingColumn(false);
    } catch (err) {
      console.error('Error adding column:', err);
      alert(err instanceof Error ? err.message : 'Failed to create column');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>Error: {error}</p>
        <Button variant="outline" onClick={() => window.location.reload()} className="mt-2">
          Try Again
        </Button>
      </div>
    );
  }

  if (!board) {
    return <div>No board found</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{board.name}</h1>
        <Button onClick={() => setIsAddingColumn(true)} className="flex items-center" size="sm">
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Column
        </Button>
      </div>

      {isAddingColumn && (
        <form onSubmit={handleAddColumn} className="mb-6 flex items-center">
          <input
            type="text"
            value={newColumnTitle}
            onChange={(e) => setNewColumnTitle(e.target.value)}
            placeholder="Column title"
            className="p-2 border rounded mr-2 flex-grow"
            autoFocus
          />
          <Button type="submit" size="sm">Add</Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => {
              setIsAddingColumn(false);
              setNewColumnTitle('');
            }} className="ml-2">
            Cancel
          </Button>
        </form>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable
          droppableId="columns"
          direction="horizontal"
          type="column"
          isDropDisabled={false} // <-- Explicitly set isDropDisabled to false
        >
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex space-x-4 overflow-x-auto pb-4"
            >
              {board.columns.map((column, index) => (
                <Column
                  key={column._id.toString()}
                  column={{
                    ...column,
                    _id: column._id.toString(),
                    tasks: column.tasks.map((task) => ({
                      ...task,
                      _id: task._id.toString()
                    }))
                  }}
                  index={index}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

    </div>
  );
};

export default Board;

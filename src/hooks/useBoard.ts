// src/hooks/useBoard.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
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
  boardId: string;
  position: number;
}

interface Board {
  _id: string;
  name: string;
  columns: Column[];
  userId: string;
}

// Fetch a board by ID
export const useBoard = (boardId: string) => {
  return useQuery({
    queryKey: ['board', boardId],
    queryFn: async (): Promise<Board> => {
      const res = await fetch(`/api/boards/${boardId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch board');
      }
      const data = await res.json();
      return data.data;
    },
    enabled: !!boardId,
  });
};

// Fetch just the board name (for page title)
export const useBoardName = (boardId: string) => {
  return useQuery({
    queryKey: ['boardName', boardId],
    queryFn: async (): Promise<{ name: string }> => {
      const res = await fetch(`/api/boards/${boardId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch board');
      }
      return res.json();
    },
    select: (data) => ({ name: data.name }),
    enabled: !!boardId,
  });
};

// Reorder columns
export const useReorderColumns = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ boardId, columnIds }: { boardId: string; columnIds: string[] }) => {
      const res = await fetch(`/api/boards/${boardId}/columns/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ columnIds }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to reorder columns');
      }
      
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['board', variables.boardId] });
    },
  });
};

// Reorder tasks within a column
export const useReorderTasks = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ columnId, taskIds }: { columnId: string; taskIds: string[] }) => {
      const res = await fetch(`/api/tasks/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ columnId, taskIds }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to reorder tasks');
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board'] });
    },
  });
};

// Move task between columns
export const useMoveTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      taskId, 
      sourceColumnId, 
      destinationColumnId, 
      destinationIndex 
    }: { 
      taskId: string; 
      sourceColumnId: string; 
      destinationColumnId: string; 
      destinationIndex: number 
    }) => {
      const res = await fetch(`/api/tasks/${taskId}/move`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sourceColumnId,
          destinationColumnId,
          destinationIndex
        }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to move task');
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board'] });
    },
  });
};
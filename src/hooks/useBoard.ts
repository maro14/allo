// src/hooks/useBoard.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';

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
// Update the useBoard function to handle auth errors better
export const useBoard = (boardId: string) => {
  const router = useRouter();
  
  return useQuery({
    queryKey: ['board', boardId],
    queryFn: async (): Promise<Board> => {
      try {
        const res = await fetch(`/api/boards/${boardId}`);
        
        if (res.status === 401) {
          // Handle unauthorized specifically
          throw new Error('401: Your session has expired');
        }
        
        if (!res.ok) {
          throw new Error(`Failed to fetch board: ${res.status}`);
        }
        
        const data = await res.json();
        return data.data;
      } catch (error) {
        console.error('Board fetch error:', error);
        throw error;
      }
    },
    enabled: !!boardId,
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error instanceof Error && error.message.includes('401')) {
        return false;
      }
      // Retry other errors up to 3 times
      return failureCount < 3;
    }
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
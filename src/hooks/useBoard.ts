// src/hooks/useBoard.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';

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
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const boardQuery = useQuery({
    queryKey: ['board', boardId],
    queryFn: async (): Promise<Board> => {
      try {
        const res = await fetch(`/api/boards/${boardId}`);
        
        if (res.status === 401) {
          // Handle unauthorized specifically
          router.push('/login?error=session_expired');
          throw new Error('401: Your session has expired');
        }
        
        if (res.status === 404) {
          router.push('/boards?error=board_not_found');
          throw new Error('404: Board not found');
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
      // Don't retry on authentication or not found errors
      if (error instanceof Error && (error.message.includes('401') || error.message.includes('404'))) {
        return false;
      }
      // Retry other errors up to 3 times
      return failureCount < 3;
    }
  });

  // Update board mutation
  const updateBoard = useMutation({
    mutationFn: async (updates: Partial<Board>) => {
      const res = await fetch(`/api/boards/${boardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!res.ok) {
        throw new Error('Failed to update board');
      }
      
      return res.json();
    },
    onSuccess: () => {
      toast.success('Board updated successfully');
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      queryClient.invalidateQueries({ queryKey: ['boardName', boardId] });
    },
    onError: (error) => {
      toast.error(`Update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
  
  return {
    ...boardQuery,
    updateBoard: updateBoard.mutate,
    isUpdating: updateBoard.isPending,
    updateError: updateBoard.error
  };
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
      const data = await res.json();
      return { name: data.data.name };
    },
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
    onError: () => {
      toast.error('Failed to reorder columns');
    }
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
    onError: () => {
      toast.error('Failed to reorder tasks');
    }
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
    onError: () => {
      toast.error('Failed to move task');
    }
  });
};
// src/hooks/useBoards.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Board } from '../types/board';

// Cache keys
export const boardKeys = {
  all: ['boards'] as const,
  lists: () => [...boardKeys.all, 'list'] as const,
  list: (filters: string) => [...boardKeys.lists(), { filters }] as const,
  details: () => [...boardKeys.all, 'detail'] as const,
  detail: (id: string) => [...boardKeys.details(), id] as const,
};

export function useBoards() {
  const queryClient = useQueryClient();

  // Fetch all boards
  const fetchBoards = async (): Promise<Board[]> => {
    const response = await fetch('/api/boards');
    if (!response.ok) {
      throw new Error('Failed to fetch boards');
    }
    const data = await response.json();
    return data.data;
  };

  // Use query with prefetching capabilities
  const boardsQuery = useQuery({
    queryKey: boardKeys.lists(),
    queryFn: fetchBoards,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create a new board with optimistic updates
  const createBoardMutation = useMutation({
    mutationFn: async (newBoard: { name: string }): Promise<Board> => {
      const response = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBoard),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create board');
      }
      
      const data = await response.json();
      return data.data;
    },
    onMutate: async (newBoard) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: boardKeys.lists() });
      
      // Snapshot the previous value
      const previousBoards = queryClient.getQueryData(boardKeys.lists());
      
      // Optimistically update to the new value
      queryClient.setQueryData(boardKeys.lists(), (old: Board[] = []) => {
        const optimisticBoard = {
          _id: 'temp-id-' + Date.now(),
          name: newBoard.name,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return [...old, optimisticBoard];
      });
      
      return { previousBoards };
    },
    onError: (err, newBoard, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousBoards) {
        queryClient.setQueryData(boardKeys.lists(), context.previousBoards);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
    },
  });

  // Prefetch a board by ID
  const prefetchBoard = async (boardId: string) => {
    await queryClient.prefetchQuery({
      queryKey: boardKeys.detail(boardId),
      queryFn: async () => {
        const response = await fetch(`/api/boards/${boardId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch board');
        }
        const data = await response.json();
        return data.data;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  return {
    boards: boardsQuery.data || [],
    isLoading: boardsQuery.isLoading,
    isError: boardsQuery.isError,
    error: boardsQuery.error,
    createBoard: createBoardMutation.mutate,
    prefetchBoard,
  };
}
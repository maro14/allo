// src/hooks/useBoard.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Board } from '../types/board';
import { boardKeys } from './useBoards';

export function useBoard(boardId: string) {
  const queryClient = useQueryClient();

  // Fetch a single board
  const fetchBoard = async (): Promise<Board> => {
    const response = await fetch(`/api/boards/${boardId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch board');
    }
    const data = await response.json();
    return data.data;
  };

  // Use query with specific caching strategy
  const boardQuery = useQuery({
    queryKey: boardKeys.detail(boardId),
    queryFn: fetchBoard,
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
    enabled: !!boardId,
  });

  // Update board mutation with optimistic updates
  const updateBoardMutation = useMutation({
    mutationFn: async (updatedBoard: Partial<Board>): Promise<Board> => {
      const response = await fetch(`/api/boards/${boardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBoard),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update board');
      }
      
      const data = await response.json();
      return data.data;
    },
    onMutate: async (updatedBoard) => {
      await queryClient.cancelQueries({ queryKey: boardKeys.detail(boardId) });
      const previousBoard = queryClient.getQueryData(boardKeys.detail(boardId));
      queryClient.setQueryData(boardKeys.detail(boardId), (old: Board) => {
        return { ...old, ...updatedBoard, updatedAt: new Date().toISOString() };
      });
      return { previousBoard };
    },
    onError: (err, updatedBoard, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(boardKeys.detail(boardId), context.previousBoard);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
    },
  });

  return {
    board: boardQuery.data,
    isLoading: boardQuery.isLoading,
    isError: boardQuery.isError,
    error: boardQuery.error,
    updateBoard: updateBoardMutation.mutate,
  };
}
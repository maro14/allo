import { Board } from '../types/board';
import { localStorageCache } from '../lib/localStorageCache';

/**
 * Save board data to the server
 * @param board The board data to save
 */
export async function saveBoard(board: Board): Promise<void> {
  try {
    // Save to server
    const response = await fetch(`/api/boards/${board._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: board.name,
        description: board.description,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save board');
    }

    // Save to local cache as backup
    localStorageCache.set(`board_${board._id}`, board, 60); // Cache for 60 minutes
    
    // Return the updated board data
    return;
  } catch (error) {
    console.error('Error saving board:', error);
    
    // Save to local storage as backup if server save fails
    localStorageCache.set(`board_${board._id}_backup`, board, 1440); // Cache for 24 hours
    
    throw error;
  }
}

/**
 * Recover unsaved changes from local storage
 * @param boardId The ID of the board to recover
 */
export function recoverUnsavedBoard(boardId: string): Board | null {
  return localStorageCache.get<Board>(`board_${boardId}_backup`);
}
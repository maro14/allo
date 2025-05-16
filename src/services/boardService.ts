import { Column, Task } from '../types/boardTypes';

/**
 * Service for handling board-related API calls
 */
export const boardService = {
  /**
   * Fetches a board by ID
   */
  fetchBoard: async (boardId: string) => {
    const response = await fetch(`/api/boards/${boardId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch board');
    }
    const data = await response.json();
    if (!data.data.columns) {
      data.data.columns = [];
    }
    return data.data;
  },

  /**
   * Updates the order of columns
   */
  updateColumnOrder: async (boardId: string, columnIds: string[]) => {
    const response = await fetch(`/api/columns/reorder`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ boardId, columnIds }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update column order');
    }
    
    return response.json();
  },

  /**
   * Updates a task's position
   */
  updateTaskPosition: async (
    taskId: string, 
    sourceColumnId: string, 
    destinationColumnId: string, 
    destinationIndex: number
  ) => {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourceColumnId,
        destinationColumnId,
        destinationIndex,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update task position');
    }
    
    return response.json();
  },

  /**
   * Creates a new column
   */
  createColumn: async (boardId: string, title: string) => {
    const response = await fetch(`/api/columns?boardId=${boardId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });

    if (!response.ok) {
      throw new Error('Failed to create column');
    }

    return response.json();
  },

  /**
   * Deletes a column
   */
  deleteColumn: async (columnId: string, boardId: string) => {
    const response = await fetch(`/api/columns`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ columnId, boardId }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete column');
    }

    return response.json();
  },

  /**
   * Updates a column's title
   */
  updateColumnTitle: async (columnId: string, boardId: string, title: string) => {
    const response = await fetch(`/api/columns`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ columnId, boardId, title }),
    });

    if (!response.ok) {
      throw new Error('Failed to update column title');
    }

    return response.json();
  }
};
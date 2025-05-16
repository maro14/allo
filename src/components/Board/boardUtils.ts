import { Column } from '../../types/boardTypes';

/**
 * Updates the order of columns after a drag and drop operation
 * 
 * @param columns - The current columns array
 * @param dragIndex - The index of the column being dragged
 * @param hoverIndex - The index where the column is being dropped
 * @returns A new array with the updated column order
 */
export const updateColumnsOrder = (columns: Column[], dragIndex: number, hoverIndex: number) => {
  const newColumns = [...columns];
  const [movedColumn] = newColumns.splice(dragIndex, 1);
  newColumns.splice(hoverIndex, 0, movedColumn);
  return newColumns;
};

/**
 * Updates the position of tasks within or between columns
 * 
 * @param columns - The current columns array from the board state
 * @param sourceColumnId - ID of the column where the task originated
 * @param destColumnId - ID of the column where the task is being moved to
 * @param sourceIndex - Original position index of the task in the source column
 * @param destinationIndex - Target position index for the task in the destination column
 * @param taskId - ID of the task being moved
 * @returns Updated columns array with the task in its new position
 */
export const updateTaskPosition = (
  columns: Column[],
  sourceColumnId: string,
  destColumnId: string,
  sourceIndex: number,
  destinationIndex: number,
  taskId: string
) => {
  // Find the source and destination columns
  const sourceColumn = columns.find(col => col._id === sourceColumnId);
  const destColumn = columns.find(col => col._id === destColumnId);
  
  if (!sourceColumn || !destColumn) return columns;

  // Create copies of the task arrays to avoid mutating the original state
  const sourceTasks = [...sourceColumn.tasks];
  // If moving within the same column, use the same task array reference
  const destTasks = sourceColumnId === destColumnId ? sourceTasks : [...destColumn.tasks];
  
  // Remove the task from its original position
  const [movedTask] = sourceTasks.splice(sourceIndex, 1);
  
  // Insert the task at its new position, handling both same-column and cross-column moves
  if (sourceColumnId === destColumnId) {
    sourceTasks.splice(destinationIndex, 0, movedTask);
  } else {
    destTasks.splice(destinationIndex, 0, movedTask);
  }

  // Create a new columns array with the updated task arrays
  return columns.map(col => {
    if (col._id === sourceColumnId) return { ...col, tasks: sourceTasks };
    if (col._id === destColumnId) return { ...col, tasks: destTasks };
    return col;
  });
};
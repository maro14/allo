import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import Column from '../../../models/Column';
import Board from '../../../models/Board';
import dbConnect from '../../../lib/mongodb';
import mongoose from 'mongoose';

/**
 * Task Reordering API Handler
 * 
 * Handles reordering of tasks within a column:
 * - PUT: Updates the position of multiple tasks in a single operation
 * 
 * This endpoint is essential for the drag-and-drop functionality of tasks
 * within a column. It ensures that task positions are updated consistently
 * while maintaining data integrity.
 * 
 * @param req - Next.js API request object
 * @param res - Next.js API response object
 */
interface ReorderRequestBody {
  columnId: string;
  taskIds: string[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await dbConnect();

    if (req.method !== 'PUT') {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const { userId } = getAuth(req);
    const { columnId, taskIds }: ReorderRequestBody = req.body;

    // Authentication check
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Validate column ID
    if (!columnId || !mongoose.Types.ObjectId.isValid(columnId)) {
      return res.status(400).json({ success: false, error: 'Invalid column ID' });
    }

    // Validate task IDs array
    if (!Array.isArray(taskIds) || taskIds.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ success: false, error: 'Invalid task IDs' });
    }

    // Verify column exists
    const column = await Column.findById(columnId);
    if (!column) {
      return res.status(404).json({ success: false, error: 'Column not found' });
    }

    // Verify user owns the board containing this column - security check
    const board = await Board.findOne({ _id: column.boardId, userId });
    if (!board) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Update the column's tasks array with the new order
    column.tasks = taskIds;
    column.updatedAt = new Date();
    await column.save();

    // Update board's updatedAt timestamp to reflect changes
    board.updatedAt = new Date();
    await board.save();

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Task reorder error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

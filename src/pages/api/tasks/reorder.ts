import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import Column from '../../../models/Column';
import Board from '../../../models/Board';
import dbConnect from '../../../lib/mongodb';
import mongoose from 'mongoose';

interface ReorderRequestBody {
  columnId: string;
  taskIds: string[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await dbConnect(); // Add error handling here if needed

    if (req.method !== 'PUT') {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const { userId } = getAuth(req);
    const { columnId, taskIds }: ReorderRequestBody = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (!columnId || !mongoose.Types.ObjectId.isValid(columnId)) {
      return res.status(400).json({ success: false, error: 'Invalid column ID' });
    }

    if (!Array.isArray(taskIds) || taskIds.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ success: false, error: 'Invalid task IDs' });
    }

    const column = await Column.findById(columnId);
    if (!column) {
      return res.status(404).json({ success: false, error: 'Column not found' });
    }

    // Consider adding userId to Column model to avoid this extra query
    const board = await Board.findOne({ _id: column.boardId, userId });
    if (!board) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    column.tasks = taskIds;
    column.updatedAt = new Date();
    await column.save(); // Use save() for better control

    board.updatedAt = new Date();
    await board.save(); // Use save() for better control

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Task reorder error:', error);
    // Return more specific error messages based on the error type
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
}

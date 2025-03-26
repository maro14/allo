import { getAuth } from '@clerk/nextjs/server';
import type { NextApiRequest, NextApiResponse } from 'next';
import Column from '../../../models/Column';
import Board from '../../../models/Board';
import dbConnect from '../../../lib/mongodb';
import mongoose from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const { userId } = getAuth(req);
    const { boardId, columnIds } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (!boardId || !mongoose.Types.ObjectId.isValid(boardId)) {
      return res.status(400).json({ success: false, error: 'Invalid board ID' });
    }

    if (!Array.isArray(columnIds) || columnIds.some(id => !mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ success: false, error: 'Invalid column IDs' });
    }

    // Verify board ownership
    const board = await Board.findOne({ _id: boardId, userId });
    if (!board) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Update each column's position
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Update each column's position
      await Promise.all(
        columnIds.map((columnId, index) =>
          Column.findOneAndUpdate(
            { _id: columnId, boardId },
            { position: index },
            { session }
          )
        )
      );

      // Update board's updatedAt
      await Board.findByIdAndUpdate(
        boardId,
        { updatedAt: new Date() },
        { session }
      );

      await session.commitTransaction();
      return res.status(200).json({ success: true });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error('Column reorder error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}
import { getAuth } from '@clerk/nextjs/server';
import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import Board from '../../../models/Board';
import dbConnect from '../../../lib/mongodb';

/**
 * Board Reordering API Handler
 * 
 * Handles reordering of boards in the dashboard view:
 * - PUT: Updates the position of multiple boards in a single transaction
 * 
 * This endpoint uses MongoDB transactions to ensure that all board position
 * updates succeed or fail together, maintaining data consistency.
 * 
 * @param req - Next.js API request object
 * @param res - Next.js API response object
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const { userId } = getAuth(req);
    
    // Authentication check
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { boardIds } = req.body;

    // Validate boardIds array
    if (!Array.isArray(boardIds)) {
      return res.status(400).json({ 
        success: false, 
        error: 'boardIds must be an array' 
      });
    }

    // Use a session for transaction to ensure data consistency
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Update each board's position in a single transaction
      await Promise.all(
        boardIds.map((boardId, index) =>
          Board.findOneAndUpdate(
            { _id: boardId, userId }, // Ensure user owns the board
            { position: index },
            { session }
          )
        )
      );

      // Commit the transaction if all updates succeed
      await session.commitTransaction();
      return res.status(200).json({ success: true });
    } catch (error) {
      // Rollback the transaction if any update fails
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error('Reorder boards error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
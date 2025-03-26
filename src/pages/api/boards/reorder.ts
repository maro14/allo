import { getAuth } from '@clerk/nextjs/server';
import type { NextApiRequest, NextApiResponse } from 'next';
import Board from '../../../models/Board';
import dbConnect from '../../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { boardIds } = req.body;

    if (!Array.isArray(boardIds)) {
      return res.status(400).json({ 
        success: false, 
        error: 'boardIds must be an array' 
      });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Update each board's position
      await Promise.all(
        boardIds.map((boardId, index) =>
          Board.findOneAndUpdate(
            { _id: boardId, userId },
            { position: index },
            { session }
          )
        )
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
    console.error('Reorder boards error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
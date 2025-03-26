import { getAuth } from '@clerk/nextjs/server';
import type { NextApiRequest, NextApiResponse } from 'next';
import Task from '../../../models/Task';
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
    const { taskId } = req.query;
    const { sourceColumnId, destinationColumnId, destinationIndex } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(taskId as string) ||
        !mongoose.Types.ObjectId.isValid(sourceColumnId) ||
        !mongoose.Types.ObjectId.isValid(destinationColumnId)) {
      return res.status(400).json({ success: false, error: 'Invalid IDs provided' });
    }

    // Get the task and verify ownership
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    // Get both columns
    const [sourceColumn, destColumn] = await Promise.all([
      Column.findById(sourceColumnId),
      Column.findById(destinationColumnId)
    ]);

    if (!sourceColumn || !destColumn) {
      return res.status(404).json({ success: false, error: 'Column not found' });
    }

    // Verify board ownership
    const board = await Board.findOne({
      _id: sourceColumn.boardId,
      userId
    });

    if (!board) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Update task's column
    task.columnId = destinationColumnId;
    await task.save();

    // Update source and destination columns
    await Promise.all([
      Column.findByIdAndUpdate(sourceColumnId, {
        $pull: { tasks: taskId },
        updatedAt: new Date()
      }),
      Column.findByIdAndUpdate(destinationColumnId, {
        $push: {
          tasks: {
            $each: [taskId],
            $position: destinationIndex
          }
        },
        updatedAt: new Date()
      })
    ]);

    // Update board's timestamp
    await Board.findByIdAndUpdate(board._id, {
      updatedAt: new Date()
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Move task error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}
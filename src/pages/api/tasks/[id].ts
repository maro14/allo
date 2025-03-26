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
    const taskId = req.query.id as string;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Validate task ID
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ success: false, error: 'Invalid task ID' });
    }

    // Get the task
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    // Get the column to verify ownership
    const column = await Column.findById(task.columnId);
    if (!column) {
      return res.status(404).json({ success: false, error: 'Column not found' });
    }

    // Verify board ownership
    const board = await Board.findOne({
      _id: column.boardId,
      userId
    });

    if (!board) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Check if this is a move operation or a regular update
    const { sourceColumnId, destinationColumnId, destinationIndex, ...updateData } = req.body;

    // Handle task move between columns
    if (sourceColumnId && destinationColumnId && destinationIndex !== undefined) {
      // Validate column IDs
      if (!mongoose.Types.ObjectId.isValid(sourceColumnId) ||
          !mongoose.Types.ObjectId.isValid(destinationColumnId)) {
        return res.status(400).json({ success: false, error: 'Invalid column IDs' });
      }

      // Get both columns
      const [sourceColumn, destColumn] = await Promise.all([
        Column.findById(sourceColumnId),
        Column.findById(destinationColumnId)
      ]);

      if (!sourceColumn || !destColumn) {
        return res.status(404).json({ success: false, error: 'Column not found' });
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
    } 
    // Handle regular task update
    else if (Object.keys(updateData).length > 0) {
      // Filter allowed fields to update
      const allowedUpdates = [
        'title', 
        'description', 
        'priority', 
        'dueDate', 
        'labels', 
        'subtasks',
        'completed'
      ];
      
      const filteredUpdates = Object.entries(updateData)
        .filter(([key]) => allowedUpdates.includes(key))
        .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});
      
      if (Object.keys(filteredUpdates).length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'No valid fields to update' 
        });
      }
      
      // Update the task
      await Task.findByIdAndUpdate(taskId, {
        ...filteredUpdates,
        updatedAt: new Date()
      });
    } else {
      return res.status(400).json({ 
        success: false, 
        error: 'No update data provided' 
      });
    }

    // Update board's timestamp
    await Board.findByIdAndUpdate(board._id, {
      updatedAt: new Date()
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Task update error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}
import { getAuth } from '@clerk/nextjs/server';
import type { NextApiRequest, NextApiResponse } from 'next';
import Task from '../../../models/Task';
import Column from '../../../models/Column';
import Board from '../../../models/Board';
import dbConnect from '../../../lib/mongodb';
import mongoose from 'mongoose';

/**
 * Task Update API Handler
 * 
 * Handles updating and moving tasks:
 * - PUT: Updates task properties or moves a task between columns
 * 
 * This endpoint handles two distinct operations:
 * 1. Regular task updates (title, description, etc.)
 * 2. Task movement between columns with position reordering
 * 
 * The task movement logic is complex as it needs to:
 * - Update the task's column reference
 * - Remove the task from the source column's tasks array
 * - Add the task to the destination column's tasks array
 * - Reorder tasks in both affected columns
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
    const taskId = req.query.id as string;

    // Authentication check
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

    // Verify board ownership - security check
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

      // Update task's column reference
      task.columnId = destinationColumnId;
      await task.save();

      // Special case: Moving to an empty column
      if (destColumn.tasks.length === 0 && destinationIndex === 0) {
        await Promise.all([
          // Remove from source column
          Column.findByIdAndUpdate(sourceColumnId, {
            $pull: { tasks: taskId },
            updatedAt: new Date()
          }),
          // Add to destination column
          Column.findByIdAndUpdate(destinationColumnId, {
            $set: { tasks: [taskId] },
            updatedAt: new Date()
          })
        ]);
      } else {
        // Handle moving between columns or within the same column
        // This is more complex as we need to maintain the correct order
        
        // Get tasks from both columns
        const sourceTasks = Array.from(sourceColumn.tasks).map(t => t.toString());
        const destTasks = Array.from(destColumn.tasks).map(t => t.toString());
        
        // Remove task from source column's tasks array
        const sourceIndex = sourceTasks.indexOf(taskId);
        if (sourceIndex > -1) {
          sourceTasks.splice(sourceIndex, 1);
        }
        
        // Add task to destination column's tasks array at the specified index
        if (sourceColumnId === destinationColumnId) {
          // Same column, just reordering
          sourceTasks.splice(destinationIndex, 0, taskId);
          await Column.findByIdAndUpdate(sourceColumnId, {
            $set: { tasks: sourceTasks },
            updatedAt: new Date()
          });
        } else {
          // Different columns
          destTasks.splice(destinationIndex, 0, taskId);
          await Promise.all([
            Column.findByIdAndUpdate(sourceColumnId, {
              $set: { tasks: sourceTasks },
              updatedAt: new Date()
            }),
            Column.findByIdAndUpdate(destinationColumnId, {
              $set: { tasks: destTasks },
              updatedAt: new Date()
            })
          ]);
        }
      }
      
      // Update board's updatedAt timestamp
      await Board.findByIdAndUpdate(board._id, { updatedAt: new Date() });
      
      return res.status(200).json({ success: true });
    } else {
      // Regular task update (not a move operation)
      // Update allowed fields only
      const allowedUpdates = ['title', 'description', 'priority', 'labels', 'dueDate'];
      const updates: Record<string, any> = {};
      
      for (const field of allowedUpdates) {
        if (field in updateData) {
          updates[field] = updateData[field];
        }
      }
      
      // Add updatedAt timestamp
      updates.updatedAt = new Date();
      
      // Update the task
      const updatedTask = await Task.findByIdAndUpdate(
        taskId,
        updates,
        { new: true }
      );
      
      // Update column and board timestamps
      await Promise.all([
        Column.findByIdAndUpdate(task.columnId, { updatedAt: new Date() }),
        Board.findByIdAndUpdate(board._id, { updatedAt: new Date() })
      ]);
      
      return res.status(200).json({ success: true, data: updatedTask });
    }
  } catch (error) {
    console.error('Task update error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
import { getAuth } from '@clerk/nextjs/server'
import type { NextApiRequest, NextApiResponse } from 'next'
import Board from '../../../models/Board'
import Column from '../../../models/Column'
import Task from '../../../models/Task'
import dbConnect from '../../../lib/mongodb'
import mongoose from 'mongoose'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect()
    
    // Remove schema redefinition and model registration - use imported models directly
    
    const { userId } = getAuth(req)
    const { id } = req.query
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    
    // Validate board ID
    if (!id || !mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({ error: 'Invalid board ID' })
    }

    // GET /api/boards/[id] - Get a specific board with its columns and tasks
    if (req.method === 'GET') {
      const board = await Board.findOne({ _id: id, userId })
        .populate({
          path: 'columns',
          populate: {
            path: 'tasks'
          }
        });
      
      if (!board) {
        return res.status(404).json({ error: 'Board not found' })
      }
      
      return res.status(200).json(board)
    }
    
    // PUT /api/boards/[id] - Update a board
    if (req.method === 'PUT') {
      const { name } = req.body;
      
      if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: 'Name is required' });
      }
      
      const updatedBoard = await Board.findOneAndUpdate(
        { _id: id, userId },
        { name },
        { new: true }
      );
      
      if (!updatedBoard) {
        return res.status(404).json({ error: 'Board not found' });
      }
      
      return res.status(200).json(updatedBoard);
    }
    
    // DELETE /api/boards/[id] - Delete a board and its columns/tasks
    if (req.method === 'DELETE') {
      const board = await Board.findOne({ _id: id, userId });
      
      if (!board) {
        return res.status(404).json({ error: 'Board not found' });
      }
      
      // Delete all columns and tasks associated with this board
      const columns = await Column.find({ boardId: id });
      const columnIds = columns.map(col => col._id);
      
      await Task.deleteMany({ columnId: { $in: columnIds } });
      await Column.deleteMany({ boardId: id });
      await Board.deleteOne({ _id: id });
      
      return res.status(200).json({ success: true });
    }
    
    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ 
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
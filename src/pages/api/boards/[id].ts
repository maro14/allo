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
    
    const { userId } = getAuth(req)
    const { id } = req.query
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }
    
    // Validate board ID
    if (!id || !mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({ success: false, error: 'Invalid board ID' })
    }

    // GET /api/boards/[id] - Get a specific board
    if (req.method === 'GET') {
      const board = await Board.findOne({ _id: id, userId })
        .populate({
          path: 'columns',
          options: { sort: { position: 1 } },
          populate: {
            path: 'tasks',
            options: { sort: { position: 1 } }
          }
        });
      
      if (!board) {
        return res.status(404).json({ success: false, error: 'Board not found' })
      }
      
      if (!board.columns) {
        board.columns = [];
      }
      
      board.columns.forEach(column => {
        if (!column.tasks) {
          column.tasks = [];
        }
      });
      
      return res.status(200).json({ success: true, data: board })
    }
    
    // PUT /api/boards/[id] - Update a board
    if (req.method === 'PUT') {
      const { name } = req.body;
      
      if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ success: false, error: 'Name is required' });
      }
      
      // Check for duplicate board names (excluding current board)
      const existingBoard = await Board.findOne({ 
        userId, 
        name: name.trim(),
        _id: { $ne: id }
      });

      if (existingBoard) {
        return res.status(400).json({ 
          success: false, 
          error: 'A board with this name already exists' 
        });
      }
      
      const updatedBoard = await Board.findOneAndUpdate(
        { _id: id, userId },
        { name: name.trim(), updatedAt: new Date() },
        { new: true }
      );
      
      if (!updatedBoard) {
        return res.status(404).json({ success: false, error: 'Board not found' });
      }
      
      return res.status(200).json({ success: true, data: updatedBoard });
    }
    
    // DELETE /api/boards/[id] - Delete a board and its associated columns and tasks
    if (req.method === 'DELETE') {
      const session = await mongoose.startSession();
      session.startTransaction();
      
      try {
        // Find the board and its columns
        const board = await Board.findOne({ _id: id, userId }).populate('columns');
        
        if (!board) {
          await session.abortTransaction();
          return res.status(404).json({ success: false, error: 'Board not found' });
        }
        
        // Delete all tasks in each column
        for (const column of board.columns) {
          await Task.deleteMany({ columnId: column._id }, { session });
        }
        
        // Delete all columns
        await Column.deleteMany({ boardId: id }, { session });
        
        // Delete the board
        await Board.findByIdAndDelete(id, { session });
        
        await session.commitTransaction();
        return res.status(200).json({ success: true, message: 'Board deleted successfully' });
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    }

    return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` })
  } catch (error) {
    console.error('API error:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
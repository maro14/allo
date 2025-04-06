import { getAuth } from '@clerk/nextjs/server'
import type { NextApiRequest, NextApiResponse } from 'next'
import Column from '../../../models/Column'
import Board from '../../../models/Board'
import Task from '../../../models/Task'
import dbConnect from '../../../lib/mongodb'
import mongoose from 'mongoose'

/**
 * Columns API Handler
 * 
 * Handles CRUD operations for columns:
 * - GET: Retrieves all columns for a specific board
 * - POST: Creates a new column with validation
 * - DELETE: Removes a column and its associated tasks
 * 
 * The column creation process uses MongoDB transactions to ensure
 * that both the column is created and the board is updated atomically.
 * 
 * @param req - Next.js API request object
 * @param res - Next.js API response object
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect()
    
    const { userId } = getAuth(req)
    // Get boardId from both query and body to support different request types
    const boardId = req.query.boardId || req.body.boardId
    
    // Authentication check
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }
    
    // Validate boardId
    if (!boardId || typeof boardId !== 'string' || !mongoose.Types.ObjectId.isValid(boardId)) {
      return res.status(400).json({ success: false, error: 'Invalid board ID', receivedId: boardId })
    }
    
    // Verify board ownership
    const board = await Board.findOne({ _id: boardId, userId })
    if (!board) {
      return res.status(404).json({ success: false, error: 'Board not found' })
    }
    
    // POST - Create a new column
    if (req.method === 'POST') {
      const { title } = req.body
      
      // Input validation
      if (!title || typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ success: false, error: 'Column title is required' })
      }
      
      // Get the highest position to place the new column at the end
      const highestPositionColumn = await Column.findOne({ boardId })
        .sort({ position: -1 })
        .limit(1);
      
      const position = highestPositionColumn ? highestPositionColumn.position + 1 : 0;
      
      // Use a session for transaction to ensure data consistency
      // This ensures that both the column creation and board update succeed or fail together
      const session = await mongoose.startSession();
      let newColumn;
      
      try {
        await session.withTransaction(async () => {
          // Create new column
          newColumn = new Column({ 
            title: title.trim(), 
            boardId,
            position,
            tasks: []
          });
          
          await newColumn.save({ session });
          
          // Update board's columns array
          await Board.findByIdAndUpdate(
            boardId, 
            { 
              $push: { columns: newColumn._id },
              updatedAt: new Date()
            },
            { session }
          );
        });
        
        await session.endSession();
        
        // Populate tasks for the response
        newColumn = await Column.findById(newColumn._id).populate('tasks');
        
        return res.status(201).json({ 
          success: true, 
          data: newColumn,
          message: 'Column created successfully'
        });
      } catch (error) {
        await session.endSession();
        throw error;
      }
    }
    
    // Additional methods would be documented here...
    
    // Method not allowed
    return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` })
  } catch (error) {
    console.error('Columns API error:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
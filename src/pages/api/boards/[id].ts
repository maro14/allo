import { getAuth } from '@clerk/nextjs/server'
import type { NextApiRequest, NextApiResponse } from 'next'
import Board from '../../../models/Board'
import Column from '../../../models/Column'
import Task from '../../../models/Task'
import dbConnect from '../../../lib/mongodb'
import mongoose from 'mongoose'

/**
 * Board Detail API Handler
 * 
 * Handles operations for a specific board:
 * - GET: Retrieves a board with its columns and tasks, supporting pagination
 * - DELETE: Removes a board and all its associated columns and tasks
 * - PUT: Updates a board's properties
 * 
 * The GET endpoint supports pagination of columns for performance optimization
 * with large boards, and includes an option to retrieve all columns at once.
 * 
 * @param req - Next.js API request object
 * @param res - Next.js API response object
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect()
    const { userId } = getAuth(req)
    const { id } = req.query
    
    // Authentication check
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }
    
    // Validate board ID
    if (!id || !mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({ success: false, error: 'Invalid board ID' })
    }

    // GET /api/boards/[id] - Get a specific board
    if (req.method === 'GET') {
      // Extract pagination parameters from query
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;
      
      // Add option to include all columns without pagination
      const includeAll = req.query.includeAll === 'true';
      
      // Get the board without populating columns yet
      const board = await Board.findOne({ _id: id, userId });
      
      if (!board) {
        return res.status(404).json({ success: false, error: 'Board not found' })
      }
      
      // Get total count of columns for pagination metadata
      const totalColumns = await Column.countDocuments({ boardId: id });
      
      // Get columns - either all or paginated
      let columnsQuery = Column.find({ boardId: id }).sort({ position: 1 });
      
      // Apply pagination only if not including all
      if (!includeAll) {
        columnsQuery = columnsQuery.skip(skip).limit(limit);
      }
      
      // Execute query with population of tasks
      const columns = await columnsQuery.populate({
        path: 'tasks',
        options: { sort: { position: 1 } }
      });
      
      // Attach columns to board
      board.columns = columns;
      
      // Ensure columns array exists
      if (!board.columns) {
        board.columns = [];
      }
      
      // Ensure tasks array exists for each column
      board.columns.forEach(column => {
        if (!column.tasks) {
          column.tasks = [];
        }
      });
      
      // Update last accessed timestamp
      await Board.findByIdAndUpdate(id, { 
        lastAccessed: new Date() 
      }, { new: false });
      
      return res.status(200).json({ 
        success: true, 
        data: board,
        pagination: {
          total: totalColumns,
          page,
          limit,
          pages: Math.ceil(totalColumns / limit)
        }
      })
    }
    
    // DELETE /api/boards/[id] - Delete a board
    if (req.method === 'DELETE') {
      // Find the board to ensure it exists and belongs to the user
      const board = await Board.findOne({ _id: id, userId })
      if (!board) {
        return res.status(404).json({ success: false, error: 'Board not found' })
      }
      
      // Use a session for transaction to ensure data consistency
      const session = await mongoose.startSession()
      session.startTransaction()
      
      try {
        // Get all columns for this board
        const columns = await Column.find({ boardId: id })
        
        // Get all task IDs from these columns
        const taskIds = columns.flatMap(column => column.tasks)
        
        // Delete all tasks, columns, and the board in order
        await Task.deleteMany({ _id: { $in: taskIds } }, { session })
        await Column.deleteMany({ boardId: id }, { session })
        await Board.findByIdAndDelete(id, { session })
        
        await session.commitTransaction()
      } catch (error) {
        await session.abortTransaction()
        throw error
      } finally {
        session.endSession()
      }
      
      return res.status(200).json({ success: true })
    }
    
    // PUT /api/boards/[id] - Update a board
    if (req.method === 'PUT') {
      const { name } = req.body
      
      // Input validation
      if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ success: false, error: 'Board name is required' })
      }
      
      // Check for duplicate board names (excluding the current board)
      const existingBoard = await Board.findOne({ 
        userId, 
        name: name.trim(),
        _id: { $ne: id }
      })
      
      if (existingBoard) {
        return res.status(400).json({ 
          success: false, 
          error: 'A board with this name already exists' 
        })
      }
      
      // Update the board
      const updatedBoard = await Board.findOneAndUpdate(
        { _id: id, userId }, // Ensure user owns the board
        { 
          name: name.trim(),
          updatedAt: new Date()
        },
        { new: true }
      )
      
      if (!updatedBoard) {
        return res.status(404).json({ success: false, error: 'Board not found' })
      }
      
      return res.status(200).json({ success: true, data: updatedBoard })
    }
    
    return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` })
  } catch (error) {
    console.error('Board detail API error:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
import { getAuth } from '@clerk/nextjs/server'
import type { NextApiRequest, NextApiResponse } from 'next'
import Task from '../../../models/Task'
import Column from '../../../models/Column'
import Board from '../../../models/Board'
import dbConnect from '../../../lib/mongodb'
import mongoose from 'mongoose'

/**
 * Tasks API Handler
 * 
 * Handles CRUD operations for tasks:
 * - POST: Creates a new task with validation and proper positioning
 * 
 * The task creation process updates multiple related entities:
 * 1. Creates the task with proper position value
 * 2. Updates the parent column's tasks array
 * 3. Updates the board's timestamp
 * 
 * @param req - Next.js API request object
 * @param res - Next.js API response object
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect()
    
    const { userId } = getAuth(req)
    // Get columnId from both query and body to support different request types
    const columnId = req.query.columnId || req.body.columnId
    
    // Authentication check
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }
    
    // Validate columnId
    if (!columnId || typeof columnId !== 'string' || !mongoose.Types.ObjectId.isValid(columnId)) {
      return res.status(400).json({ success: false, error: 'Invalid column ID' })
    }
    
    // Verify column exists and user has access to it
    const column = await Column.findById(columnId)
    if (!column) {
      return res.status(404).json({ success: false, error: 'Column not found' })
    }
    
    // Verify user owns the board containing this column - security check
    const board = await Board.findOne({ 
      _id: column.boardId, 
      userId 
    })
    
    if (!board) {
      return res.status(403).json({ success: false, error: 'Access denied to this column' })
    }
    
    // POST - Create a new task
    if (req.method === 'POST') {
      const { title, description, priority, labels } = req.body
      
      // Input validation
      if (!title || typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ success: false, error: 'Task title is required' })
      }
      
      // Get highest position to place task at the end of the column
      const highestPositionTask = await Task.findOne({ columnId })
        .sort({ position: -1 })
        .limit(1)
      
      const position = highestPositionTask ? highestPositionTask.position + 1 : 0
      
      // Create new task with default values for optional fields
      const newTask = new Task({ 
        title: title.trim(), 
        description, 
        columnId,
        priority: priority || 'medium',
        labels: labels || [],
        position
      })
      
      await newTask.save()
      
      // Update column's tasks array to include the new task
      await Column.findByIdAndUpdate(columnId, { 
        $push: { tasks: newTask._id },
        updatedAt: new Date()
      })
      
      // Update board's updatedAt timestamp to reflect changes
      await Board.findByIdAndUpdate(board._id, { 
        updatedAt: new Date() 
      })
      
      return res.status(201).json({ success: true, data: newTask })
    }
    
    return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` })
  } catch (error) {
    console.error('Tasks API error:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
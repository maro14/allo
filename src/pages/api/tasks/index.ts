import { getAuth } from '@clerk/nextjs/server'
import type { NextApiRequest, NextApiResponse } from 'next'
import Task from '../../../models/Task'
import Column from '../../../models/Column'
import Board from '../../../models/Board'
import dbConnect from '../../../lib/mongodb'
import mongoose from 'mongoose'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect()
    
    const { userId } = getAuth(req)
    // Get columnId from both query and body to support different request types
    const columnId = req.query.columnId || req.body.columnId
    
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
    
    // Verify user owns the board containing this column
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
      
      if (!title || typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ success: false, error: 'Task title is required' })
      }
      
      // Get highest position to place task at the end
      const highestPositionTask = await Task.findOne({ columnId })
        .sort({ position: -1 })
        .limit(1)
      
      const position = highestPositionTask ? highestPositionTask.position + 1 : 0
      
      const newTask = new Task({ 
        title: title.trim(), 
        description, 
        columnId,
        priority: priority || 'medium',
        labels: labels || [],
        position
      })
      
      await newTask.save()
      
      // Update column's tasks array
      await Column.findByIdAndUpdate(columnId, { 
        $push: { tasks: newTask._id },
        updatedAt: new Date()
      })
      
      // Update board's updatedAt timestamp
      await Board.findByIdAndUpdate(board._id, { 
        updatedAt: new Date() 
      })
      
      return res.status(201).json({ success: true, data: newTask })
    }
    
    // GET - Retrieve all tasks for a column
    if (req.method === 'GET') {
      const tasks = await Task.find({ columnId })
        .sort({ position: 1 })
      
      return res.status(200).json({ success: true, data: tasks })
    }
    
    // Method not allowed
    return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` })
    
  } catch (error) {
    console.error('Task API error:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    })
  }
}
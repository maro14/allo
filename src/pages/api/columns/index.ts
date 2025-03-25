import { getAuth } from '@clerk/nextjs/server'
import type { NextApiRequest, NextApiResponse } from 'next'
import Column from '../../../models/Column'
import Board from '../../../models/Board'
import Task from '../../../models/Task'
import dbConnect from '../../../lib/mongodb'
import mongoose from 'mongoose'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect()
    
    const { userId } = getAuth(req)
    // Get boardId from both query and body to support different request types
    const boardId = req.query.boardId || req.body.boardId
    
    // Good authentication check
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }
    
    // Good validation for boardId
    if (!boardId || typeof boardId !== 'string' || !mongoose.Types.ObjectId.isValid(boardId)) {
      return res.status(400).json({ success: false, error: 'Invalid board ID', receivedId: boardId })
    }
    
    // Good ownership verification
    const board = await Board.findOne({ _id: boardId, userId })
    if (!board) {
      return res.status(404).json({ success: false, error: 'Board not found' })
    }
    
    // POST - Create a new column
    if (req.method === 'POST') {
      const { title } = req.body
      
      if (!title || typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ success: false, error: 'Column title is required' })
      }
      
      // Get the highest position to place the new column at the end
      const highestPositionColumn = await Column.findOne({ boardId })
        .sort({ position: -1 })
        .limit(1);
      
      const position = highestPositionColumn ? highestPositionColumn.position + 1 : 0;
      
      // Consider adding a transaction here for atomicity
      const newColumn = new Column({ 
        title: title.trim(), 
        boardId,
        position,
        tasks: []
      })
      
      await newColumn.save()
      
      // Update board's columns array
      await Board.findByIdAndUpdate(boardId, { 
        $push: { columns: newColumn._id },
        updatedAt: new Date()
      })
      
      return res.status(201).json({ success: true, data: newColumn })
    }
    
    // GET - Retrieve all columns for a board
    if (req.method === 'GET') {
      const columns = await Column.find({ boardId })
        .sort({ position: 1 })
        .populate('tasks')
      
      return res.status(200).json({ success: true, data: columns })
    }
    
    // PUT - Update a column
    if (req.method === 'PUT') {
      const { columnId, title } = req.body
      
      if (!columnId || !mongoose.Types.ObjectId.isValid(columnId)) {
        return res.status(400).json({ success: false, error: 'Valid column ID is required' })
      }
      
      if (!title || typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ success: false, error: 'Column title is required' })
      }
      
      // Verify column belongs to this board
      const column = await Column.findOne({ _id: columnId, boardId })
      if (!column) {
        return res.status(404).json({ success: false, error: 'Column not found' })
      }
      
      const updatedColumn = await Column.findByIdAndUpdate(
        columnId,
        { 
          title: title.trim(),
          updatedAt: new Date()
        },
        { new: true }
      )
      
      // Update board's updatedAt timestamp
      await Board.findByIdAndUpdate(boardId, { updatedAt: new Date() })
      
      return res.status(200).json({ success: true, data: updatedColumn })
    }
    
    // DELETE - Delete a column and its tasks
    if (req.method === 'DELETE') {
      const { columnId } = req.body
      
      if (!columnId || !mongoose.Types.ObjectId.isValid(columnId)) {
        return res.status(400).json({ success: false, error: 'Valid column ID is required' })
      }
      
      // Verify column belongs to this board
      const column = await Column.findOne({ _id: columnId, boardId })
      if (!column) {
        return res.status(404).json({ success: false, error: 'Column not found' })
      }
      
      // Delete all tasks in this column
      await Task.deleteMany({ columnId })
      
      // Remove column from board's columns array
      await Board.findByIdAndUpdate(boardId, { 
        $pull: { columns: columnId },
        updatedAt: new Date()
      })
      
      // Delete the column
      await Column.findByIdAndDelete(columnId)
      
      // Reorder remaining columns to ensure no gaps in position
      const remainingColumns = await Column.find({ boardId }).sort({ position: 1 })
      
      for (let i = 0; i < remainingColumns.length; i++) {
        await Column.findByIdAndUpdate(remainingColumns[i]._id, { position: i })
      }
      
      return res.status(200).json({ 
        success: true, 
        message: 'Column and all associated tasks deleted successfully' 
      })
    }
    
    // Method not allowed
    return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` })
    
  } catch (error) {
    console.error('Column API error:', error)
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    })
  }
}
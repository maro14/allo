import { getAuth } from '@clerk/nextjs/server'
import type { NextApiRequest, NextApiResponse } from 'next'
import Column from '../../../models/Column'
import Board from '../../../models/Board'
import dbConnect from '../../../lib/mongodb'
import mongoose from 'mongoose'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect()
    
    const { userId } = getAuth(req)
    // Get boardId from both query and body to support different request types
    const boardId = req.query.boardId || req.body.boardId
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }
    
    // Validate boardId
    if (!boardId || typeof boardId !== 'string' || !mongoose.Types.ObjectId.isValid(boardId)) {
      return res.status(400).json({ success: false, error: 'Invalid board ID', receivedId: boardId })
    }
    
    // Verify board exists and belongs to user
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
      
      const newColumn = new Column({ 
        title, 
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
import { getAuth } from '@clerk/nextjs/server'
import type { NextApiRequest, NextApiResponse } from 'next'
import Column from '../../../models/Column'
import Board from '../../../models/Board'
import { dbConnect} from '../../../lib/mongodb'
import mongoose from 'mongoose'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect()
    
    const { userId } = getAuth(req)
    const { boardId } = req.query
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    
    // Validate boardId
    if (!boardId || typeof boardId !== 'string' || !mongoose.Types.ObjectId.isValid(boardId)) {
      return res.status(400).json({ error: 'Invalid board ID' })
    }
    
    // Verify board exists and belongs to user
    const board = await Board.findOne({ _id: boardId, userId })
    if (!board) {
      return res.status(404).json({ error: 'Board not found' })
    }
    
    // POST - Create a new column
    if (req.method === 'POST') {
      const { title } = req.body
      
      if (!title || typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ error: 'Column title is required' })
      }
      
      const newColumn = new Column({ 
        title, 
        boardId,
        tasks: []
      })
      
      await newColumn.save()
      
      // Update board's columns array
      await Board.findByIdAndUpdate(boardId, { 
        $push: { columns: newColumn._id },
        updatedAt: new Date()
      })
      
      return res.status(201).json(newColumn)
    }
    
    // GET - Retrieve all columns for a board
    if (req.method === 'GET') {
      const columns = await Column.find({ boardId }).populate('tasks')
      return res.status(200).json(columns)
    }
    
    // Method not allowed
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
    
  } catch (error) {
    console.error('Column API error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    })
  }
}
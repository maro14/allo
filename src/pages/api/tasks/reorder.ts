import type { NextApiRequest, NextApiResponse } from 'next'
import { getAuth } from '@clerk/nextjs/server'
import Column from '../../../models/Column'
import Board from '../../../models/Board'
import dbConnect from '../../../lib/mongodb'
import mongoose from 'mongoose'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'PUT') {
      return res.status(405).json({ success: false, error: 'Method not allowed' })
    }

    await dbConnect()
    const { userId } = getAuth(req)
    const { columnId, taskIds } = req.body

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    if (!columnId || !mongoose.Types.ObjectId.isValid(columnId)) {
      return res.status(400).json({ success: false, error: 'Invalid column ID' })
    }

    if (!Array.isArray(taskIds) || taskIds.some(id => !mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ success: false, error: 'Invalid task IDs' })
    }

    // Find column and verify ownership
    const column = await Column.findById(columnId)
    if (!column) {
      return res.status(404).json({ success: false, error: 'Column not found' })
    }

    const board = await Board.findOne({ 
      _id: column.boardId,
      userId 
    })

    if (!board) {
      return res.status(403).json({ success: false, error: 'Access denied' })
    }

    // Update column tasks order
    await Column.findByIdAndUpdate(columnId, { 
      tasks: taskIds,
      updatedAt: new Date()
    })

    // Update board's updatedAt
    await Board.findByIdAndUpdate(board._id, { 
      updatedAt: new Date() 
    })

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Task reorder error:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    })
  }
}
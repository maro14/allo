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
    const { boardId, columnIds } = req.body

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    if (!boardId || !mongoose.Types.ObjectId.isValid(boardId)) {
      return res.status(400).json({ success: false, error: 'Invalid board ID' })
    }

    if (!Array.isArray(columnIds) || columnIds.some(id => !mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ success: false, error: 'Invalid column IDs' })
    }

    // Verify board ownership
    const board = await Board.findOne({ _id: boardId, userId })
    if (!board) {
      return res.status(403).json({ success: false, error: 'Access denied' })
    }

    // Verify all columns belong to this board
    const columns = await Column.find({ 
      _id: { $in: columnIds },
      boardId
    })

    if (columns.length !== columnIds.length) {
      return res.status(400).json({ 
        success: false, 
        error: 'Some columns do not exist or do not belong to this board' 
      })
    }

    // Update columns one by one instead of using Promise.all
    // This avoids potential transaction issues
    for (let i = 0; i < columnIds.length; i++) {
      await Column.findByIdAndUpdate(
        columnIds[i],
        { 
          position: i,
          updatedAt: new Date()
        }
      )
    }

    // Update board's updatedAt
    await Board.findByIdAndUpdate(board._id, { 
      updatedAt: new Date() 
    })

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Column reorder error:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    })
  }
}
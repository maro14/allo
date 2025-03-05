import { getAuth } from '@clerk/nextjs/server'
import type { NextApiRequest, NextApiResponse } from 'next'
import Board from '../../../models/Board'
import dbConnect from '../../../lib/mongodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect()
    
    const { userId } = getAuth(req)
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    // GET /api/boards - Get all boards for the current user
    if (req.method === 'GET') {
      const boards = await Board.find({ userId })
        .sort({ updatedAt: -1 }) // Sort by most recently updated
        .select('name createdAt updatedAt') // Only return necessary fields
      
      return res.status(200).json({ success: true, data: boards })
    }

    // POST /api/boards - Create a new board
    if (req.method === 'POST') {
      const { name } = req.body
      
      if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ success: false, error: 'Board name is required' })
      }
      
      // Check if a board with the same name already exists
      const existingBoard = await Board.findOne({ userId, name: name.trim() })
      if (existingBoard) {
        return res.status(400).json({ 
          success: false, 
          error: 'A board with this name already exists' 
        })
      }
      
      const newBoard = new Board({ 
        name: name.trim(), 
        userId,
        columns: [] 
      })
      
      await newBoard.save()
      return res.status(201).json({ success: true, data: newBoard })
    }

    // Handle unsupported methods
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
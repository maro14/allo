import { getAuth } from '@clerk/nextjs/server'
import type { NextApiRequest, NextApiResponse } from 'next'
import Board from '../../../models/Board'
import { dbConnect } from '../../../lib/mongodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect()
  
  const { userId } = getAuth(req)
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // GET /api/boards - Get all boards for the current user
  if (req.method === 'GET') {
    try {
      const boards = await Board.find({ userId })
        .sort({ updatedAt: -1 }) // Sort by most recently updated
        .select('name createdAt updatedAt') // Only return necessary fields
      
      return res.status(200).json(boards)
    } catch (error) {
      console.error('Error fetching boards:', error)
      return res.status(500).json({ error: 'Failed to fetch boards' })
    }
  }

  // POST /api/boards - Create a new board
  if (req.method === 'POST') {
    try {
      const { name } = req.body
      
      if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Board name is required' })
      }
      
      const newBoard = new Board({ 
        name, 
        userId,
        columns: [] 
      })
      
      await newBoard.save()
      return res.status(201).json(newBoard)
    } catch (error) {
      console.error('Error creating board:', error)
      return res.status(500).json({ error: 'Failed to create board' })
    }
  }

  // Handle unsupported methods
  return res.status(405).json({ error: `Method ${req.method} not allowed` })
}
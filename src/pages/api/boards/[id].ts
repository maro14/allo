import { getAuth } from '@clerk/nextjs/server'
import type { NextApiRequest, NextApiResponse } from 'next'
import Board from '../../../models/Board'
import Column from '../../../models/Column'
import { dbConnect } from '../../../lib/mongodb'
import mongoose from 'mongoose'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect()
  
  const { userId } = getAuth(req)
  const { id } = req.query
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  
  // Validate board ID
  if (!id || !mongoose.Types.ObjectId.isValid(id as string)) {
    return res.status(400).json({ error: 'Invalid board ID' })
  }

  // GET /api/boards/[id] - Get a specific board with its columns and tasks
  if (req.method === 'GET') {
    try {
      const board = await Board.findOne({ _id: id, userId })
        .populate({
          path: 'columns',
          populate: {
            path: 'tasks',
            model: 'Task'
          }
        })
      
      if (!board) {
        return res.status(404).json({ error: 'Board not found' })
      }
      
      return res.status(200).json(board)
    } catch (error) {
      console.error('Error fetching board:', error)
      return res.status(500).json({ error: 'Failed to fetch board' })
    }
  }

  // PUT /api/boards/[id] - Update a board
  if (req.method === 'PUT') {
    try {
      const { name } = req.body
      
      if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Board name is required' })
      }
      
      const updatedBoard = await Board.findOneAndUpdate(
        { _id: id, userId },
        { name, updatedAt: new Date() },
        { new: true }
      )
      
      if (!updatedBoard) {
        return res.status(404).json({ error: 'Board not found' })
      }
      
      return res.status(200).json(updatedBoard)
    } catch (error) {
      console.error('Error updating board:', error)
      return res.status(500).json({ error: 'Failed to update board' })
    }
  }

  // DELETE /api/boards/[id] - Delete a board and its columns/tasks
  if (req.method === 'DELETE') {
    try {
      // Find the board first to verify ownership
      const board = await Board.findOne({ _id: id, userId })
      
      if (!board) {
        return res.status(404).json({ error: 'Board not found' })
      }
      
      // Delete all columns associated with this board
      // This should cascade to delete tasks if your schema is set up correctly
      await Column.deleteMany({ boardId: id })
      
      // Delete the board itself
      await Board.deleteOne({ _id: id })
      
      return res.status(200).json({ success: true, message: 'Board deleted successfully' })
    } catch (error) {
      console.error('Error deleting board:', error)
      return res.status(500).json({ error: 'Failed to delete board' })
    }
  }

  // Handle unsupported methods
  return res.status(405).json({ error: `Method ${req.method} not allowed` })
}
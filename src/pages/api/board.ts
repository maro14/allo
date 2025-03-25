import { getAuth } from '@clerk/nextjs/server'
import type { NextApiRequest, NextApiResponse } from 'next'
import Board from '../../models/Board'
import dbConnect from '../../lib/mongodb'
import mongoose from 'mongoose'
import Column from '../../models/Column'
import Task from '../../models/Task'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect()
    
    const { userId } = getAuth(req)
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    // GET - Retrieve all boards for the user
    if (req.method === 'GET') {
      const boards = await Board.find({ userId })
        .sort({ updatedAt: -1 })
        .select('name createdAt updatedAt')
      
      // Ensure we always return an array, even if empty
      return res.status(200).json({ 
        success: true, 
        data: boards || [] 
      })
    }

    // POST - Create a new board
    if (req.method === 'POST') {
      const { name } = req.body
      
      if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ success: false, error: 'Board name is required' })
      }
      
      // Check for duplicate board names
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
        columns: [] // Explicitly initialize with empty array
      })
      
      await newBoard.save()
      return res.status(201).json({ success: true, data: newBoard })
    }
    
    // PUT - Update a board
    if (req.method === 'PUT') {
      const { id, name } = req.body
      
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, error: 'Valid board ID is required' })
      }
      
      if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ success: false, error: 'Board name is required' })
      }
      
      // Check for duplicate board names (excluding the current board)
      const existingBoard = await Board.findOne({ 
        userId, 
        name: name.trim(),
        _id: { $ne: id }
      })
      
      if (existingBoard) {
        return res.status(400).json({ 
          success: false, 
          error: 'A board with this name already exists' 
        })
      }
      
      const updatedBoard = await Board.findOneAndUpdate(
        { _id: id, userId },
        { name: name.trim(), updatedAt: new Date() },
        { new: true }
      )
      
      if (!updatedBoard) {
        return res.status(404).json({ success: false, error: 'Board not found' })
      }
      
      return res.status(200).json({ success: true, data: updatedBoard })
    }
    
    // DELETE - Delete a board and all its columns and tasks
    if (req.method === 'DELETE') {
      const { id } = req.body
      
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, error: 'Valid board ID is required' })
      }
      
      // Find the board to verify ownership
      const board = await Board.findOne({ _id: id, userId })
      
      if (!board) {
        return res.status(404).json({ success: false, error: 'Board not found' })
      }
      
      // Find all columns associated with this board
      const columns = await Column.find({ boardId: id })
      const columnIds = columns.map(col => col._id)
      
      // Delete all tasks in those columns
      await Task.deleteMany({ columnId: { $in: columnIds } })
      
      // Delete all columns
      await Column.deleteMany({ boardId: id })
      
      // Delete the board
      await Board.deleteOne({ _id: id })
      
      return res.status(200).json({ 
        success: true, 
        message: 'Board and all associated data deleted' 
      })
    }
    
    // Method not allowed
    return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` })
    
  } catch (error) {
    console.error('Board API error:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
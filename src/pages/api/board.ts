import { getAuth } from '@clerk/nextjs/server'
import type { NextApiRequest, NextApiResponse } from 'next'
import Board from '../../models/Board'
import dbConnect from '../../lib/mongodb'
import mongoose from 'mongoose'
import Column from '../../models/Column'
import Task from '../../models/Task'

/**
 * Legacy Board API Handler
 * 
 * Handles CRUD operations for boards:
 * - GET: Retrieves all boards for the authenticated user
 * - POST: Creates a new board with validation
 * - PUT: Updates an existing board
 * - DELETE: Removes a board and all its associated columns and tasks
 * 
 * Note: This is a legacy endpoint. New code should use the /api/boards endpoints
 * which provide better caching and more consistent naming.
 * 
 * @param req - Next.js API request object
 * @param res - Next.js API response object
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect()
    
    const { userId } = getAuth(req)
    
    // Authentication check
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
      
      // Input validation
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
      
      // Validate board ID
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, error: 'Valid board ID is required' })
      }
      
      // Input validation
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
      
      // Update the board
      const updatedBoard = await Board.findOneAndUpdate(
        { _id: id, userId }, // Ensure user owns the board
        { 
          name: name.trim(),
          updatedAt: new Date()
        },
        { new: true }
      )
      
      if (!updatedBoard) {
        return res.status(404).json({ success: false, error: 'Board not found' })
      }
      
      return res.status(200).json({ success: true, data: updatedBoard })
    }
    
    // DELETE - Remove a board
    if (req.method === 'DELETE') {
      const { id } = req.body
      
      // Validate board ID
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, error: 'Valid board ID is required' })
      }
      
      // Find the board to ensure it exists and belongs to the user
      const board = await Board.findOne({ _id: id, userId })
      if (!board) {
        return res.status(404).json({ success: false, error: 'Board not found' })
      }
      
      // Use a session for transaction to ensure data consistency
      const session = await mongoose.startSession()
      session.startTransaction()
      
      try {
        // Get all columns for this board
        const columns = await Column.find({ boardId: id })
        
        // Get all task IDs from these columns
        const taskIds = columns.flatMap(column => column.tasks)
        
        // Delete all tasks, columns, and the board in order
        await Task.deleteMany({ _id: { $in: taskIds } }, { session })
        await Column.deleteMany({ boardId: id }, { session })
        await Board.findByIdAndDelete(id, { session })
        
        await session.commitTransaction()
      } catch (error) {
        await session.abortTransaction()
        throw error
      } finally {
        session.endSession()
      }
      
      return res.status(200).json({ success: true })
    }
    
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
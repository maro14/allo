import { getAuth } from '@clerk/nextjs/server'
import type { NextApiRequest, NextApiResponse } from 'next'
import Board from '../../../models/Board'
import Column from '../../../models/Column'
import Task from '../../../models/Task'  // Make sure this import is correct
import dbConnect from '../../../lib/mongodb'
import mongoose from 'mongoose'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect()
    
    // Force registration of all models before using them
    const ColumnSchema = new mongoose.Schema({
      title: { type: String, required: true },
      tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
      boardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Board' }
    });
    
    const TaskSchema = new mongoose.Schema({
      title: { type: String, required: true },
      description: String,
      columnId: { type: mongoose.Schema.Types.ObjectId, ref: 'Column' },
      position: Number
    });
    
    // Register models if they don't exist
    const ColumnModel = mongoose.models.Column || mongoose.model('Column', ColumnSchema);
    const TaskModel = mongoose.models.Task || mongoose.model('Task', TaskSchema);
    
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
      console.log('Fetching board with ID:', id);
      console.log('Available models:', Object.keys(mongoose.models));
      
      const board = await Board.findOne({ _id: id, userId })
        .populate({
          path: 'columns',
          model: ColumnModel.modelName,
          populate: {
            path: 'tasks',
            model: TaskModel.modelName
          }
        });
      
      console.log('Board found:', board ? 'Yes' : 'No');
      
      if (!board) {
        return res.status(404).json({ error: 'Board not found' })
      }
      
      return res.status(200).json(board)
    }
    
    // Rest of your code...
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ 
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
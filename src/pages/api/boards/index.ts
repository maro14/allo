import { getAuth } from '@clerk/nextjs/server'
import type { NextApiRequest, NextApiResponse } from 'next'
import Board from '../../../models/Board'
import dbConnect from '../../../lib/mongodb'
import serverCache from '../../../lib/serverCache'

/**
 * Boards API Handler
 * 
 * Handles CRUD operations for boards:
 * - GET: Retrieves all boards for the authenticated user with caching
 * - POST: Creates a new board with validation
 * 
 * @param req - Next.js API request object
 * @param res - Next.js API response object
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect();
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (req.method === 'GET') {
      // Cache implementation for better performance
      // Uses a server-side cache with user-specific keys
      const cacheKey = `boards-${userId}`;
      const cachedData = serverCache.get(cacheKey);
      
      if (cachedData) {
        return res.status(200).json({ success: true, data: cachedData, fromCache: true });
      }
      
      const boards = await Board.find({ userId })
        .sort({ updatedAt: -1 })
        .select('name createdAt updatedAt');
      
      // Cache results for 30 seconds
      serverCache.set(cacheKey, boards, 30);
      
      return res.status(200).json({ success: true, data: boards });
    }

    if (req.method === 'POST') {
      const { name } = req.body;
      
      // Input validation
      if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ success: false, error: 'Board name is required' });
      }
      
      // Check for duplicate board names to maintain data integrity
      const existingBoard = await Board.findOne({ userId, name: name.trim() });
      if (existingBoard) {
        return res.status(400).json({ success: false, error: 'A board with this name already exists' });
      }
      
      const newBoard = new Board({ name: name.trim(), userId, columns: [] });
      await newBoard.save();
      
      // Invalidate cache when data changes
      serverCache.remove(`boards-${userId}`);
      
      return res.status(201).json({ success: true, data: newBoard });
    }

    return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ success: false, error: 'Server error', message: error instanceof Error ? error.message : 'Unknown error' });
  }
}
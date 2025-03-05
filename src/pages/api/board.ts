import { getAuth } from '@clerk/nextjs/server'
import type { NextApiRequest, NextApiResponse } from 'next'
import Board from '../../models/Board'
import  dbConnect from '../../lib/mongodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect()
  
  const { userId } = getAuth(req)
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    const boards = await Board.find({ userId }).populate('columns')
    res.status(200).json(boards)
  }

  if (req.method === 'POST') {
    const { name } = req.body
    const newBoard = new Board({ name, userId })
    await newBoard.save()
    res.status(201).json(newBoard)
  }
}
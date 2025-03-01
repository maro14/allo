// pages/api/boards.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import Board from '../../models/Board'
import dbConnect from '../../lib/mongodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect()
  
  if (req.method === 'GET') {
    const boards = await Board.find({ userId: req.query.userId })
    res.status(200).json(boards)
  }
  
  if (req.method === 'POST') {
    const board = await Board.create(req.body)
    res.status(201).json(board)
  }
}
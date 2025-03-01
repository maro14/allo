import { getAuth } from '@clerk/nextjs/server'
import type { NextApiRequest, NextApiResponse } from 'next'
import Column from '../../../models/Column'
import Board from '../../../models/Board'
import dbConnect from '../../../lib/mongodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect()
  
  const { userId } = getAuth(req)
  const { boardId } = req.query

  if (!userId) return res.status(401).json({ error: 'Unauthorized' })

  if (req.method === 'POST') {
    const { title } = req.body
    const newColumn = new Column({ title, boardId })
    await newColumn.save()
    
    // Update board's columns array
    await Board.findByIdAndUpdate(boardId, { $push: { columns: newColumn._id } })
    
    res.status(201).json(newColumn)
  }
}
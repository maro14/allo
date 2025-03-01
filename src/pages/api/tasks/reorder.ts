import type { NextApiRequest, NextApiResponse } from 'next'
import Column from '../../../models/Column'
import dbConnect from '../../../lib/mongoose'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect()
  
  const { columnId, taskIds } = req.body
  
  await Column.findByIdAndUpdate(columnId, { tasks: taskIds })
  res.status(200).json({ success: true })
}
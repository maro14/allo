import { getAuth } from '@clerk/nextjs/server'
import type { NextApiRequest, NextApiResponse } from 'next'
import Task from '../../../models/Task'
import Column from '../../../models/Column'
import dbConnect from '../../../lib/mongoose'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect()
  
  const { userId } = getAuth(req)
  const { columnId } = req.query

  if (!userId) return res.status(401).json({ error: 'Unauthorized' })

  if (req.method === 'POST') {
    const { title, description } = req.body
    const newTask = new Task({ title, description, columnId })
    await newTask.save()
    
    // Update column's tasks array
    await Column.findByIdAndUpdate(columnId, { $push: { tasks: newTask._id } })
    
    res.status(201).json(newTask)
  }
}
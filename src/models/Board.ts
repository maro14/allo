// models/Board.ts
import mongoose, { Schema } from 'mongoose'

const BoardSchema = new Schema({
  name: String,
  userId: String,
  columns: [{ type: Schema.Types.ObjectId, ref: 'Column' }]
})

export default mongoose.models.Board || mongoose.model('Board', BoardSchema)
import mongoose, { Schema } from 'mongoose'

const ColumnSchema = new Schema({
  title: { type: String, required: true },
  tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
  boardId: { type: Schema.Types.ObjectId, ref: 'Board' }
})

export default mongoose.models.Column || mongoose.model('Column', ColumnSchema)
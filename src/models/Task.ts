import mongoose, { Schema } from 'mongoose'

const TaskSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  columnId: { type: Schema.Types.ObjectId, ref: 'Column' },
  position: Number
})

export default mongoose.models.Task || mongoose.model('Task', TaskSchema)
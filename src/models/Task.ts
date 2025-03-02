import mongoose, { Schema } from 'mongoose'

const TaskSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  columnId: { type: Schema.Types.ObjectId, ref: 'Column', required: true },
  position: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Make sure we're using the correct model name consistently
const TaskModel = mongoose.models.Task || mongoose.model('Task', TaskSchema)

export default TaskModel
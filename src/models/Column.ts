import mongoose, { Schema } from 'mongoose'

const ColumnSchema = new Schema({
  title: { 
    type: String, 
    required: true,
    trim: true 
  },
  tasks: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Task',
    default: []
  }],
  boardId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Board',
    required: true,
    index: true
  },
  position: {
    type: Number,
    default: 0
  },
  color: {
    type: String
  },
  limit: {
    type: Number
  }
}, {
  timestamps: true
})

// Add index for common queries
ColumnSchema.index({ boardId: 1, position: 1 });

const ColumnModel = mongoose.models.Column || mongoose.model('Column', ColumnSchema)

export default ColumnModel
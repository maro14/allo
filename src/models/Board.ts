// models/Board.ts
import mongoose, { Schema } from 'mongoose'

const BoardSchema = new Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  userId: { 
    type: String, 
    required: true,
    index: true
  },
  columns: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Column' 
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // This will automatically update the updatedAt field
})

// Create a compound index for faster queries
BoardSchema.index({ userId: 1, name: 1 });

// Make sure we're using the correct model name consistently
const BoardModel = mongoose.models.Board || mongoose.model('Board', BoardSchema)

export default BoardModel
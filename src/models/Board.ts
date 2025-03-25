// models/Board.ts
import mongoose, { Schema } from 'mongoose'

const BoardSchema = new Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  userId: { 
    type: String, 
    required: true,
    index: true
  },
  members: [{
    type: String
  }],
  columns: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Column' 
  }],
  isArchived: {
    type: Boolean,
    default: false
  },
  background: {
    type: String
  }
}, {
  timestamps: true // This will automatically update the updatedAt field
})

// Create compound indexes for faster queries
BoardSchema.index({ userId: 1, name: 1 });
BoardSchema.index({ userId: 1, isArchived: 1 });
BoardSchema.index({ 'members': 1 });

// Make sure we're using the correct model name consistently
const BoardModel = mongoose.models.Board || mongoose.model('Board', BoardSchema)

export default BoardModel
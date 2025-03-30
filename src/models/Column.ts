import mongoose, { Schema } from 'mongoose'

const ColumnSchema = new Schema({
  title: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100 // Add max length validation
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
    default: 0,
    min: 0 // Ensure position is non-negative
  },
  color: {
    type: String,
    default: '#808080', // Default color
    validate: {
      validator: function(v: string) {
        return /^#([0-9A-F]{3}){1,2}$/i.test(v);
      },
      message: 'Color must be a valid hex code'
    }
  },
  limit: {
    type: Number,
    min: 0, // Ensure limit is non-negative
    default: null // No limit by default
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true
})

// Add index for common queries
ColumnSchema.index({ boardId: 1, position: 1 });

// Virtual for task count
ColumnSchema.virtual('taskCount').get(function() {
  return this.tasks ? this.tasks.length : 0;
});

const ColumnModel = mongoose.models.Column || mongoose.model('Column', ColumnSchema)

export default ColumnModel
import mongoose, { Schema } from 'mongoose'

const SubtaskSchema = new Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  assignedTo: { type: String },
}, { timestamps: true })

const TaskSchema = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  subtasks: [SubtaskSchema],
  labels: [{ 
    name: { type: String, required: true },
    color: { type: String, required: true, default: '#3498db' }
  }],
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  columnId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Column', 
    required: true,
    index: true
  },
  boardId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Board',
    index: true
  },
  position: { type: Number, default: 0 },
  createdBy: { type: String },
  assignedTo: [{ type: String }],
  dueDate: { type: Date },
  status: { 
    type: String, 
    enum: ['todo', 'in-progress', 'completed', 'blocked'],
    default: 'todo'
  },
  attachments: [{
    filename: { type: String, required: true },
    url: { type: String, required: true },
    size: { type: Number },
    type: { type: String },
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: { type: String }
  }],
  comments: [{
    content: { type: String, required: true },
    createdBy: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true })

// Add compound indexes for common queries
TaskSchema.index({ columnId: 1, position: 1 });
TaskSchema.index({ boardId: 1, createdAt: -1 });

const TaskModel = mongoose.models.Task || mongoose.model('Task', TaskSchema)

export default TaskModel
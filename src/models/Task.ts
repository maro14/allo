import mongoose, { Schema } from 'mongoose'

const SubtaskSchema = new Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  assignedTo: { type: String },
  dueDate: { type: Date },
}, { timestamps: true })

const CommentSchema = new Schema({
  content: { type: String, required: true },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  mentions: [{ type: String }],
  attachments: [{
    filename: { type: String },
    url: { type: String },
    type: { type: String }
  }]
})

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
    enum: ['low', 'medium', 'high', 'urgent'],
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
  startDate: { type: Date },
  completedAt: { type: Date },
  estimatedHours: { type: Number },
  actualHours: { type: Number },
  status: { 
    type: String, 
    enum: ['todo', 'in-progress', 'review', 'completed', 'blocked'],
    default: 'todo'
  },
  isArchived: { type: Boolean, default: false },
  attachments: [{
    filename: { type: String, required: true },
    url: { type: String, required: true },
    size: { type: Number },
    type: { type: String },
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: { type: String }
  }],
  comments: [CommentSchema],
  watchers: [{ type: String }],
  tags: [{ type: String }],
  customFields: { type: Map, of: Schema.Types.Mixed }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Add compound indexes for common queries
TaskSchema.index({ columnId: 1, position: 1 });
TaskSchema.index({ boardId: 1, createdAt: -1 });
TaskSchema.index({ isArchived: 1, boardId: 1 });
TaskSchema.index({ dueDate: 1, status: 1 });
TaskSchema.index({ 'assignedTo': 1 });

// Virtual for calculating if task is overdue
TaskSchema.virtual('isOverdue').get(function() {
  return this.dueDate && this.dueDate < new Date() && this.status !== 'completed';
});

// Pre-save middleware to update completedAt when status changes to completed
TaskSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  next();
});

const TaskModel = mongoose.models.Task || mongoose.model('Task', TaskSchema)

export default TaskModel
export interface Task {
  _id: string;
  title: string;
  description?: string;
  subtasks?: Subtask[];
  labels?: Label[]; // Changed from string[] to Label[]
  priority: 'low' | 'medium' | 'high';
  columnId?: string;
  boardId?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  createdBy?: string;
  assignedTo?: string[];
  dueDate?: Date | string;
  position?: number;
  status?: 'todo' | 'in-progress' | 'completed' | 'blocked';
  attachments?: Attachment[];
  comments?: Comment[];
}

export interface Subtask {
  _id?: string;
  title: string;
  completed: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  assignedTo?: string;
}

export interface Column {
  _id: string;
  title: string;
  boardId: string;
  tasks: Task[];
  position?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  limit?: number; // Optional WIP limit
  color?: string; // Optional color for the column
}

export interface Board {
  _id: string;
  name: string;
  userId: string;
  columns: Column[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
  description?: string;
  members?: string[]; // User IDs of team members
  isArchived?: boolean;
  background?: string; // Background color or image URL
}

export interface Label {
  _id?: string;
  name: string;
  color: string;
  boardId?: string; // To associate labels with specific boards
}

export interface TaskMove {
  sourceColumnId: string;
  destinationColumnId: string;
  destinationIndex: number;
}

export interface Attachment {
  _id?: string;
  filename: string;
  url: string;
  size?: number;
  type?: string;
  uploadedAt?: Date | string;
  uploadedBy?: string;
}

export interface Comment {
  _id?: string;
  content: string;
  createdAt?: Date | string;
  createdBy: string;
  updatedAt?: Date | string;
}

export interface TaskFilter {
  labels?: string[];
  priority?: ('low' | 'medium' | 'high')[];
  assignedTo?: string[];
  dueDate?: {
    from?: Date | string;
    to?: Date | string;
  };
  status?: ('todo' | 'in-progress' | 'completed' | 'blocked')[];
}
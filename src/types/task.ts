export interface Task {
  _id: string;
  title: string;
  description?: string;
  subtasks?: Subtask[];
  labels?: string[];
  priority: 'low' | 'medium' | 'high';
  columnId?: string;
  boardId?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  createdBy?: string;
  position?: number;
}

export interface Subtask {
  _id?: string;
  title: string;
  completed: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface Column {
  _id: string;
  title: string;
  boardId: string;
  tasks: Task[];
  position?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface Board {
  _id: string;
  name: string;
  userId: string;
  columns: Column[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface Label {
  name: string;
  color: string;
}

export interface TaskMove {
  sourceColumnId: string;
  destinationColumnId: string;
  destinationIndex: number;
}
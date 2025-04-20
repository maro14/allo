// Define your interfaces
export interface Task {
  _id: string;
  title: string;
  description?: string;
  priority?: string;
  labels?: string[];
}

export interface Column {
  _id: string;
  title: string;
  tasks: Task[];
}

export interface Board {
  _id: string;
  name: string;
  columns: Column[];
}

export interface BoardProps {
  boardId: string;
}

export interface DropResult {
  destination: {
    droppableId: string;
    index: number;
  } | null;
  source: {
    droppableId: string;
    index: number;
  };
  draggableId: string;
  type: string;
}
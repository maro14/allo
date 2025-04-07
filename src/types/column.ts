import { Task } from './task';
import { ObjectId } from 'mongoose';

/**
 * Column interface representing a column in a Kanban board
 */
export interface Column {
  _id: string;
  title: string;
  boardId: string;
  position: number;
  tasks: Task[] | string[];
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Column creation payload
 */
export interface CreateColumnPayload {
  title: string;
  boardId: string;
  color?: string;
}

/**
 * Column update payload
 */
export interface UpdateColumnPayload {
  title?: string;
  color?: string;
}

/**
 * Column reorder payload for API requests
 */
export interface ColumnReorderPayload {
  boardId: string;
  columnIds: string[];
}

/**
 * Column with populated tasks
 */
export interface PopulatedColumn extends Omit<Column, 'tasks'> {
  tasks: Task[];
}

/**
 * Column document as stored in MongoDB
 */
export interface ColumnDocument extends Omit<Column, '_id' | 'tasks'> {
  _id: ObjectId;
  tasks: ObjectId[] | string[];
}
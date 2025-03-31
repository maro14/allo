// src/types/board.ts

import { Column } from './column'; // Assuming Column is defined in src/types/column.ts

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
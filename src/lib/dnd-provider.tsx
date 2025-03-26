import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ReactNode } from 'react';

interface DndProviderProps {
  children: ReactNode;
}

export const DragDropProvider = ({ children }: DndProviderProps) => {
  return (
    <DndProvider backend={HTML5Backend}>
      {children}
    </DndProvider>
  );
};
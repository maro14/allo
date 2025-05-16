import { useState } from 'react';
import { Button } from '../ui/Button';
import { PlusIcon } from '@heroicons/react/24/outline';
import { boardService } from '../../services/boardService';

interface AddColumnProps {
  boardId: string;
  onColumnAdded: (newColumn: any) => void;
}

const AddColumn = ({ boardId, onColumnAdded }: AddColumnProps) => {
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [isAddingColumn, setIsAddingColumn] = useState(false);

  const handleAddColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColumnTitle.trim()) return;

    try {
      const result = await boardService.createColumn(boardId, newColumnTitle);
      const newColumn = { ...result.data, tasks: [] };
      onColumnAdded(newColumn);
      setNewColumnTitle('');
      setIsAddingColumn(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create column');
    }
  };

  return (
    <div className="flex-shrink-0 w-80">
      {!isAddingColumn ? (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-3">
          <Button
            onClick={() => setIsAddingColumn(true)}
            className="flex items-center w-full h-12 justify-center"
            variant="outline"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Column
          </Button>
        </div>
      ) : (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-3">
          <form onSubmit={handleAddColumn} className="flex flex-col">
            <input
              type="text"
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              placeholder="Column title"
              className="p-2 border rounded mb-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              autoFocus
            />
            <div className="flex space-x-2">
              <Button type="submit" size="sm">
                Add
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsAddingColumn(false);
                  setNewColumnTitle('');
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AddColumn;
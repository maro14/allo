import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { TrashIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';

interface ColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
  column?: {
    _id: string;
    title: string;
  };
  onDelete?: (columnId: string) => void;
  onUpdate?: (columnId: string, title: string) => void;
  onAdd?: (title: string) => void;
  boardId: string;
}

export const ColumnModal = ({
  isOpen,
  onClose,
  column,
  onDelete,
  onUpdate,
  onAdd,
  boardId
}: ColumnModalProps) => {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens/closes or column changes
  useEffect(() => {
    if (column) {
      setTitle(column.title);
    } else {
      setTitle('');
    }
    setError(null);
  }, [column, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Column title is required');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (column && onUpdate) {
        // Update existing column
        await onUpdate(column._id, title.trim());
      } else if (onAdd) {
        // Add new column
        await onAdd(title.trim());
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!column || !onDelete) return;
    
    if (window.confirm('Are you sure you want to delete this column? All tasks in this column will be deleted.')) {
      setIsSubmitting(true);
      try {
        await onDelete(column._id);
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete column');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {column ? 'Edit Column' : 'Add New Column'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="column-title" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Column Title
            </label>
            <input
              id="column-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter column title"
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          <div className="flex justify-between">
            <div>
              {column && onDelete && (
                <Button
                  type="button"
                  onClick={handleDelete}
                  variant="destructive"
                  disabled={isSubmitting}
                >
                  <TrashIcon className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              )}
            </div>
            <div className="flex space-x-2">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : column ? 'Update' : 'Add'}
                {!isSubmitting && !column && (
                  <CheckIcon className="h-4 w-4 ml-1" />
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};
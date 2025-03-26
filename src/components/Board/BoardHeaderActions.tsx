import { useState } from 'react';
import { 
  EllipsisHorizontalIcon, 
  ArrowPathIcon, 
  ShareIcon,
  AdjustmentsHorizontalIcon,
  CalendarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';

interface BoardHeaderActionsProps {
  onRefresh: () => void;
  boardId: string;
}

export const BoardHeaderActions = ({ onRefresh, boardId }: BoardHeaderActionsProps) => {
  const [showMenu, setShowMenu] = useState(false);
  
  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onRefresh}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ArrowPathIcon className="h-4 w-4" />
          <span className="sr-only md:not-sr-only md:ml-2 text-xs">Refresh</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowMenu(!showMenu)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <EllipsisHorizontalIcon className="h-5 w-5" />
        </Button>
      </div>
      
      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 py-1 border border-gray-200 dark:border-gray-700">
          <button 
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => {/* Implement filter functionality */}}
          >
            <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
            Filter Tasks
          </button>
          
          <button 
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => {/* Implement calendar view */}}
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Calendar View
          </button>
          
          <button 
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => {/* Implement sharing */}}
          >
            <ShareIcon className="h-4 w-4 mr-2" />
            Share Board
          </button>
          
          <button 
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => {/* Implement statistics */}}
          >
            <ChartBarIcon className="h-4 w-4 mr-2" />
            Board Statistics
          </button>
        </div>
      )}
    </div>
  );
};
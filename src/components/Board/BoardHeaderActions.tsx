import { useState } from 'react';
import { 
  EllipsisHorizontalIcon, 
  ArrowPathIcon, 
  ShareIcon,
  AdjustmentsHorizontalIcon,
  CalendarIcon,
  ChartBarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';

interface BoardHeaderActionsProps {
  onRefresh: () => void;
  boardId: string;
  isSaving?: boolean;
  lastSaved?: Date | null;
}

export const BoardHeaderActions = ({ 
  onRefresh, 
  boardId, 
  isSaving = false,
  lastSaved = null 
}: BoardHeaderActionsProps) => {
  const [showMenu, setShowMenu] = useState(false);
  
  // Format the last saved time
  const formatLastSaved = () => {
    if (!lastSaved) return '';
    
    const now = new Date();
    const diff = now.getTime() - lastSaved.getTime();
    
    // If less than a minute ago
    if (diff < 60000) {
      return 'just now';
    }
    
    // If less than an hour ago
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m ago`;
    }
    
    // Format as time
    return lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        {/* Auto-save indicator */}
        {(isSaving || lastSaved) && (
          <div className="text-xs flex items-center text-gray-500 dark:text-gray-400 mr-2">
            {isSaving ? (
              <>
                <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse mr-1"></div>
                <span>Saving...</span>
              </>
            ) : lastSaved ? (
              <>
                <CheckCircleIcon className="h-3 w-3 text-green-500 mr-1" />
                <span>Saved {formatLastSaved()}</span>
              </>
            ) : null}
          </div>
        )}
      
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
import React from 'react';
import { cn } from '../../lib/utils';

interface LoadingSpinnerBoardProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  message?: string;
}

export const LoadingSpinnerBoard: React.FC<LoadingSpinnerBoardProps> = ({
  size = 'md',
  className,
  message = 'Loading board...'
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8 border-2',
    md: 'h-12 w-12 border-3',
    lg: 'h-16 w-16 border-4'
  };

  return (
    <div className={cn(
      'flex flex-col items-center justify-center h-full min-h-[200px] w-full',
      className
    )}>
      <div className={cn(
        'animate-spin rounded-full border-t-transparent border-blue-500',
        sizeClasses[size]
      )} />
      {message && (
        <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinnerBoard;
import { useRouter } from 'next/router'
import Head from 'next/head'
import Board from '../../components/Board'
import { useBoard } from '../../hooks/useBoard'
import { Button } from '../../components/ui/Button'
import { LoadingSpinnerBoard } from '../../components/Board/LoadingSpinnerBoard'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { BoardHeaderActions } from '../../components/Board/BoardHeaderActions'
import { Maximize, Minimize } from 'lucide-react';

const BoardPage = () => {
  const router = useRouter()
  const { id } = router.query
  const boardId = typeof id === 'string' ? id : '';
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const { 
    data: board,
    isLoading,
    error,
    refetch
  } = useBoard(boardId);

  // Toggle fullscreen function
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Refresh board data periodically or when window regains focus
  useEffect(() => {
    if (!refetch) return; // Check for refetch existence
    
    // Refresh when window regains focus
    const handleFocus = () => {
      if (refetch) refetch(); // Safety check
    };
    
    window.addEventListener('focus', handleFocus);
    
    // Optional: Set up periodic refresh (every 30 seconds)
    const refreshInterval = setInterval(() => {
      if (refetch) refetch(); // Safety check
    }, 30000);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(refreshInterval);
    };
  }, [refetch]);

  // Handle authentication errors
  useEffect(() => {
    if (error) {
      // Check if it's an authentication error
      if (error instanceof Error && error.message.includes('401')) {
        toast.error('Your session has expired. Please log in again.');
        // Redirect to login page after a short delay
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        toast.error(`Failed to load board: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }, [error, router]);

  if (isLoading) {
    return <LoadingSpinnerBoard />
  }

  if (error) {
    return (
      <div className="max-w-8xl mx-auto p-4">
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4">
          <h2 className="text-lg font-semibold mb-2">Unable to load board</h2>
          <p className="mb-3">{error instanceof Error ? error.message : 'An error occurred while loading the board'}</p>
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={() => refetch && refetch()} 
              className="mt-2"
              size="sm"
            >
              Try Again
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard')}
              className="mt-2"
              size="sm"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{board?.name || 'Board'} | Allo</title>
        <meta name="description" content={`${board?.name || 'Board'} - Manage your tasks and projects efficiently`} />
      </Head>
      
      <div className={`w-full ${isFullScreen ? 'max-w-full px-2' : 'max-w-7xl px-3 sm:px-4 md:px-6'} mx-auto transition-all duration-300`}>
        <div className="mb-2 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 p-2">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </Button>
          </div>
          
          <div className="flex space-x-2 items-center">
            <button
              onClick={toggleFullScreen}
              className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={isFullScreen ? "Exit full screen" : "Full screen"}
            >
              {isFullScreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </button>
            <BoardHeaderActions 
              onRefresh={() => refetch && refetch()} 
              boardId={boardId} 
            />
          </div>
        </div>
        
        <div className={`${isFullScreen ? 'h-[calc(100vh-3rem)]' : 'h-[calc(100vh-4rem)]'} overflow-auto transition-all duration-300`}>
          {boardId && <Board boardId={boardId} />}
        </div>
      </div>
    </>
  )
}

export default BoardPage
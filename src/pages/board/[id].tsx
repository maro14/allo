import { useRouter } from 'next/router'
import Head from 'next/head'
import Board from '../../components/Board'
import { useBoard } from '../../hooks/useBoard'
import { Button } from '../../components/ui/Button'
import { LoadingSpinnerBoard } from '../../components/Board/LoadingSpinnerBoard'
import { useEffect } from 'react'
import { toast } from 'react-hot-toast'

const BoardPage = () => {
  const router = useRouter()
  const { id } = router.query
  const boardId = typeof id === 'string' ? id : '';
  
  const { 
    data: board,
    isLoading,
    error,
    refetch // Use refetch instead of mutate
  } = useBoard(boardId);

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

  // Add error notification when error occurs
  useEffect(() => {
    if (error) {
      toast.error(`Failed to load board: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [error]);

  if (isLoading) {
    return <LoadingSpinnerBoard />
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4">
          <h2 className="text-lg font-semibold mb-2">Unable to load board</h2>
          <p className="mb-3">{error instanceof Error ? error.message : 'An error occurred while loading the board'}</p>
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={() => refetch && refetch()} // Use refetch here
              className="mt-2"
            >
              Try Again
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard')}
              className="mt-2"
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
      
      <div className="w-full max-w-5xl mx-auto px-3 sm:px-4">
        <div className="mb-2 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
          <div className="flex items-center">
            <h1 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {board?.name}
            </h1>
          </div>
          
          <div className="flex space-x-2">
            {/* Board actions would go here */}
          </div>
        </div>
        
        <div className="h-[calc(100vh-4rem)] overflow-auto">
          {boardId && <Board boardId={boardId} />}
        </div>
      </div>
    </>
  )
}

export default BoardPage
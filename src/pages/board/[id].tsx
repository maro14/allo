import { useRouter } from 'next/router'
import Head from 'next/head'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Board from '../../components/Board'
import { useBoard } from '../../hooks/useBoard'
import { Button } from '../../components/ui/Button'
import { LoadingSpinnerBoard } from '../../components/Board/LoadingSpinnerBoard'
import { useEffect } from 'react'

const BoardPage = () => {
  const router = useRouter()
  const { id } = router.query
  const boardId = typeof id === 'string' ? id : '';
  
  const { 
    data: board,
    isLoading,
    error,
    mutate
  } = useBoard(boardId);

  // Refresh board data periodically or when window regains focus
  useEffect(() => {
    // Refresh when window regains focus
    const handleFocus = () => {
      mutate();
    };
    
    window.addEventListener('focus', handleFocus);
    
    // Optional: Set up periodic refresh (every 30 seconds)
    const refreshInterval = setInterval(() => {
      mutate();
    }, 30000);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(refreshInterval);
    };
  }, [mutate]);

  if (isLoading) {
    return <LoadingSpinnerBoard />
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>Error: {error instanceof Error ? error.message : 'An error occurred'}</p>
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard')}
            className="mt-2"
          >
            Back to Dashboard
          </Button>
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
            <button 
              onClick={() => router.push('/dashboard')}
              className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mr-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              aria-label="Back to dashboard"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span className="ml-1 text-sm font-medium">Back</span>
            </button>
            <h1 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {board?.name}
            </h1>
          </div>
          
          <div className="flex space-x-2">
            {/* Board actions would go here */}
          </div>
        </div>
        
        <div className="h-[calc(100vh-5rem)] overflow-auto">
          {boardId && <Board boardId={boardId} />}
        </div>
      </div>
    </>
  )
}

export default BoardPage
import { useRouter } from 'next/router'
import Head from 'next/head'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Board from '../../components/Board'
import { useBoard } from '../../hooks/useBoard'
import { Button } from '../../components/ui/Button'
import { LoadingSpinnerBoard } from '../../components/Board/LoadingSpinnerBoard'

const BoardPage = () => {
  const router = useRouter()
  const { id } = router.query
  const boardId = typeof id === 'string' ? id : '';
  
  const { 
    data: board,
    isLoading,
    error
  } = useBoard(boardId);

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
      </Head>
      
      <div className="w-full px-6 sm:px-9 m-2">
        <div className="mb-4 max-w-full mx-auto flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
          <div className="flex items-center">
            <button 
              onClick={() => router.push('/dashboard')}
              className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mr-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-base"
            >
              <ArrowLeftIcon className="h-6 w-6" />
              <span className="ml-2 text-base font-medium">Back</span>
            </button>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {board?.name}
            </h1>
          </div>
        </div>
        
        {boardId && <Board boardId={boardId} />}
      </div>
    </>
  )
}

export default BoardPage
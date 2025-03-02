import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Board from '../../components/Board'
import Head from 'next/head'
import { Button } from '../../components/ui/Button'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

const BoardPage = () => {
  const router = useRouter()
  const { id } = router.query
  const [boardName, setBoardName] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    // Just fetch the board name for the page title
    const fetchBoardName = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/boards/${id}`)
        
        if (!res.ok) {
          throw new Error('Failed to load board')
        }
        
        const data = await res.json()
        setBoardName(data.name)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchBoardName()
  }, [id])

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>Error: {error}</p>
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
        <title>{loading ? 'Loading Board...' : boardName} | Allo</title>
      </Head>
      
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Button>
        </div>
        
        {typeof id === 'string' ? (
          <Board boardId={id} />
        ) : (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
    </>
  )
}

export default BoardPage
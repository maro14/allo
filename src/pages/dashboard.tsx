//src/pages/dashboard.tsx
import { useAuth, useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { 
  PlusIcon, 
  CalendarIcon, 
  PencilIcon, 
  TrashIcon,
  CheckIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline'
import { LoadingSpinnerBoard } from '../components/Board/LoadingSpinnerBoard'

// Define proper types for Board
interface Board {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

const Dashboard = () => {
  const { userId } = useAuth()
  const { user } = useUser()
  const [boards, setBoards] = useState<Board[]>([])
  const [newBoardName, setNewBoardName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [editingBoard, setEditingBoard] = useState<Board | null>(null)
  const [editName, setEditName] = useState('')

  useEffect(() => {
    if (!userId) return

    setIsLoading(true)
    fetch('/api/boards')
      .then(res => res.json())
      .then(data => {
        // Check if data is an array, if not, check if it has a data property
        const boardsData = Array.isArray(data) ? data : (data.data || []);
        setBoards(boardsData);
        setIsLoading(false)
      })
      .catch(err => {
        console.error('Error fetching boards:', err)
        setIsLoading(false)
      })
  }, [userId])

  const createBoard = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newBoardName.trim()) return
    
    const res = await fetch('/api/boards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newBoardName })
    })
    
    const newBoard = await res.json()
    setBoards([newBoard.data, ...boards])
    setNewBoardName('')
  }

  const startEditing = (board: Board) => {
    setEditingBoard(board)
    setEditName(board.name)
  }

  const cancelEditing = () => {
    setEditingBoard(null)
    setEditName('')
  }

  const updateBoard = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingBoard || !editName.trim()) return
    
    try {
      const res = await fetch(`/api/boards/${editingBoard._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName })
      })
      
      const result = await res.json()
      
      if (result.success) {
        setBoards(boards.map(board => 
          board._id === editingBoard._id 
            ? { ...board, name: editName } 
            : board
        ))
        setEditingBoard(null)
        setEditName('')
      } else {
        console.error('Failed to update board:', result.error)
      }
    } catch (err) {
      console.error('Error updating board:', err)
    }
  }

  const deleteBoard = async (boardId: string) => {
    if (!confirm('Are you sure you want to delete this board? This action cannot be undone.')) {
      return
    }
    
    try {
      const res = await fetch(`/api/boards/${boardId}`, {
        method: 'DELETE',
      })
      
      const result = await res.json()
      
      if (result.success) {
        setBoards(boards.filter(board => board._id !== boardId))
      } else {
        console.error('Failed to delete board:', result.error)
      }
    } catch (err) {
      console.error('Error deleting board:', err)
    }
  }

  return (
    <DashboardLayout title="Dashboard" username={user?.firstName || 'User'} gridLayout={false}>
      <div className="p-4 md:p-6 max-w-full mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4 md:mb-0 mr-3">
            Your Boards
          </h1>
          
          <form onSubmit={createBoard} className="flex w-full md:w-auto">
            <input
              type="text"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              placeholder="New board name"
              className="p-2 px-4 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white w-full md:w-64 transition-all duration-200"
            />
            <button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-lg transition-all duration-200 flex items-center shadow-sm hover:shadow"
              disabled={!newBoardName.trim()}
            >
              <PlusIcon className="h-5 w-5 mr-1" />
              Create
            </button>
          </form>
        </div>

        {isLoading ? (
          <LoadingSpinnerBoard message="Loading your boards..." />
        ) : (!boards || boards.length === 0) ? (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-12 text-center shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="inline-block p-4 bg-blue-50 dark:bg-blue-900/30 rounded-full mb-4">
              <PlusIcon className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
              You don't have any boards yet.
            </p>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Create your first board to get started!
            </p>
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            {Array.isArray(boards) && boards.map((board, index) => (
              <div key={board._id} className={`bg-gray-800 p-5 rounded-lg border border-gray-700 flex justify-between items-center transform hover:-translate-y-1 transition-all duration-300 ${index === 0 ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}>
                {editingBoard && editingBoard._id === board._id ? (
                  <form onSubmit={updateBoard} className="flex-1 flex items-center">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="p-2 px-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white w-full"
                      autoFocus
                    />
                    <div className="flex ml-3">
                      <button 
                        type="submit" 
                        className="p-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 mr-2"
                        disabled={!editName.trim()}
                      >
                        <CheckIcon className="h-4 w-4" />
                      </button>
                      <button 
                        type="button" 
                        onClick={cancelEditing}
                        className="p-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <Link href={`/board/${board._id}`} className="flex-1 cursor-pointer">
                      <div>
                        <h2 className="text-xl font-semibold text-white">{board.name}</h2>
                        <div className="flex items-center text-sm text-gray-400 mt-2">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {new Date(board.createdAt || Date.now()).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </Link>
                    <div className="flex items-center">
                      <span className="bg-blue-900/30 text-blue-300 text-xs px-2 py-1 rounded-full mr-3">
                        Board
                      </span>
                      <button 
                        onClick={() => startEditing(board)}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md mr-1"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => deleteBoard(board._id)}
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-md"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default Dashboard
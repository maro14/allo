//src/pages/dashboard.tsx
// Import toast for notifications
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
  XMarkIcon,
  ArrowsUpDownIcon // Add for sorting
} from '@heroicons/react/24/outline'
import { LoadingSpinnerBoard } from '../components/Board/LoadingSpinnerBoard'
import toast, { Toaster } from 'react-hot-toast' // Update toast import

// Define proper types for Board
interface Board {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Define toastStyle at module scope
const toastStyle = {
  duration: 3000,
  style: {
    borderRadius: '10px',
    background: '#333',
    color: '#fff',
  },
};

/**
 * Dashboard Component
 * 
 * This component displays a user's kanban boards and provides functionality to:
 * - View all existing boards
 * - Create new boards
 * - Edit board names
 * - Delete boards
 * - Sort boards by different criteria
 * 
 * The component uses React hooks for state management and Clerk for authentication.
 * Toast notifications provide feedback for user actions.
 */
const Dashboard = () => {
  const { userId } = useAuth()
  const { user } = useUser()
  const [boards, setBoards] = useState<Board[]>([])
  const [newBoardName, setNewBoardName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [editingBoard, setEditingBoard] = useState<Board | null>(null)
  const [editName, setEditName] = useState('')
  // Add these new states
  const [isCreating, setIsCreating] = useState(false)
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'alphabetical'>('newest')

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

  /**
   * Creates a new board with the provided name
   * @param e - Form submission event
   */
  const createBoard = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newBoardName.trim()) return
    
    setIsCreating(true) // Show loading state
    try {
      const res = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newBoardName })
      })
      
      const newBoard = await res.json()
      if (newBoard.success) {
        setBoards([newBoard.data, ...boards])
        setNewBoardName('')
        toast.success('Board created successfully!', {
          duration: 4000,
          icon: '🎉',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        })
      } else {
        toast.error(newBoard.error || 'Failed to create board', {
          duration: 4000,
          icon: '❌',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        })
      }
    } catch (err) {
      console.error('Error creating board:', err)
      toast.error('Failed to create board. Please try again.', {
        duration: 4000,
        icon: '❌',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      })
    } finally {
      setIsCreating(false)
    }
  }

  // Add a sort function
  /**
   * Sorts boards based on the current sort order
   * @param boards - Array of board objects to sort
   * @returns Sorted array of boards
   */
  const sortBoards = (boards: Board[]) => {
    if (sortOrder === 'newest') {
      return [...boards].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } else if (sortOrder === 'oldest') {
      return [...boards].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    } else {
      return [...boards].sort((a, b) => a.name.localeCompare(b.name))
    }
  }

  /**
   * Prepares a board for editing by setting state
   * @param board - The board to edit
   */
  const startEditing = (board: Board) => {
    setEditingBoard(board)
    setEditName(board.name)
  }

  /**
   * Cancels the current board editing operation
   */
  const cancelEditing = () => {
    setEditingBoard(null)
    setEditName('')
  }

  /**
   * Updates a board's name in the database
   * @param e - Form submission event
   */
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
        // Near the top of your file, add:
        // const toastStyle = {  // This line will be removed
        //   duration: 3000,
        //   style: {
        //     borderRadius: '10px',
        //     background: '#333',
        //     color: '#fff',
        //   },
        // }
        
        // Then in your code, replace instances like:
        toast.success('Board updated successfully!', {
          ...toastStyle, // This will now refer to the module-scoped toastStyle
          icon: '✅',
        })
      } else {
        console.error('Failed to update board:', result.error)
        toast.error('Failed to update board', {
          duration: 3000,
          icon: '❌',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        })
      }
    } catch (err) {
      console.error('Error updating board:', err)
      toast.error('Error updating board. Please try again.', {
        duration: 3000,
        icon: '❌',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      })
    }
  }

  /**
   * Deletes a board after confirmation
   * @param boardId - ID of the board to delete
   */
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
        toast.success('Board deleted successfully', {
          duration: 3000,
          icon: '🗑️',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        })
      } else {
        console.error('Failed to delete board:', result.error)
        toast.error('Failed to delete board', {
          duration: 3000,
          icon: '❌',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        })
      }
    } catch (err) {
      console.error('Error deleting board:', err)
      toast.error('Error deleting board. Please try again.', {
        duration: 3000,
        icon: '❌',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      })
    }
  }

  // Update your return JSX with improved UI
  return (
    <DashboardLayout title="Dashboard" username={user?.firstName || 'User'} gridLayout={false}>
      {/* Add Toaster component for toast notifications */}
      <Toaster position="bottom-right" toastOptions={{
        className: '',
        style: {
          maxWidth: '500px',
        },
      }} />
      
      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4 md:mb-0 mr-3">
            Your Boards
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="flex items-center">
              <button 
                onClick={() => setSortOrder(sortOrder === 'newest' ? 'alphabetical' : sortOrder === 'alphabetical' ? 'oldest' : 'newest')}
                className="flex items-center text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <ArrowsUpDownIcon className="h-4 w-4 mr-1" />
                Sort: {sortOrder === 'newest' ? 'Newest' : sortOrder === 'oldest' ? 'Oldest' : 'A-Z'}
              </button>
            </div>
            
            <form onSubmit={createBoard} className="flex w-full sm:w-auto">
              <input
                type="text"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                placeholder="New board name"
                className="p-2 px-4 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white w-full transition-all duration-200"
              />
              <button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-lg transition-all duration-200 flex items-center shadow-sm hover:shadow disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={!newBoardName.trim() || isCreating}
              >
                {isCreating ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </span>
                ) : (
                  <>
                    <PlusIcon className="h-5 w-5 mr-1" />
                    Create
                  </>
                )}
              </button>
            </form>
          </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.isArray(boards) && sortBoards(boards).map((board, index) => (
              <div key={board._id} className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col justify-between transform hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md">
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
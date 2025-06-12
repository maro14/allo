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
  XMarkIcon,
  ArrowsUpDownIcon,
  Squares2X2Icon,
  ClockIcon,
  SparklesIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline'

import toast, { Toaster } from 'react-hot-toast'

// Define proper types for Board
interface Board {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Define sort options type
type SortOrder = 'newest' | 'oldest' | 'alphabetical';

// Define the sort options for better type safety
const SORT_OPTIONS: { value: SortOrder; label: string; icon: React.ComponentType<any> }[] = [
  { value: 'newest', label: 'Newest First', icon: SparklesIcon },
  { value: 'oldest', label: 'Oldest First', icon: ClockIcon },
  { value: 'alphabetical', label: 'A-Z', icon: ArrowsUpDownIcon },
];

// Skeleton loader component for better loading states
const BoardCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4"></div>
      <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
    </div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
    </div>
    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
    </div>
  </div>
);

// Enhanced empty state component
const EmptyState = () => (
  <div className="text-center py-16">
    <div className="relative">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full opacity-50"></div>
      </div>
      <div className="relative">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg mb-6">
          <Squares2X2Icon className="h-8 w-8 text-white" />
        </div>
      </div>
    </div>
    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
      No boards yet
    </h3>
    <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
      Create your first board to start organizing your tasks and boost your productivity.
    </p>
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      <div className="inline-flex items-center text-sm text-gray-400 dark:text-gray-500">
        <SparklesIcon className="h-4 w-4 mr-2" />
        Get started in seconds
      </div>
    </div>
  </div>
);

// Define toastStyle at module scope
const toastStyle = {
  duration: 3000,
  style: {
    borderRadius: '12px',
    background: '#1f2937',
    color: '#fff',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
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
          ...toastStyle,
          icon: '🎉',
        })
      } else {
        toast.error(newBoard.error || 'Failed to create board', {
          ...toastStyle,
          icon: '❌',
        })
      }
    } catch (err) {
      console.error('Error creating board:', err)
      toast.error('Failed to create board. Please try again.', {
        ...toastStyle,
        icon: '❌',
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
          ...toastStyle,
          icon: '❌',
        })
      }
    } catch (err) {
      console.error('Error updating board:', err)
      toast.error('Error updating board. Please try again.', {
        ...toastStyle,
        icon: '❌',
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
          ...toastStyle,
          icon: '🗑️',
        })
      } else {
        console.error('Failed to delete board:', result.error)
        toast.error('Failed to delete board', {
          ...toastStyle,
          icon: '❌',
        })
      }
    } catch (err) {
      console.error('Error deleting board:', err)
      toast.error('Error deleting board. Please try again.', {
        ...toastStyle,
        icon: '❌',
      })
    }
  }

  // Update your return JSX with improved UI
  return (
    <DashboardLayout title="Dashboard" username={user?.firstName || 'User'} gridLayout={false}>
      {/* Enhanced Toaster component */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: '',
          style: {
            maxWidth: '400px',
          },
          success: {
            duration: 4000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Enhanced Header Section */}
          <div className="mb-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Title and Stats */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                    <Squares2X2Icon className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Your Boards
                  </h1>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  {boards.length > 0
                    ? `${boards.length} board${boards.length === 1 ? '' : 's'} • Organize your work efficiently`
                    : 'Start organizing your work with boards'
                  }
                </p>
              </div>

              {/* Controls Section */}
              <div className="flex flex-col sm:flex-row gap-4 lg:flex-shrink-0">
                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                    className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 pr-10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ArrowsUpDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Create Board Form */}
                <form onSubmit={createBoard} className="flex gap-2">
                  <div className="relative flex-1 min-w-0">
                    <input
                      type="text"
                      value={newBoardName}
                      onChange={(e) => setNewBoardName(e.target.value)}
                      placeholder="Board name..."
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                      disabled={isCreating}
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 btn-primary text-white font-medium rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    disabled={!newBoardName.trim() || isCreating}
                  >
                    {isCreating ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="hidden sm:inline">Creating...</span>
                      </>
                    ) : (
                      <>
                        <PlusIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">Create Board</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Content Section */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <BoardCardSkeleton key={i} />
              ))}
            </div>
          ) : (!boards || boards.length === 0) ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 board-grid">
              {Array.isArray(boards) && sortBoards(boards).map((board) => (
                <div
                  key={board._id}
                  className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden board-card shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-200 dark:hover:border-blue-800"
                >
                  {editingBoard && editingBoard._id === board._id ? (
                    <div className="p-6">
                      <form onSubmit={updateBoard} className="space-y-4">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white transition-all duration-200"
                          autoFocus
                          placeholder="Board name..."
                        />
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                            disabled={!editName.trim()}
                          >
                            <CheckIcon className="h-4 w-4" />
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditing}
                            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
                          >
                            <XMarkIcon className="h-4 w-4" />
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <>
                      {/* Board Card Header */}
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              startEditing(board);
                            }}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                            title="Edit board"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              deleteBoard(board._id);
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                            title="Delete board"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <Link href={`/board/${board._id}`} className="block p-6 h-full">
                        <div className="flex flex-col h-full">
                          {/* Board Icon and Title */}
                          <div className="flex items-start gap-3 mb-4">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-sm flex-shrink-0">
                              <Squares2X2Icon className="h-5 w-5 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                                {board.name}
                              </h3>
                            </div>
                          </div>

                          {/* Board Stats */}
                          <div className="flex-1 space-y-3 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                              <CalendarIcon className="h-4 w-4" />
                              <span>
                                Created {new Date(board.createdAt || Date.now()).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                              <ClockIcon className="h-4 w-4" />
                              <span>
                                Updated {new Date(board.updatedAt || board.createdAt || Date.now()).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>

                          {/* Board Footer */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                              <Squares2X2Icon className="h-3 w-3 mr-1" />
                              Board
                            </span>
                            <div className="flex items-center text-sm text-gray-400 dark:text-gray-500 group-hover:text-blue-500 transition-colors duration-200">
                              <EyeIcon className="h-4 w-4 mr-1" />
                              <span>View</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Dashboard
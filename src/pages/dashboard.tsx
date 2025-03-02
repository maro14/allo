import { useAuth } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { PlusIcon } from '@heroicons/react/24/outline'

const Dashboard = () => {
  const { userId } = useAuth()
  const [boards, setBoards] = useState<any[]>([])
  const [newBoardName, setNewBoardName] = useState('')

  useEffect(() => {
    if (!userId) return

    fetch('/api/boards')
      .then(res => res.json())
      .then(data => setBoards(data))
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
    setBoards([...boards, newBoard])
    setNewBoardName('')
  }

  return (
    <DashboardLayout title="Dashboard">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2 md:mb-0 mr-3">
            Your Boards
          </h1>
          
          <form onSubmit={createBoard} className="flex w-full md:w-auto">
            <input
              type="text"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              placeholder="New board name"
              className="p-2 px-4 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white w-full md:w-64"
            />
            <button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-lg transition-colors flex items-center"
              disabled={!newBoardName.trim()}
            >
              <PlusIcon className="h-5 w-5 mr-1" />
              Create
            </button>
          </form>
        </div>

        {boards.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 text-center">
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              You don't have any boards yet. Create your first board to get started!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map(board => (
              <Link href={`/board/${board._id}`} key={board._id}>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700 cursor-pointer h-full flex flex-col">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">{board.name}</h2>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-auto pt-4">
                    Created {new Date(board.createdAt || Date.now()).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default Dashboard
import { useAuth } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '../components/layout/DashboardLayout'

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
    <DashboardLayout>
    <div className="p-8">
      <h1 className="text-3xl mb-6">Your Kanban Boards</h1>
      
      <form onSubmit={createBoard} className="mb-8">
        <input
          type="text"
          value={newBoardName}
          onChange={(e) => setNewBoardName(e.target.value)}
          placeholder="New board name"
          className="p-2 border rounded mr-2"
        />
        <button 
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Create Board
        </button>
      </form>

      <div className="grid grid-cols-3 gap-4">
        {boards.map(board => (
          <Link href={`/board/${board._id}`} key={board._id}>
            <div className="bg-white p-4 rounded shadow cursor-pointer hover:bg-gray-50">
              <h2 className="text-xl font-bold">{board.name}</h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </DashboardLayout>
  )
}

export default Dashboard
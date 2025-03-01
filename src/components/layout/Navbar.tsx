import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'

export const Navbar = () => {
  const { signOut, userId } = useAuth()

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between">
        <Link href="/dashboard">
          <span className="text-white text-lg font-bold">Kanban App</span>
        </Link>
        {userId && (
          <button 
            onClick={() => signOut()}
            className="text-white bg-red-500 px-4 py-2 rounded"
          >
            Sign Out
          </button>
        )}
      </div>
    </nav>
  )
}
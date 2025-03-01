import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/router'

const Dashboard = () => {
  const { userId } = useAuth()
  const router = useRouter()

  if (!userId) {
    router.push('/sign-in')
    return null
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl mb-4">Your Kanban Boards</h1>
      {/* Board list will go here */}
    </div>
  )
}

export default Dashboard
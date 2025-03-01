import { useRouter } from 'next/router'
import { Navbar } from '../components/layout/Navbar'

const NotFoundPage = () => {
  const router = useRouter()

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-8 text-center min-h-screen">
        <h1 className="text-4xl font-bold mb-4 text-gray-800 dark:text-white">
          404 - Page Not Found
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          The page you are looking for doesn't exist.
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg 
                    hover:bg-blue-700 transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    </>
  )
}

export default NotFoundPage
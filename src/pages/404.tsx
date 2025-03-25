import { useRouter } from 'next/router'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'

const NotFoundPage = () => {
  const router = useRouter()

  return (
    <>
      <div className="container mx-auto p-8 text-center min-h-screen flex flex-col items-center justify-center">
        <ExclamationTriangleIcon className="h-20 w-20 text-gray-400 mb-6" />
        <h1 className="text-4xl font-bold mb-4 text-gray-800 dark:text-white">
          404 - Page Not Found
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          The page you are looking for doesn't exist.
        </p>
        <Button 
          onClick={() => router.push('/dashboard')}
          size="lg"
        >
          Go to Dashboard
        </Button>
      </div>
    </>
  )
}

export default NotFoundPage
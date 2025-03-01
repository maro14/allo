// components/layout/DashboardLayout.tsx
import { ReactNode } from 'react'
import { Button } from '../ui/Button'

interface DashboardLayoutProps {
  children: ReactNode
  title: string
  onCreate?: () => void
  createButtonText?: string
  isCreating?: boolean
  className?: string
}

export const DashboardLayout = ({
  children,
  title,
  onCreate,
  createButtonText = 'Create New',
  isCreating = false,
  className = ''
}: DashboardLayoutProps) => {
  return (
    <div className={`container mx-auto p-6 ${className}`}>
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          {title}
        </h1>
        {onCreate && (
          <Button
            variant="default"
            onClick={onCreate}
            isLoading={isCreating}
            className="ml-4"
          >
            {createButtonText}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {children}
      </div>
    </div>
  )
}
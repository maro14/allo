// components/layout/DashboardLayout.tsx
import { ReactNode } from 'react'
import { Button } from '../ui/Button'
import Head from 'next/head'

interface DashboardLayoutProps {
  children: ReactNode
  title: string
  username?: string
  description?: string
  onCreate?: () => void
  createButtonText?: string
  isCreating?: boolean
  className?: string
  gridLayout?: boolean
  gridCols?: {
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
}

export const DashboardLayout = ({
  children,
  title,
  username,
  description,
  onCreate,
  createButtonText = 'Create New',
  isCreating = false,
  className = '',
  gridLayout = true,
  gridCols = { sm: 1, md: 2, lg: 3, xl: 4 }
}: DashboardLayoutProps) => {
  return (
    <>
      <Head>
        <title>{title} | Allo</title>
        {description && <meta name="description" content={description} />}
      </Head>
      <div className={`max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 ${className}`}>
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row justify-between md:items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
              {username ? `Welcome, ${username}` : title}
            </h1>
            {description && (
              <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm md:text-base">
                {description}
              </p>
            )}
          </div>
          {onCreate && (
            <Button
              variant="default"
              onClick={onCreate}
              isLoading={isCreating}
              className="mt-4 md:mt-0 md:ml-4"
            >
              {createButtonText}
            </Button>
          )}
        </div>

        {/* Rest of the component remains unchanged */}
        {gridLayout ? (
          <div className={`grid grid-cols-1 ${
            gridCols.md ? `md:grid-cols-${gridCols.md}` : 'md:grid-cols-2'
          } ${
            gridCols.lg ? `lg:grid-cols-${gridCols.lg}` : 'lg:grid-cols-3'
          } ${
            gridCols.xl ? `xl:grid-cols-${gridCols.xl}` : 'xl:grid-cols-4'
          } gap-4 md:gap-6`}>
            {children}
          </div>
        ) : (
          <div>{children}</div>
        )}
      </div>
    </>
  )
}
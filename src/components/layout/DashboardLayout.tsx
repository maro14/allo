// components/layout/DashboardLayout.tsx
import { ReactNode } from 'react'
import { Button } from '../ui/Button'
import Head from 'next/head'
import { PlusIcon, UserIcon, HomeIcon } from '@heroicons/react/24/outline'

/**
 * Interface for DashboardLayout component props
 * @interface DashboardLayoutProps
 * @property {ReactNode} children - Content to be rendered inside the layout
 * @property {string} title - Page title to be displayed in browser tab and optionally in the header
 * @property {string} [username] - Optional username to display in the welcome message
 * @property {string} [description] - Optional description text to display below the title
 * @property {() => void} [onCreate] - Optional callback function for the create button
 * @property {string} [createButtonText] - Text to display on the create button (defaults to "Create New")
 * @property {boolean} [isCreating] - Flag to show loading state on the create button
 * @property {string} [className] - Additional CSS classes to apply to the main container
 * @property {boolean} [gridLayout] - Whether to use grid layout for children (defaults to true)
 * @property {Object} [gridCols] - Configuration for responsive grid columns
 */
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

/**
 * DashboardLayout Component
 * 
 * A reusable layout component for dashboard pages that provides:
 * - Consistent page structure with customizable header
 * - Page title and meta description
 * - Optional welcome message with username
 * - Optional create button with loading state
 * - Flexible grid layout system for content
 * 
 * @param {DashboardLayoutProps} props - Component props
 * @returns {JSX.Element} The rendered dashboard layout
 */
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
      <div className={`max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 ${className}`}>
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row justify-between md:items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white flex items-center">
              {username ? (
                <>
                  <UserIcon className="h-6 w-6 mr-2" />
                  Welcome, {username}
                </>
              ) : (
                <>
                  <HomeIcon className="h-6 w-6 mr-2" />
                  {title}
                </>
              )}
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
              className="mt-4 md:mt-0 md:ml-4 flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-1" />
              {createButtonText}
            </Button>
          )}
        </div>

        {/* Content area with optional grid layout */}
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
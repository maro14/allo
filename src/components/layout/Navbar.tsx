//src/components/layout/Navbar.tsx
import Link from 'next/link'
import { useAuth, UserButton } from '@clerk/nextjs'
import { Bars3Icon } from '@heroicons/react/24/solid'
import { PencilSquareIcon, HomeIcon, MoonIcon, SunIcon } from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'

export const Navbar = () => {
  const { isSignedIn } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Initialize theme based on system preference or localStorage
  useEffect(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true)
      document.documentElement.classList.add('dark')
    } else {
      setIsDarkMode(false)
      document.documentElement.classList.remove('dark')
    }
  }, [])

  // Toggle theme function
  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
      setIsDarkMode(false)
    } else {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
      setIsDarkMode(true)
    }
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link href="/">
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400 flex items-center">
            <span className="bg-blue-600 dark:bg-blue-500 text-white rounded-md p-1 mr-1">A</span>
            llo
          </span>
        </Link>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center gap-3">
          <button 
            onClick={toggleTheme}
            className="text-gray-600 dark:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Toggle theme"
          >
            {isDarkMode ? (
              <SunIcon className="h-5 w-5 text-yellow-400" />
            ) : (
              <MoonIcon className="h-5 w-5 text-gray-600" />
            )}
          </button>
          
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-600 dark:text-gray-300"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all">
              <HomeIcon className="h-4 w-4" />
              Home
            </span>
          </Link>
          
          {isSignedIn ? (
            <>
              <Link href="/dashboard">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all">
                  <PencilSquareIcon className="h-4 w-4" />
                  Boards
                </span>
              </Link>
              
              <button 
                onClick={toggleTheme}
                className="text-gray-600 dark:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Toggle theme"
              >
                {isDarkMode ? (
                  <SunIcon className="h-5 w-5 text-yellow-400" />
                ) : (
                  <MoonIcon className="h-5 w-5 text-gray-600" />
                )}
              </button>
              
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <>
              <button 
                onClick={toggleTheme}
                className="text-gray-600 dark:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Toggle theme"
              >
                {isDarkMode ? (
                  <SunIcon className="h-5 w-5 text-yellow-400" />
                ) : (
                  <MoonIcon className="h-5 w-5 text-gray-600" />
                )}
              </button>
              
              <Link href="/sign-in">
                <button className="text-gray-700 dark:text-gray-300 hover:text-blue-500 
                              transition-colors">
                  Sign In
                </button>
              </Link>
              <Link href="/sign-up">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg 
                              hover:bg-blue-700 transition-colors">
                  Sign Up
                </button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden p-4 bg-white dark:bg-gray-700 border-t dark:border-gray-600">
          <Link href="/">
            <span className="flex items-center gap-2 py-2 text-gray-700 dark:text-gray-300 
                          hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400
                          rounded-lg px-4 transition-all">
              <HomeIcon className="h-5 w-5" />
              Home
            </span>
          </Link>
          
          {isSignedIn ? (
            <>
              <Link href="/dashboard">
                <span className="flex items-center gap-2 py-2 text-gray-700 dark:text-gray-300 
                              hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400
                              rounded-lg px-4 transition-all">
                  <PencilSquareIcon className="h-5 w-5" />
                  Boards
                </span>
              </Link>
              <div className="mt-2 flex justify-center">
                <UserButton afterSignOutUrl="/" />
              </div>
            </>
          ) : (
            <>
              <Link href="/sign-in">
                <button className="w-full text-left py-2 text-gray-700 dark:text-gray-300 
                              hover:bg-gray-100 dark:hover:bg-gray-600 
                              rounded-lg px-4">
                  Sign In
                </button>
              </Link>
              <Link href="/sign-up">
                <button className="w-full py-2 mt-2 bg-blue-600 text-white 
                              rounded-lg hover:bg-blue-700 transition-colors text-center">
                  Sign Up
                </button>
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
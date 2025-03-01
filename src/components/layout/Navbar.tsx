import Link from 'next/link'
import { useAuth, UserButton } from '@clerk/nextjs'
import { Bars3Icon } from '@heroicons/react/24/solid'
import { useState } from 'react'

export const Navbar = () => {
  const { isSignedIn } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link href="/">
          <span className="text-xl font-bold text-gray-800 dark:text-white">
            Allo
          </span>
        </Link>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-600 dark:text-gray-300"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-4">
          {isSignedIn ? (
            <>
              <Link href="/dashboard">
                <span className="text-gray-700 dark:text-gray-300 hover:text-blue-500 
                              transition-colors">
                  Boards
                </span>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <>
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
        <div className="md:hidden p-4 bg-white dark:bg-gray-700">
          {isSignedIn ? (
            <>
              <Link href="/dashboard">
                <span className="block py-2 text-gray-700 dark:text-gray-300 
                              hover:bg-gray-100 dark:hover:bg-gray-600 
                              rounded-lg px-4">
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
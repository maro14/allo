//src/components/layout/Navbar.tsx
import Link from 'next/link'
import { useAuth, UserButton } from '@clerk/nextjs'
import { Bars3Icon } from '@heroicons/react/24/solid'
import { PencilSquareIcon, HomeIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import { useRouter } from 'next/router'

export const Navbar = () => {
  const { isSignedIn } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()
  
  // Helper function to determine if a link is active
  const isActive = (path: string) => router.pathname === path

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link href="/">
          <span className="text-xl font-bold text-blue-600 flex items-center hover:text-blue-700 transition-colors">
            <span className="bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-md p-1 mr-1">A</span>
            llo
          </span>
        </Link>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-3">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Menu"
            aria-expanded={isMenuOpen}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/">
            <span className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all ${
              isActive('/') 
                ? 'bg-blue-50 text-blue-600 font-medium' 
                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50/50'
            }`}>
              <HomeIcon className="h-5 w-5" />
              Home
            </span>
          </Link>
          
          {isSignedIn ? (
            <>
              <Link href="/dashboard">
                <span className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all ${
                  isActive('/dashboard') 
                    ? 'bg-blue-50 text-blue-600 font-medium' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50/50'
                }`}>
                  <PencilSquareIcon className="h-5 w-5" />
                  Boards
                </span>
              </Link>
              
              <div className="ml-3 border-l border-gray-200 pl-3">
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-9 h-9"
                    }
                  }}
                />
              </div>
            </>
          ) : (
            <>
              <Link href="/sign-in">
                <button className={`px-4 py-2 transition-colors ${
                  isActive('/sign-in') 
                    ? 'text-blue-600 font-medium' 
                    : 'text-gray-600 hover:text-blue-600'
                }`}>
                  Sign In
                </button>
              </Link>
              <Link href="/sign-up">
                <button className="bg-gradient-to-br from-blue-600 to-blue-500 text-white px-5 py-2 rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all shadow-sm">
                  Sign Up
                </button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-sm border-t border-gray-100 animate-fadeIn">
          <div className="px-4 py-3 space-y-1">
            <Link href="/">
              <span className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-all ${
                isActive('/') 
                  ? 'bg-blue-50 text-blue-600 font-medium' 
                  : 'text-gray-700 hover:bg-blue-50/50 hover:text-blue-600'
              }`}>
                <HomeIcon className="h-5 w-5" />
                Home
              </span>
            </Link>
            
            {isSignedIn ? (
              <>
                <Link href="/dashboard">
                  <span className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-all ${
                    isActive('/dashboard') 
                      ? 'bg-blue-50 text-blue-600 font-medium' 
                      : 'text-gray-700 hover:bg-blue-50/50 hover:text-blue-600'
                  }`}>
                    <PencilSquareIcon className="h-5 w-5" />
                    Boards
                  </span>
                </Link>
                <div className="pt-3 border-t border-gray-100 mt-3">
                  <div className="flex justify-between items-center px-3">
                    <span className="text-sm text-gray-500">Account</span>
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link href="/sign-in">
                  <button className={`w-full text-left py-2 px-3 rounded-lg transition-all ${
                    isActive('/sign-in') 
                      ? 'bg-blue-50 text-blue-600 font-medium' 
                      : 'text-gray-700 hover:bg-blue-50/50 hover:text-blue-600'
                  }`}>
                    Sign In
                  </button>
                </Link>
                <Link href="/sign-up">
                  <button className="w-full py-2.5 mt-2 bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all">
                    Sign Up
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
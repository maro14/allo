//src/components/layout/Navbar.tsx
import Link from 'next/link'
import { useAuth, UserButton } from '@clerk/nextjs'
import { Bars3Icon } from '@heroicons/react/24/solid'
import { PencilSquareIcon, HomeIcon } from '@heroicons/react/24/outline'
import { useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'

export const Navbar = () => {
  const { isSignedIn } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  
  // Helper function to determine if a link is active
  const isActive = useCallback((path: string) => pathname === path, [pathname])
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])
  
  // Close mobile menu when clicking outside
  useEffect(() => {
    if (!isMenuOpen) return
    
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.mobile-menu') && !target.closest('.mobile-menu-button')) {
        setIsMenuOpen(false)
      }
    }
    
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isMenuOpen])

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" aria-label="Allo Home">
          <span className="text-xl font-bold text-blue-600 flex items-center hover:text-blue-700 transition-colors">
            <span className="bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-md p-1 mr-1" aria-hidden="true">A</span>
            <span>llo</span>
          </span>
        </Link>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-3">
          <button 
            onClick={(e) => {
              e.stopPropagation()
              setIsMenuOpen(!isMenuOpen)
            }}
            className="mobile-menu-button text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/" aria-current={isActive('/') ? 'page' : undefined}>
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
              <Link href="/dashboard" aria-current={isActive('/dashboard') ? 'page' : undefined}>
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
              <Link href="/sign-in" aria-current={isActive('/sign-in') ? 'page' : undefined}>
                <button className={`px-4 py-2 transition-colors ${
                  isActive('/sign-in') 
                    ? 'text-blue-600 font-medium' 
                    : 'text-gray-600 hover:text-blue-600'
                }`}>
                  Sign In
                </button>
              </Link>
              <Link href="/sign-up" aria-current={isActive('/sign-up') ? 'page' : undefined}>
                <button className="bg-gradient-to-br from-blue-600 to-blue-500 text-white px-5 py-2 rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  Sign Up
                </button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div 
        id="mobile-menu"
        className={`mobile-menu md:hidden bg-white/95 backdrop-blur-sm border-t border-gray-100 transition-all duration-200 ease-in-out ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
        aria-hidden={!isMenuOpen}
      >
        <div className="px-4 py-3 space-y-1">
          <Link href="/" aria-current={isActive('/') ? 'page' : undefined}>
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
              <Link href="/dashboard" aria-current={isActive('/dashboard') ? 'page' : undefined}>
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
              <Link href="/sign-in" aria-current={isActive('/sign-in') ? 'page' : undefined}>
                <button className={`w-full text-left py-2 px-3 rounded-lg transition-all ${
                  isActive('/sign-in') 
                    ? 'bg-blue-50 text-blue-600 font-medium' 
                    : 'text-gray-700 hover:bg-blue-50/50 hover:text-blue-600'
                }`}>
                  Sign In
                </button>
              </Link>
              <Link href="/sign-up" aria-current={isActive('/sign-up') ? 'page' : undefined}>
                <button className="w-full py-2.5 mt-2 bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  Sign Up
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
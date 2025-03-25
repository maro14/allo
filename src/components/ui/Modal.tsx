//src/components/ui/Modal.tsx
import { ReactNode, useEffect, RefObject, useRef, useState } from 'react'
import ReactDOM from 'react-dom'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  maxWidth?: string
  position?: { x: number, y: number }
  dragHandleRef?: RefObject<HTMLDivElement | null>
  closeOnBackdropClick?: boolean
  className?: string  // Fixed: Added proper type definition
}

export const Modal = ({
  isOpen,
  onClose,
  children,
  maxWidth = 'max-w-2xl',
  position = { x: 0, y: 0 },
  dragHandleRef,
  closeOnBackdropClick = true,
  className = ''
}: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const [modalPosition, setModalPosition] = useState(position)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [mounted, setMounted] = useState(false)
  
  // Handle component mounting for SSR compatibility
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])
  
  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])
  
  // Implement drag functionality
  useEffect(() => {
    if (!dragHandleRef?.current || !isOpen) return
    
    const handleDragStart = (e: MouseEvent) => {
      if (modalRef.current) {
        setIsDragging(true)
        const rect = modalRef.current.getBoundingClientRect()
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        })
      }
    }
    
    const handleDragMove = (e: MouseEvent) => {
      if (isDragging) {
        // Ensure modal stays within viewport bounds
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight
        const modalWidth = modalRef.current?.offsetWidth || 0
        const modalHeight = modalRef.current?.offsetHeight || 0
        
        const x = Math.max(0, Math.min(e.clientX - dragOffset.x, viewportWidth - modalWidth))
        const y = Math.max(0, Math.min(e.clientY - dragOffset.y, viewportHeight - modalHeight))
        
        setModalPosition({ x, y })
      }
    }
    
    const handleDragEnd = () => {
      setIsDragging(false)
    }
    
    const dragHandle = dragHandleRef.current
    dragHandle.addEventListener('mousedown', handleDragStart)
    window.addEventListener('mousemove', handleDragMove)
    window.addEventListener('mouseup', handleDragEnd)
    
    return () => {
      dragHandle.removeEventListener('mousedown', handleDragStart)
      window.removeEventListener('mousemove', handleDragMove)
      window.removeEventListener('mouseup', handleDragEnd)
    }
  }, [dragHandleRef, isDragging, dragOffset, isOpen])
  
  // Reset position when modal reopens
  useEffect(() => {
    if (isOpen) {
      setModalPosition(position)
    }
  }, [isOpen, position])
  
  // Focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Find the first focusable element
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      
      if (focusableElements.length) {
        (focusableElements[0] as HTMLElement).focus()
      } else {
        modalRef.current.focus()
      }
    }
  }, [isOpen])
  
  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      e.stopPropagation(); // Prevent event bubbling
      onClose();
    }
  }

  const modalStyle = {
    transform: `translate(${modalPosition.x}px, ${modalPosition.y}px)`,
    cursor: isDragging ? 'grabbing' : 'auto'
  }

  if (!isOpen || !mounted) return null

  // Create portal for the modal
  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      <div 
        ref={modalRef}
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl ${maxWidth} w-full 
                   transition-all duration-200 ease-in-out opacity-100 scale-100 
                   overflow-auto max-h-[90vh] animate-scaleIn ${className}`}
        style={modalStyle}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal from closing it
      >
        <div className="relative p-6">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }} 
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 
                     dark:text-gray-300 dark:hover:text-gray-100 p-1 rounded-full 
                     hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close modal"
            type="button"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
          {children}
        </div>
      </div>
    </div>,
    document.getElementById('modal-root') || document.body
  )
}
//src/components/ui/Modal.tsx
import { ReactNode, useEffect, RefObject, useRef, useState } from 'react'
import ReactDOM from 'react-dom'

/**
 * Modal Component
 * 
 * A flexible modal dialog component that supports positioning, dragging,
 * and customizable appearance.
 * 
 * @example
 * ```tsx
 * <Modal 
 *   isOpen={showModal} 
 *   onClose={() => setShowModal(false)}
 *   maxWidth="md"
 * >
 *   <h2>Modal Content</h2>
 *   <p>This is a modal dialog</p>
 * </Modal>
 * ```
 */
interface ModalProps {
  /** Controls modal visibility */
  isOpen: boolean
  /** Function called when modal is closed */
  onClose: () => void
  /** Modal content */
  children: ReactNode
  /** Maximum width of modal (sm, md, lg, xl, or custom value) */
  maxWidth?: string
  /** Custom position coordinates */
  position?: { x: number, y: number }
  /** Reference to element that can be used as drag handle */
  dragHandleRef?: RefObject<HTMLDivElement | null>
  /** Whether clicking the backdrop should close the modal */
  closeOnBackdropClick?: boolean
  /** Additional CSS classes */
  className?: string
  /** Whether to hide the close button */
  hideCloseButton?: boolean
}

export const Modal = ({
  isOpen,
  onClose,
  children,
  maxWidth = 'max-w-2xl',
  position = { x: 0, y: 0 },
  dragHandleRef,
  closeOnBackdropClick = true,
  className = '',
  hideCloseButton = true  // Default to hiding the close button
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
  }, [dragHandleRef, isOpen, isDragging, dragOffset])
  
  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      e.stopPropagation(); // Prevent event bubbling
      onClose();
    }
  }
  
  // Don't render anything on the server or if not open
  if (!mounted || !isOpen) return null
  
  // Use portal to render modal at the root level
  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden ${maxWidth} w-full relative transition-all ${className}`}
        style={{
          transform: dragHandleRef ? `translate(${modalPosition.x}px, ${modalPosition.y}px)` : 'none',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Only render the close button if hideCloseButton is false */}
        {!hideCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>,
    document.getElementById('modal-root') || document.body
  )
}
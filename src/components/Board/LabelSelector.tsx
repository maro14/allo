//src/components/Board/LabelSelector.tsx
import { useState, useRef, useEffect } from 'react'

interface LabelSelectorProps {
  selectedLabels: string[]
  onChange: (labels: string[]) => void
}

// Consider moving this to a constants file if used across components
const LABELS = [
  { name: 'Design', color: '#ef4444' },
  { name: 'Development', color: '#2563eb' },
  { name: 'Testing', color: '#16a34a' },
  { name: 'Urgent', color: '#eab308' }
]

export const LabelSelector = ({ selectedLabels, onChange }: LabelSelectorProps) => {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleLabel = (label: string) => {
    const newLabels = selectedLabels.includes(label)
      ? selectedLabels.filter(l => l !== label)
      : [...selectedLabels, label]
    onChange(newLabels)
  }

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setShowMenu(!showMenu)}
        className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 
                   px-3 py-1 rounded text-sm flex items-center dark:text-gray-200"
        aria-expanded={showMenu}
        aria-haspopup="true"
      >
        <span>Labels</span>
        {selectedLabels.length > 0 && (
          <span className="ml-1 bg-gray-300 dark:bg-gray-600 text-xs rounded-full w-5 h-5 
                         flex items-center justify-center">
            {selectedLabels.length}
          </span>
        )}
      </button>
      
      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border 
                       dark:border-gray-700 rounded shadow-lg dark:shadow-gray-900 z-10">
          {LABELS.map((label) => (
            <div 
              key={label.name}
              className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 
                        cursor-pointer dark:text-gray-200"
              onClick={() => toggleLabel(label.name)}
            >
              <span 
                className="h-3 w-3 rounded-full mr-2"
                style={{ backgroundColor: label.color }}
                aria-hidden="true"
              />
              <span>{label.name}</span>
              {selectedLabels.includes(label.name) && (
                <span className="ml-auto text-green-500">✓</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
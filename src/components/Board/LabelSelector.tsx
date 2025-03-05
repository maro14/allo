//src/components/LabelSelector.tsx
import { useState } from 'react'

interface LabelSelectorProps {
  selectedLabels: string[]
  onChange: (labels: string[]) => void
}

const LABELS = [
  { name: 'Design', color: '#ef4444' },
  { name: 'Development', color: '#2563eb' },
  { name: 'Testing', color: '#16a34a' },
  { name: 'Urgent', color: '#eab308' }
]

export const LabelSelector = ({ selectedLabels, onChange }: LabelSelectorProps) => {
  const [showMenu, setShowMenu] = useState(false)

  const toggleLabel = (label: string) => {
    const newLabels = selectedLabels.includes(label)
      ? selectedLabels.filter(l => l !== label)
      : [...selectedLabels, label]
    onChange(newLabels)
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setShowMenu(!showMenu)}
        className="bg-gray-200 px-3 py-1 rounded"
      >
        Labels
      </button>
      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg">
          {LABELS.map((label) => (
            <div 
              key={label.name}
              className="flex items-center p-2 hover:bg-gray-100"
              onClick={() => toggleLabel(label.name)}
            >
              <span 
                className="h-3 w-3 rounded-full mr-2"
                style={{ backgroundColor: label.color }}
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
interface PrioritySelectorProps {
    priority: string
    onChange: (priority: string) => void
  }
  
  const PRIORITIES = [
    { value: 'urgent', label: 'Urgent', color: '#ef4444' },
    { value: 'high', label: 'High', color: '#f97316' },
    { value: 'medium', label: 'Medium', color: '#eab308' },
    { value: 'low', label: 'Low', color: '#22c55e' }
  ]
  
  export const PrioritySelector = ({ priority, onChange }: PrioritySelectorProps) => {
    return (
      <div className="space-y-2">
        {PRIORITIES.map(p => (
          <div 
            key={p.value}
            className={`flex items-center p-2 rounded cursor-pointer ${
              priority === p.value ? 'border-2 border-blue-500' : ''
            }`}
            onClick={() => onChange(p.value)}
          >
            <span 
              className="h-4 w-4 rounded-full mr-2"
              style={{ backgroundColor: p.color }}
            />
            <span>{p.label}</span>
          </div>
        ))}
      </div>
    )
  }
// src/hooks/useDraggable.ts
import { useState, useRef, useEffect } from 'react'

interface Position {
  x: number
  y: number
}

export const useDraggable = (initialPosition: Position = { x: 0, y: 0 }) => {
  const [position, setPosition] = useState<Position>(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<HTMLDivElement>(null)
  const initialPositionRef = useRef<Position>({ x: 0, y: 0 })
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (dragRef.current && e.target === dragRef.current) {
      setIsDragging(true)
      initialPositionRef.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
      }
    }
  }
  
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - initialPositionRef.current.x,
        y: e.clientY - initialPositionRef.current.y
      })
    }
  }
  
  const handleMouseUp = () => {
    setIsDragging(false)
  }
  
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    } else {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])
  
  const resetPosition = () => {
    setPosition({ x: 0, y: 0 })
  }
  
  return {
    position,
    dragRef,
    handleMouseDown,
    resetPosition
  }
}
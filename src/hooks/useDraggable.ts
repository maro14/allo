// src/hooks/useDraggable.ts
import { useState, useRef, useEffect } from 'react'

interface Position {
  x: number
  y: number
}

interface Boundary {
  minX?: number
  maxX?: number
  minY?: number
  maxY?: number
}

export const useDraggable = (
  initialPosition: Position = { x: 0, y: 0 },
  boundary?: Boundary
) => {
  const [position, setPosition] = useState<Position>(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<HTMLDivElement>(null)
  const initialPositionRef = useRef<Position>({ x: 0, y: 0 })
  
  const constrainPosition = (pos: Position): Position => {
    if (!boundary) return pos
    
    return {
      x: Math.min(
        Math.max(pos.x, boundary.minX ?? -Infinity),
        boundary.maxX ?? Infinity
      ),
      y: Math.min(
        Math.max(pos.y, boundary.minY ?? -Infinity),
        boundary.maxY ?? Infinity
      )
    }
  }
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (dragRef.current && e.target === dragRef.current) {
      e.preventDefault()
      setIsDragging(true)
      initialPositionRef.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
      }
    }
  }
  
  const handleTouchStart = (e: React.TouchEvent) => {
    if (dragRef.current && e.target === dragRef.current) {
      e.preventDefault()
      setIsDragging(true)
      const touch = e.touches[0]
      initialPositionRef.current = {
        x: touch.clientX - position.x,
        y: touch.clientY - position.y
      }
    }
  }
  
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newPosition = {
        x: e.clientX - initialPositionRef.current.x,
        y: e.clientY - initialPositionRef.current.y
      }
      setPosition(constrainPosition(newPosition))
    }
  }
  
  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging) {
      const touch = e.touches[0]
      const newPosition = {
        x: touch.clientX - initialPositionRef.current.x,
        y: touch.clientY - initialPositionRef.current.y
      }
      setPosition(constrainPosition(newPosition))
    }
  }
  
  const handleMouseUp = () => {
    setIsDragging(false)
  }
  
  const handleTouchEnd = () => {
    setIsDragging(false)
  }
  
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchmove', handleTouchMove, { passive: false })
      window.addEventListener('touchend', handleTouchEnd)
    } else {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isDragging])
  
  const resetPosition = () => {
    setPosition(initialPosition)
  }
  
  const setNewPosition = (newPosition: Position) => {
    setPosition(constrainPosition(newPosition))
  }
  
  return {
    position,
    isDragging,
    dragRef,
    handleMouseDown,
    handleTouchStart,
    resetPosition,
    setPosition: setNewPosition
  }
}
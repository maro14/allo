// src/hooks/useDraggable.ts
import { useState, useRef, useEffect, useCallback } from 'react'

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

interface UseDraggableOptions {
  debounceMs?: number
  boundary?: Boundary
}

export const useDraggable = (
  initialPosition: Position = { x: 0, y: 0 },
  options?: UseDraggableOptions
) => {
  const { debounceMs = 10, boundary } = options || {}
  const [position, setPosition] = useState<Position>(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<HTMLDivElement>(null)
  const initialPositionRef = useRef<Position>({ x: 0, y: 0 })
  const lastUpdateTimeRef = useRef<number>(0)
  const pendingPositionRef = useRef<Position | null>(null)
  
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
  
  // Debounced position update
  const updatePositionWithDebounce = useCallback((newPosition: Position) => {
    const now = Date.now()
    const constrainedPosition = constrainPosition(newPosition)
    
    // Store the latest position
    pendingPositionRef.current = constrainedPosition
    
    // If we recently updated, wait for the next frame
    if (now - lastUpdateTimeRef.current < debounceMs) {
      return
    }
    
    // Update position and mark the time
    setPosition(constrainedPosition)
    lastUpdateTimeRef.current = now
    pendingPositionRef.current = null
    
  }, [debounceMs])
  
  // Flush any pending position updates
  const flushPendingUpdates = useCallback(() => {
    if (pendingPositionRef.current) {
      setPosition(pendingPositionRef.current)
      pendingPositionRef.current = null
    }
  }, [])
  
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
      updatePositionWithDebounce(newPosition)
    }
  }
  
  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging) {
      const touch = e.touches[0]
      const newPosition = {
        x: touch.clientX - initialPositionRef.current.x,
        y: touch.clientY - initialPositionRef.current.y
      }
      updatePositionWithDebounce(newPosition)
    }
  }
  
  const handleMouseUp = () => {
    if (isDragging) {
      flushPendingUpdates()
      setIsDragging(false)
    }
  }
  
  const handleTouchEnd = () => {
    if (isDragging) {
      flushPendingUpdates()
      setIsDragging(false)
    }
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
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd])
  
  const resetPosition = () => {
    pendingPositionRef.current = null
    setPosition(initialPosition)
  }
  
  const setNewPosition = (newPosition: Position) => {
    pendingPositionRef.current = null
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
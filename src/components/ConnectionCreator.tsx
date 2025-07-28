import React, { useState, useCallback, useEffect } from 'react'
import { useGridSystem } from '@/hooks/use-grid-system'

interface ConnectionCreatorProps {
  widgets: any[]
  onCreateConnection: (from: any, to: any) => void
}

export function ConnectionCreator({ widgets, onCreateConnection }: ConnectionCreatorProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [startPoint, setStartPoint] = useState<{ x: number; y: number; widgetId: string; port: string } | null>(null)
  const [currentPoint, setCurrentPoint] = useState<{ x: number; y: number } | null>(null)

  const handleConnectionStart = useCallback((widgetId: string, port: string, x: number, y: number) => {
    setIsCreating(true)
    setStartPoint({ x, y, widgetId, port })
    setCurrentPoint({ x, y })
  }, [])

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (isCreating && startPoint) {
      const gridContainer = document.querySelector('[data-grid-container]') as HTMLElement
      if (gridContainer) {
        const rect = gridContainer.getBoundingClientRect()
        setCurrentPoint({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top
        })
      }
    }
  }, [isCreating, startPoint])

  const handleConnectionEnd = useCallback((widgetId: string, port: string) => {
    if (isCreating && startPoint && widgetId !== startPoint.widgetId) {
      onCreateConnection(
        { widgetId: startPoint.widgetId, port: startPoint.port },
        { widgetId, port }
      )
    }
    setIsCreating(false)
    setStartPoint(null)
    setCurrentPoint(null)
  }, [isCreating, startPoint, onCreateConnection])

  const handleCancel = useCallback(() => {
    setIsCreating(false)
    setStartPoint(null)
    setCurrentPoint(null)
  }, [])

  // Add event listeners
  useEffect(() => {
    if (isCreating) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleCancel)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleCancel)
      }
    }
  }, [isCreating, handleMouseMove, handleCancel])

  return {
    isCreating,
    startPoint,
    currentPoint,
    handleConnectionStart,
    handleConnectionEnd,
    handleCancel
  }
}

// Temporary connection line component
export function TempConnectionLine({ 
  startPoint, 
  currentPoint 
}: { 
  startPoint: { x: number; y: number } | null
  currentPoint: { x: number; y: number } | null 
}) {
  if (!startPoint || !currentPoint) return null

  const path = `M ${startPoint.x} ${startPoint.y} L ${currentPoint.x} ${currentPoint.y}`

  return (
    <g className="pointer-events-none">
      <path
        d={path}
        stroke="oklch(0.6 0.15 240)"
        strokeWidth="2"
        fill="none"
        strokeDasharray="5,5"
        className="opacity-70"
      />
      <circle
        cx={startPoint.x}
        cy={startPoint.y}
        r="4"
        fill="oklch(0.6 0.15 240)"
      />
      <circle
        cx={currentPoint.x}
        cy={currentPoint.y}
        r="4"
        fill="oklch(0.5 0.02 240)"
        className="opacity-70"
      />
    </g>
  )
}
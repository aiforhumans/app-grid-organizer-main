import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { useKV } from './use-kv'

export interface GridPosition {
  x: number
  y: number
  width: number
  height: number
}

export interface Widget {
  id: string
  type: string
  position: GridPosition
  data?: any
}

export interface Connection {
  id: string
  from: { widgetId: string; port: string }
  to: { widgetId: string; port: string }
}

export function useGridSystem() {
  const [widgets, setWidgets] = useKV<Widget[]>('widgets', [])
  const [connections, setConnections] = useKV<Connection[]>('connections', [])
  const [isDragging, setIsDragging] = useState(false)
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [tempPosition, setTempPosition] = useState<{ x: number; y: number } | null>(null)
  const lastUpdateTime = useRef(0)

  const gridRef = useRef<HTMLDivElement>(null)

  const GRID_SIZE = 20
  const CELL_SIZE = 120

  const snapToGrid = useCallback((x: number, y: number) => {
    return {
      x: Math.round(x / 20) * 20, // Use literal value instead of GRID_SIZE
      y: Math.round(y / 20) * 20
    }
  }, [])

  const addWidget = useCallback((type: string, position?: Partial<GridPosition>) => {
    const id = `widget-${Date.now()}`
    
    // Define base sizes and scaling factors for different widget types
    const getDefaultSize = (widgetType: string) => {
      switch (widgetType) {
        case 'text-field':
          return { width: 320, height: 180 }
        case 'combine-text':
          return { width: 350, height: 320 } // Will grow with inputs
        case 'add-text':
          return { width: 320, height: 280 }
        case 'remove-text':
          return { width: 320, height: 280 }
        case 'text-replace':
          return { width: 320, height: 300 }
        case 'text-transform':
          return { width: 320, height: 240 }
        case 'prompt-template':
          return { width: 380, height: 400 } // Will grow with variables
        case 'notes':
          return { width: 320, height: 240 }
        case 'calculator':
          return { width: 280, height: 320 }
        case 'timer':
          return { width: 260, height: 180 }
        case 'counter':
          return { width: 220, height: 140 }
        default:
          return { width: 280, height: 200 }
      }
    }
    
    const defaultSize = getDefaultSize(type)
    const newWidget: Widget = {
      id,
      type,
      position: {
        x: position?.x ?? 100,
        y: position?.y ?? 100,
        width: position?.width ?? defaultSize.width,
        height: position?.height ?? defaultSize.height
      }
    }
    
    setWidgets(current => [...current, newWidget])
    return id
  }, [setWidgets])

  const updateWidget = useCallback((id: string, updates: Partial<Widget>) => {
    setWidgets(current => 
      current.map(widget => 
        widget.id === id ? { ...widget, ...updates } : widget
      )
    )
  }, [setWidgets])

  // Auto-resize widget based on content
  const autoResizeWidget = useCallback((id: string, contentHeight: number, contentWidth?: number) => {
    setWidgets(current => 
      current.map(widget => {
        if (widget.id !== id) return widget
        
        const headerHeight = 40 // Header height
        const padding = 24 // Total padding (12px top + 12px bottom)
        const minHeight = 140
        const minWidth = contentWidth || widget.position.width
        
        const newHeight = Math.max(minHeight, contentHeight + headerHeight + padding)
        const newWidth = Math.max(minWidth, contentWidth || widget.position.width)
        
        return {
          ...widget,
          position: {
            ...widget.position,
            height: newHeight,
            width: newWidth
          }
        }
      })
    )
  }, [setWidgets])

  const removeWidget = useCallback((id: string) => {
    setWidgets(current => current.filter(widget => widget.id !== id))
    setConnections(current => 
      current.filter(conn => 
        conn.from.widgetId !== id && conn.to.widgetId !== id
      )
    )
  }, [setWidgets, setConnections])

  const startDrag = useCallback((widgetId: string, event: React.MouseEvent) => {
    const widget = widgets.find(w => w.id === widgetId)
    if (!widget || !gridRef.current) {
      console.log('❌ startDrag failed:', { hasWidget: !!widget, hasGridRef: !!gridRef.current })
      return
    }

    // Get the widget container element from the grid
    const widgetContainer = gridRef.current.querySelector(`[data-widget-id="${widgetId}"]`)
    const widgetElement = widgetContainer?.firstElementChild as HTMLElement
    if (!widgetElement) {
      console.log('❌ Widget element not found:', widgetId)
      return
    }

    const gridRect = gridRef.current.getBoundingClientRect()
    const widgetRect = widgetElement.getBoundingClientRect()
    
    // Calculate offset relative to the widget's current position
    const offsetX = event.clientX - widgetRect.left
    const offsetY = event.clientY - widgetRect.top
    
    setDraggedWidget(widgetId)
    setIsDragging(true)  
    setDragOffset({ x: offsetX, y: offsetY })
    
    // Prevent text selection during drag
    document.body.style.userSelect = 'none'
  }, [widgets])

  const handleDrag = useCallback((event: MouseEvent) => {
    if (!isDragging || !draggedWidget || !gridRef.current) return

    // Throttle updates to improve performance (60fps max)
    const now = Date.now()
    if (now - lastUpdateTime.current < 16) return // ~60fps
    lastUpdateTime.current = now

    const gridRect = gridRef.current.getBoundingClientRect()
    const newPosition = snapToGrid(
      event.clientX - gridRect.left - dragOffset.x,
      event.clientY - gridRect.top - dragOffset.y
    )

    // Find the actual widget to get its dimensions
    const currentWidget = widgets.find(w => w.id === draggedWidget)
    if (!currentWidget) return

    // Ensure the widget stays within bounds using actual widget dimensions
    const clampedPosition = {
      x: Math.max(0, Math.min(newPosition.x, gridRect.width - currentWidget.position.width)),
      y: Math.max(0, Math.min(newPosition.y, gridRect.height - currentWidget.position.height))
    }

    // Only update temp position, don't update the actual widgets array during drag
    setTempPosition(clampedPosition)
  }, [isDragging, draggedWidget, dragOffset, widgets])

  const endDrag = useCallback(() => {
    // Apply the final position when drag ends
    if (tempPosition && draggedWidget) {
      setWidgets(currentWidgets => 
        currentWidgets.map(w => 
          w.id === draggedWidget ? {
            ...w,
            position: {
              ...w.position,
              x: tempPosition.x,
              y: tempPosition.y
            }
          } : w
        )
      )
    }
    
    setIsDragging(false)
    setDraggedWidget(null)
    setDragOffset({ x: 0, y: 0 })
    setTempPosition(null)
    
    // Restore text selection
    document.body.style.userSelect = ''
  }, [tempPosition, draggedWidget, setWidgets])

  // Event listeners for drag functionality
  useEffect(() => {
    if (!isDragging) return
    
    const handleMouseMove = (e: MouseEvent) => {
      handleDrag(e)
    }
    
    const handleMouseUp = () => {
      endDrag()
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, handleDrag, endDrag])

  const addConnection = useCallback((from: Connection['from'], to: Connection['to']) => {
    const id = `connection-${Date.now()}`
    const newConnection: Connection = { id, from, to }
    setConnections(current => [...current, newConnection])
  }, [setConnections])

  const removeConnection = useCallback((id: string) => {
    setConnections(current => current.filter(conn => conn.id !== id))
  }, [setConnections])

  // Compute widgets with temporary drag position
  const displayWidgets = useMemo(() => {
    if (!isDragging || !draggedWidget || !tempPosition) {
      return widgets
    }
    
    return widgets.map(w => 
      w.id === draggedWidget ? {
        ...w,
        position: {
          ...w.position,
          x: tempPosition.x,
          y: tempPosition.y
        }
      } : w
    )
  }, [widgets, isDragging, draggedWidget, tempPosition])

  return {
    widgets: displayWidgets,
    connections,
    draggedWidget,
    isDragging,
    gridRef,
    addWidget,
    updateWidget,
    autoResizeWidget,
    removeWidget,
    startDrag,
    handleDrag,
    endDrag,
    addConnection,
    removeConnection,
    GRID_SIZE,
    CELL_SIZE
  }
}
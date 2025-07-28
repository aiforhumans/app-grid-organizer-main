import { useEffect, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { useGridSystem, Connection } from '@/hooks/use-grid-system'
import { GridWidget } from './GridWidget'
import { ConnectionLine } from './ConnectionLine'
import { ConnectionInfo } from './ConnectionInfo'
import { ConnectionStats } from './ConnectionStats'
import { WidgetPalette } from './WidgetPalette'
import { TempConnectionLine } from './ConnectionCreator'
import { ConnectionFieldSelector } from './ConnectionFieldSelector'

export function GridContainer() {
  const {
    widgets,
    connections,
    draggedWidget,
    isDragging,
    gridRef,
    handleDrag,
    endDrag,
    addWidget,
    updateWidget,
    autoResizeWidget,
    removeWidget,
    addConnection,
    removeConnection,
    getConnectedInputs,
    getWidgetInputFields,
    getPromptTemplateInputFields,
    startDrag,
    GRID_SIZE
  } = useGridSystem()

  // Connection creation state
  const [isCreatingConnection, setIsCreatingConnection] = useState(false)
  const [connectionStart, setConnectionStart] = useState<{
    x: number
    y: number
    widgetId: string
    port: string
  } | null>(null)
  const [currentMousePos, setCurrentMousePos] = useState<{ x: number; y: number } | null>(null)
  const [connectionTargetWidget, setConnectionTargetWidget] = useState<string | null>(null)
  
  // Field selection state
  const [showFieldSelector, setShowFieldSelector] = useState(false)
  const [fieldSelectorData, setFieldSelectorData] = useState<{
    position: { x: number; y: number }
    targetWidget: any
    availableFields: Array<{ key: string; label: string }>
  } | null>(null)
  
  // Connection info state
  const [selectedConnection, setSelectedConnection] = useState<{
    connection: Connection
    position: { x: number; y: number }
  } | null>(null)

  const handleConnectionStart = useCallback((widgetId: string, port: string, x: number, y: number) => {
    setIsCreatingConnection(true)
    setConnectionStart({ x, y, widgetId, port })
    setCurrentMousePos({ x, y })
  }, [])

  const handleConnectionEnd = useCallback((widgetId: string, port: string) => {
    if (isCreatingConnection && connectionStart && widgetId !== connectionStart.widgetId) {
      const targetWidget = widgets.find(w => w.id === widgetId)
      if (!targetWidget) return
      
      // Get available fields for this widget
      let availableFields = getWidgetInputFields(targetWidget.type)
      
      // For prompt template, get dynamic fields
      if (targetWidget.type === 'prompt-template') {
        availableFields = getPromptTemplateInputFields(targetWidget)
      }
      
      if (availableFields.length === 0) {
        // No fields available, cancel connection
        handleConnectionCancel()
        return
      }
      
      if (availableFields.length === 1) {
        // Only one field, connect directly
        addConnection(
          { widgetId: connectionStart.widgetId, port: connectionStart.port },
          { widgetId, port: availableFields[0].key }
        )
        handleConnectionCancel()
      } else {
        // Multiple fields, show selector
        const rect = gridRef.current?.getBoundingClientRect()
        const targetPosition = {
          x: (rect?.left || 0) + targetWidget.position.x + targetWidget.position.width / 2,
          y: (rect?.top || 0) + targetWidget.position.y + targetWidget.position.height / 2
        }
        
        setFieldSelectorData({
          position: targetPosition,
          targetWidget,
          availableFields
        })
        setShowFieldSelector(true)
      }
    } else {
      handleConnectionCancel()
    }
  }, [isCreatingConnection, connectionStart, widgets, getWidgetInputFields, getPromptTemplateInputFields, addConnection, gridRef])

  const handleConnectionCancel = useCallback(() => {
    setIsCreatingConnection(false)
    setConnectionStart(null)
    setCurrentMousePos(null)
    setConnectionTargetWidget(null)
    setShowFieldSelector(false)
    setFieldSelectorData(null)
  }, [])

  const handleShowConnectionInfo = useCallback((connection: Connection, position: { x: number; y: number }) => {
    setSelectedConnection({ connection, position })
  }, [])

  const handleCloseConnectionInfo = useCallback(() => {
    setSelectedConnection(null)
  }, [])

  const handleFieldSelect = useCallback((fieldKey: string) => {
    if (connectionStart && fieldSelectorData) {
      addConnection(
        { widgetId: connectionStart.widgetId, port: connectionStart.port },
        { widgetId: fieldSelectorData.targetWidget.id, port: fieldKey }
      )
    }
    handleConnectionCancel()
  }, [connectionStart, fieldSelectorData, addConnection])

  const handleFieldSelectorCancel = useCallback(() => {
    handleConnectionCancel()
  }, [])

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (isCreatingConnection && connectionStart && gridRef.current) {
      const rect = gridRef.current.getBoundingClientRect()
      const newPos = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      }
      setCurrentMousePos(newPos)

      // Check if mouse is over a potential connection target
      const elementsAtPoint = document.elementsFromPoint(event.clientX, event.clientY)
      const widgetElement = elementsAtPoint.find(el => 
        el.getAttribute('data-widget-id') && 
        el.getAttribute('data-widget-id') !== connectionStart.widgetId
      )
      
      if (widgetElement) {
        const targetId = widgetElement.getAttribute('data-widget-id')
        setConnectionTargetWidget(targetId)
      } else {
        setConnectionTargetWidget(null)
      }
    }
  }, [isCreatingConnection, connectionStart, gridRef])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape key to cancel connection creation or close connection info
      if (event.key === 'Escape') {
        if (showFieldSelector) {
          handleFieldSelectorCancel()
        } else if (isCreatingConnection) {
          handleConnectionCancel()
        } else if (selectedConnection) {
          handleCloseConnectionInfo()
        }
      }
      
      // Delete key to remove selected connection
      if (event.key === 'Delete' && selectedConnection) {
        removeConnection(selectedConnection.connection.id)
        handleCloseConnectionInfo()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isCreatingConnection, selectedConnection, showFieldSelector, handleConnectionCancel, handleCloseConnectionInfo, handleFieldSelectorCancel, removeConnection])

  // Removed duplicate drag event listeners - these are now handled in use-grid-system.ts

  useEffect(() => {
    if (isCreatingConnection && !isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleConnectionCancel)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleConnectionCancel)
      }
    }
  }, [isCreatingConnection, isDragging, handleMouseMove, handleConnectionCancel])

  return (
    <div className="h-screen bg-background overflow-hidden">
      <div className="flex h-full">
        <WidgetPalette onAddWidget={addWidget} />
        
        <div className="flex-1 relative flex flex-col">
          {/* Status bar */}
          {(connections.length > 0 || isCreatingConnection) && (
            <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b border-border/50">
              <ConnectionStats 
                connections={connections} 
                widgets={widgets} 
              />
              {isCreatingConnection && (
                <div className="text-xs text-accent font-medium">
                  Creating connection... (ESC to cancel)
                </div>
              )}
            </div>
          )}
          
          <div
            ref={gridRef}
            data-grid-container
            className={cn(
              "flex-1 relative overflow-auto",
              "bg-gradient-to-br from-muted/30 to-muted/10",
              isCreatingConnection && "cursor-crosshair"
            )}
            style={{
              backgroundImage: `
                radial-gradient(circle at 1px 1px, rgb(0 0 0 / 0.05) 1px, transparent 0)
              `,
              backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`
            }}
          >
            {/* Grid widgets */}
            {widgets.map(widget => (
              <div
                key={widget.id}
                data-widget-id={widget.id}
              >
                <GridWidget
                  widget={widget}
                  isDragging={draggedWidget === widget.id}
                  connections={connections}
                  onConnectionStart={handleConnectionStart}
                  onConnectionEnd={handleConnectionEnd}
                  isConnectionTarget={connectionTargetWidget === widget.id}
                  startDrag={startDrag}
                  updateWidget={updateWidget}
                  autoResizeWidget={autoResizeWidget}
                  removeWidget={removeWidget}
                  getConnectedInputs={getConnectedInputs}
                />
              </div>
            ))}

            {/* Connection lines */}
            <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
              {connections.map(connection => (
                <g key={connection.id} style={{ pointerEvents: 'auto' }}>
                  <ConnectionLine
                    connection={connection}
                    widgets={widgets}
                    onRemove={removeConnection}
                    onShowInfo={handleShowConnectionInfo}
                  />
                </g>
              ))}
              
              {/* Temporary connection line while creating */}
              {isCreatingConnection && connectionStart && currentMousePos && (
                <TempConnectionLine
                  startPoint={connectionStart}
                  currentPoint={currentMousePos}
                />
              )}
            </svg>

            {/* Grid overlay when dragging */}
            {isDragging && (
              <div className="absolute inset-0 pointer-events-none">
                <div
                  className="w-full h-full opacity-20"
                  style={{
                    backgroundImage: `
                      linear-gradient(to right, rgb(59 130 246 / 0.3) 1px, transparent 1px),
                      linear-gradient(to bottom, rgb(59 130 246 / 0.3) 1px, transparent 1px)
                    `,
                    backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`
                  }}
                />
              </div>
            )}

            {/* Connection creation overlay */}
            {isCreatingConnection && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="w-full h-full bg-accent/5" />
              </div>
            )}

            {/* Connection info tooltip */}
            {selectedConnection && (
              <ConnectionInfo
                connection={selectedConnection.connection}
                widgets={widgets}
                position={selectedConnection.position}
                onRemove={removeConnection}
                onClose={handleCloseConnectionInfo}
              />
            )}

            {/* Connection field selector */}
            {showFieldSelector && fieldSelectorData && (
              <ConnectionFieldSelector
                position={fieldSelectorData.position}
                targetWidget={fieldSelectorData.targetWidget}
                availableFields={fieldSelectorData.availableFields}
                onSelectField={handleFieldSelect}
                onCancel={handleFieldSelectorCancel}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
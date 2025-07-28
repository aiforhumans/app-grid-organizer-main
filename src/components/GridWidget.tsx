import { useMemo, memo } from 'react'
import { useGridSystem, Connection } from '@/hooks/use-grid-system'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, DotsSixVertical, Gear, ArrowRight, ArrowLeft, Link } from '@phosphor-icons/react'
import { Widget } from '@/hooks/use-grid-system'
import { CalculatorWidget } from './widgets/CalculatorWidget'
import { NotesWidget } from './widgets/NotesWidget'
import { TimerWidget } from './widgets/TimerWidget'
import { CounterWidget } from './widgets/CounterWidget'
import { TextFieldWidget } from './widgets/TextFieldWidget'
import { CombineTextWidget } from './widgets/CombineTextWidget'
import { AddTextWidget } from './widgets/AddTextWidget'
import { RemoveTextWidget } from './widgets/RemoveTextWidget'
import { TextReplaceWidget } from './widgets/TextReplaceWidget'
import { TextTransformWidget } from './widgets/TextTransformWidget'
import { PromptTemplateWidget } from './widgets/PromptTemplateWidget'

interface GridWidgetProps {
  widget: Widget
  isDragging: boolean
  connections?: Connection[]
  onConnectionStart?: (widgetId: string, port: string, x: number, y: number) => void
  onConnectionEnd?: (widgetId: string, port: string) => void
  isConnectionTarget?: boolean
  startDrag: (widgetId: string, event: React.MouseEvent) => void
  updateWidget: (id: string, updates: Partial<Widget>) => void
  autoResizeWidget?: (id: string, contentHeight: number, contentWidth?: number) => void
  removeWidget: (id: string) => void
  getConnectedInputs?: (widgetId: string) => Record<string, any>
}

function GridWidgetComponent({ 
  widget, 
  isDragging, 
  connections = [],
  onConnectionStart, 
  onConnectionEnd, 
  isConnectionTarget,
  startDrag,
  updateWidget,
  autoResizeWidget,
  removeWidget,
  getConnectedInputs
}: GridWidgetProps) {
  // Remove the useGridSystem call to prevent circular dependencies

  // Count connections for this widget
  const connectionCount = useMemo(() => {
    return connections.filter(conn => 
      conn.from.widgetId === widget.id || conn.to.widgetId === widget.id
    ).length
  }, [connections, widget.id])

  const WidgetComponent = useMemo(() => {
    switch (widget.type) {
      case 'calculator':
        return CalculatorWidget
      case 'notes':
        return NotesWidget
      case 'timer':
        return TimerWidget
      case 'counter':
        return CounterWidget
      case 'text-field':
        return TextFieldWidget
      case 'combine-text':
        return CombineTextWidget
      case 'add-text':
        return AddTextWidget
      case 'remove-text':
        return RemoveTextWidget
      case 'text-replace':
        return TextReplaceWidget
      case 'text-transform':
        return TextTransformWidget
      case 'prompt-template':
        return PromptTemplateWidget
      default:
        return () => <div className="p-4 text-muted-foreground">Unknown widget</div>
    }
  }, [widget.type])

  const handleMouseDown = (e: React.MouseEvent) => {
    // Prevent dragging when clicking on specific interactive elements
    const target = e.target as HTMLElement
    
    // Check if clicking on connection points - these handle their own events
    if (target.closest('[data-connection-point]')) {
      return
    }
    
    // Check if clicking on buttons that aren't drag handles
    if (target.tagName === 'BUTTON' && !target.closest('.drag-handle')) {
      return
    }
    
    // Check if clicking on form inputs - let them handle their own events
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return
    }
    
    // Check if clicking on interactive widget content elements
    if (target.closest('.widget-content') && (
      target.tagName === 'BUTTON' || 
      target.tagName === 'INPUT' || 
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.closest('button')
    )) {
      return
    }
    
    // Start dragging for all other clicks
    e.preventDefault()
    e.stopPropagation()
    startDrag(widget.id, e)
  }

  const handleOutputConnectionStart = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (onConnectionStart) {
      const rect = e.currentTarget.getBoundingClientRect()
      const gridContainer = document.querySelector('[data-grid-container]') as HTMLElement
      const gridRect = gridContainer?.getBoundingClientRect()
      if (gridRect) {
        onConnectionStart(
          widget.id, 
          'output',
          rect.left + rect.width / 2 - gridRect.left,
          rect.top + rect.height / 2 - gridRect.top
        )
      }
    }
  }

  const handleInputConnectionEnd = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (onConnectionEnd) {
      onConnectionEnd(widget.id, 'input')
    }
  }

  return (
    <Card
      className={cn(
        "absolute select-none transition-all duration-200",
        "border-2 hover:border-accent/50",
        "shadow-sm hover:shadow-md",
        isDragging && "shadow-lg border-accent scale-105 z-50 cursor-grabbing",
        !isDragging && "cursor-pointer",
        isConnectionTarget && "border-accent/70 shadow-lg ring-2 ring-accent/20",
        "group"
      )}
      style={{
        left: widget.position.x,
        top: widget.position.y,
        width: widget.position.width,
        height: widget.position.height
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Widget header with controls */}
      <div className="widget-header flex items-center justify-between p-2 border-b bg-card/50 rounded-t-md cursor-move drag-handle">
        <div className="flex items-center gap-2 drag-handle cursor-move">
          <DotsSixVertical 
            className="w-4 h-4 text-muted-foreground drag-handle opacity-0 group-hover:opacity-100 transition-opacity" 
          />
          <span className="text-sm font-medium capitalize drag-handle">{widget.type}</span>
          {connectionCount > 0 && (
            <Badge variant="outline" className="h-5 px-1.5 text-xs flex items-center gap-1 drag-handle">
              <Link className="w-3 h-3" />
              {connectionCount}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation()
              // TODO: Open widget settings
            }}
          >
            <Gear className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation()
              removeWidget(widget.id)
            }}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden widget-content">
        <WidgetComponent 
          widget={widget}
          updateWidget={updateWidget}
          autoResizeWidget={autoResizeWidget ? (contentHeight: number, contentWidth?: number) => autoResizeWidget(widget.id, contentHeight, contentWidth) : undefined}
          connectedInputs={getConnectedInputs ? getConnectedInputs(widget.id) : {}}
        />
      </div>

      {/* Enhanced connection points */}
      <div className="absolute -right-2 top-1/2 -translate-y-1/2" data-connection-point>
        <div 
          className={cn(
            "w-5 h-5 bg-accent rounded-full border-2 border-background",
            "opacity-0 group-hover:opacity-100 transition-all duration-200",
            "cursor-pointer hover:scale-110 hover:shadow-lg",
            "flex items-center justify-center"
          )}
          onMouseDown={handleOutputConnectionStart}
          title="Drag to create connection"
          data-connection-point
        >
          <ArrowRight className="w-2.5 h-2.5 text-accent-foreground" />
        </div>
      </div>
      <div 
        className="absolute -left-2 top-1/2 -translate-y-1/2"
        onMouseUp={handleInputConnectionEnd}
        data-connection-point
      >
        <div 
          className={cn(
            "w-5 h-5 bg-muted rounded-full border-2 border-background",
            "opacity-0 group-hover:opacity-100 transition-all duration-200",
            "cursor-pointer hover:scale-110 hover:shadow-lg",
            "flex items-center justify-center",
            isConnectionTarget && "opacity-100 bg-accent animate-pulse"
          )}
          title="Connection input"
          data-connection-point
        >
          <ArrowLeft className="w-2.5 h-2.5 text-muted-foreground" />
        </div>
      </div>
    </Card>
  )
}

// Memoize the component to prevent unnecessary re-renders
export const GridWidget = memo(GridWidgetComponent)
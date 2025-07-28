import { useState } from 'react'
import { Connection, Widget } from '@/hooks/use-grid-system'

interface ConnectionLineProps {
  connection: Connection
  widgets: Widget[]
  onRemove?: (connectionId: string) => void
  onShowInfo?: (connection: Connection, position: { x: number; y: number }) => void
}

export function ConnectionLine({ connection, widgets, onRemove, onShowInfo }: ConnectionLineProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isSelected, setIsSelected] = useState(false)
  
  const fromWidget = widgets.find(w => w.id === connection.from.widgetId)
  const toWidget = widgets.find(w => w.id === connection.to.widgetId)

  if (!fromWidget || !toWidget) return null

  // Calculate connection points
  const fromX = fromWidget.position.x + fromWidget.position.width
  const fromY = fromWidget.position.y + fromWidget.position.height / 2
  const toX = toWidget.position.x
  const toY = toWidget.position.y + toWidget.position.height / 2

  // Enhanced bezier curve calculation
  const distance = Math.abs(toX - fromX)
  const controlPointOffset = Math.max(distance * 0.3, 50)
  const path = `M ${fromX} ${fromY} C ${fromX + controlPointOffset} ${fromY}, ${toX - controlPointOffset} ${toY}, ${toX} ${toY}`

  // Calculate midpoint for delete button
  const t = 0.5
  const midX = Math.pow(1-t, 3) * fromX + 3 * Math.pow(1-t, 2) * t * (fromX + controlPointOffset) + 
              3 * (1-t) * Math.pow(t, 2) * (toX - controlPointOffset) + Math.pow(t, 3) * toX
  const midY = Math.pow(1-t, 3) * fromY + 3 * Math.pow(1-t, 2) * t * fromY + 
              3 * (1-t) * Math.pow(t, 2) * toY + Math.pow(t, 3) * toY

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (e.detail === 2 && onRemove) { // Double click to remove
      onRemove(connection.id)
    } else if (onShowInfo) { // Single click to show info
      onShowInfo(connection, { x: midX, y: midY })
    }
    setIsSelected(!isSelected)
  }

  return (
    <g>
      {/* Invisible thick line for easier interaction */}
      <path
        d={path}
        stroke="transparent"
        strokeWidth="12"
        fill="none"
        className="cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      />
      
      {/* Main connection line with enhanced styling */}
      <path
        d={path}
        stroke={isSelected ? "oklch(0.7 0.2 270)" : isHovered ? "oklch(0.65 0.18 240)" : "oklch(0.6 0.15 240)"}
        strokeWidth={isSelected ? "3" : isHovered ? "2.5" : "2"}
        fill="none"
        className="transition-all duration-200 pointer-events-none"
        style={{
          filter: isHovered || isSelected ? "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" : "drop-shadow(0 1px 2px rgba(0,0,0,0.1))"
        }}
        strokeDasharray={isSelected ? "5,5" : undefined}
      />

      {/* Animated flow indicators */}
      {(isHovered || isSelected) && (
        <>
          <circle r="3" fill="oklch(0.8 0.2 240)" className="opacity-80">
            <animateMotion dur="2s" repeatCount="indefinite" path={path} />
          </circle>
          <circle r="3" fill="oklch(0.8 0.2 240)" className="opacity-60">
            <animateMotion dur="2s" repeatCount="indefinite" path={path} begin="0.5s" />
          </circle>
        </>
      )}

      {/* Connection points */}
      <circle
        cx={fromX}
        cy={fromY}
        r={isHovered ? "5" : "4"}
        fill="oklch(0.6 0.15 240)"
        className="transition-all duration-200"
        style={{
          filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.2))"
        }}
      />
      <circle
        cx={toX}
        cy={toY}
        r={isHovered ? "5" : "4"}
        fill="oklch(0.5 0.02 240)"
        stroke="oklch(0.6 0.15 240)"
        strokeWidth="2"
        className="transition-all duration-200"
        style={{
          filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.2))"
        }}
      />

      {/* Delete button on hover/select */}
      {(isHovered || isSelected) && onRemove && (
        <g>
          <circle
            cx={midX}
            cy={midY}
            r="8"
            fill="oklch(0.6 0.2 0)"
            className="cursor-pointer transition-all duration-200 hover:scale-110"
            onClick={(e) => {
              e.stopPropagation()
              onRemove(connection.id)
            }}
            style={{
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
            }}
          />
          <path
            d={`M ${midX - 3} ${midY - 3} L ${midX + 3} ${midY + 3} M ${midX + 3} ${midY - 3} L ${midX - 3} ${midY + 3}`}
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="pointer-events-none"
          />
        </g>
      )}
    </g>
  )
}
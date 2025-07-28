import { useState } from 'react'
import { Connection, Widget } from '@/hooks/use-grid-system'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Link } from '@phosphor-icons/react'

interface ConnectionInfoProps {
  connection: Connection
  widgets: Widget[]
  position: { x: number; y: number }
  onRemove: (connectionId: string) => void
  onClose: () => void
}

export function ConnectionInfo({ connection, widgets, position, onRemove, onClose }: ConnectionInfoProps) {
  const fromWidget = widgets.find(w => w.id === connection.from.widgetId)
  const toWidget = widgets.find(w => w.id === connection.to.widgetId)

  if (!fromWidget || !toWidget) return null

  return (
    <Card 
      className="absolute z-50 p-3 shadow-lg border-accent/50 bg-card/95 backdrop-blur-sm min-w-48"
      style={{
        left: position.x - 96, // Center the tooltip
        top: position.y - 60
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Link className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium">Connection</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={onClose}
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
      
      <div className="space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>From:</span>
          <span className="font-medium capitalize">{fromWidget.type}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>To:</span>
          <span className="font-medium capitalize">{toWidget.type}</span>
        </div>
      </div>
      
      <div className="mt-3 pt-2 border-t">
        <Button
          variant="destructive"
          size="sm"
          className="w-full h-7 text-xs"
          onClick={() => {
            onRemove(connection.id)
            onClose()
          }}
        >
          Remove Connection
        </Button>
      </div>
    </Card>
  )
}
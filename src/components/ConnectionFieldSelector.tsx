import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, Link } from '@phosphor-icons/react'

interface ConnectionFieldSelectorProps {
  position: { x: number; y: number }
  targetWidget: any
  availableFields: Array<{ key: string; label: string }>
  onSelectField: (fieldKey: string) => void
  onCancel: () => void
}

export function ConnectionFieldSelector({
  position,
  targetWidget,
  availableFields,
  onSelectField,
  onCancel
}: ConnectionFieldSelectorProps) {
  const [selectedField, setSelectedField] = useState<string | null>(null)

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  if (availableFields.length === 0) {
    return null
  }

  // If there's only one field, auto-select it
  if (availableFields.length === 1) {
    setTimeout(() => onSelectField(availableFields[0].key), 0)
    return null
  }

  return (
    <Card 
      className="absolute z-50 p-3 shadow-lg border-2 border-accent/50 bg-background min-w-48"
      style={{
        left: Math.max(10, Math.min(position.x - 100, window.innerWidth - 220)),
        top: Math.max(10, Math.min(position.y - 20, window.innerHeight - 200))
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Link className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium">Connect to Field</span>
        </div>
        <Button
          variant="ghost"
          size="sm" 
          className="h-6 w-6 p-0"
          onClick={onCancel}
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
      
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground mb-2">
          Select which field in <Badge variant="outline" className="text-xs">{targetWidget.type}</Badge> should receive the connection:
        </div>
        
        {availableFields.map((field) => (
          <Button
            key={field.key}
            variant={selectedField === field.key ? "default" : "outline"}
            size="sm"
            className="w-full justify-start h-8 text-xs"
            onClick={() => {
              setSelectedField(field.key)
              onSelectField(field.key)
            }}
          >
            {field.label}
          </Button>
        ))}
      </div>
      
      <div className="text-xs text-muted-foreground mt-3 text-center">
        Press ESC to cancel
      </div>
    </Card>
  )
}

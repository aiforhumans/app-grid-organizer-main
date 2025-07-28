import { useState, useEffect, useCallback } from 'react'
import { Connection } from '@/hooks/use-grid-system'

interface ConnectionStatsProps {
  connections: Connection[]
  widgets: any[]
  className?: string
}

export function ConnectionStats({ connections, widgets, className }: ConnectionStatsProps) {
  const [stats, setStats] = useState({
    totalConnections: 0,
    connectedWidgets: 0,
    isolatedWidgets: 0
  })

  useEffect(() => {
    const connectedWidgetIds = new Set<string>()
    
    connections.forEach(conn => {
      connectedWidgetIds.add(conn.from.widgetId)
      connectedWidgetIds.add(conn.to.widgetId)
    })

    setStats({
      totalConnections: connections.length,
      connectedWidgets: connectedWidgetIds.size,
      isolatedWidgets: widgets.length - connectedWidgetIds.size
    })
  }, [connections, widgets])

  if (connections.length === 0) return null

  return (
    <div className={`text-xs text-muted-foreground space-y-1 ${className}`}>
      <div className="flex items-center gap-2">
        <span>{stats.totalConnections} connections</span>
        <span>•</span>
        <span>{stats.connectedWidgets} linked widgets</span>
        {stats.isolatedWidgets > 0 && (
          <>
            <span>•</span>
            <span>{stats.isolatedWidgets} isolated</span>
          </>
        )}
      </div>
    </div>
  )
}
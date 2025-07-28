import { useState, useEffect } from 'react'
import { logger } from '../utils/logger'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'

interface LogEntry {
  timestamp: string
  level: string
  message: string
  data?: any
  component?: string
}

export function LogViewer() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isVisible, setIsVisible] = useState(false)

  const refreshLogs = () => {
    const allLogs = logger.getLogs()
    setLogs(allLogs.slice(-50)) // Show last 50 logs
  }

  useEffect(() => {
    refreshLogs()
    const interval = setInterval(refreshLogs, 1000)
    return () => clearInterval(interval)
  }, [])

  const getLevelColor = (level: string) => {
    switch (level.toUpperCase()) {
      case 'ERROR': return 'destructive'
      case 'WARN': return 'secondary'
      case 'INFO': return 'default'
      case 'DEBUG': return 'outline'
      case 'TRACE': return 'secondary'
      default: return 'default'
    }
  }

  const clearLogs = () => {
    logger.clear()
    setLogs([])
  }

  const exportLogs = () => {
    const logsJson = JSON.stringify(logger.getLogs(), null, 2)
    const blob = new Blob([logsJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `app-logs-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
        >
          Show Logs ({logs.length})
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[90vw]">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Live Logs</CardTitle>
            <div className="flex gap-2">
              <Button onClick={refreshLogs} variant="outline" size="sm">
                Refresh
              </Button>
              <Button onClick={clearLogs} variant="outline" size="sm">
                Clear
              </Button>
              <Button onClick={exportLogs} variant="outline" size="sm">
                Export
              </Button>
              <Button 
                onClick={() => setIsVisible(false)} 
                variant="outline" 
                size="sm"
              >
                Hide
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            {logs.length === 0 ? (
              <p className="text-muted-foreground text-sm">No logs yet...</p>
            ) : (
              <div className="space-y-2">
                {logs.map((log, index) => (
                  <div key={index} className="border-b pb-2 last:border-b-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getLevelColor(log.level) as any}>
                        {log.level}
                      </Badge>
                      {log.component && (
                        <Badge variant="outline" className="text-xs">
                          {log.component}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm font-mono">{log.message}</p>
                    {log.data && (
                      <details className="mt-1">
                        <summary className="text-xs text-muted-foreground cursor-pointer">
                          View Data
                        </summary>
                        <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

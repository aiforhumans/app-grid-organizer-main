// File: src/utils/logger.ts
// Description: Complete Automated Logger System
// Author: GitHub Copilot Agent

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'TRACE'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  data?: any
  component?: string
  stackTrace?: string
  sessionId: string
  userId?: string
}

class Logger {
  private logs: LogEntry[] = []
  private maxLogs = 1000 // Keep last 1000 logs in memory
  private logToConsole = true
  private logToStorage = true
  private sessionId: string
  private userId?: string

  constructor() {
    this.sessionId = this.generateSessionId()
    
    // Load existing logs from localStorage on init
    this.loadLogs()
    
    // Auto-save logs periodically
    setInterval(() => this.saveLogs(), 5000) // Save every 5 seconds
    
    // Save logs before page unload
    window.addEventListener('beforeunload', () => this.saveLogs())
    
    // Log system initialization
    this.info('Logger system initialized', { sessionId: this.sessionId })
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private createLogEntry(level: LogLevel, message: string, data?: any, component?: string): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      component,
      sessionId: this.sessionId,
      userId: this.userId
    }

    if (data !== undefined) {
      try {
        entry.data = typeof data === 'object' ? JSON.stringify(data, null, 2) : data
      } catch (error) {
        entry.data = `[Circular Reference or Unserializable Object: ${error}]`
      }
    }

    // Capture stack trace for errors and warnings
    if (level === 'ERROR' || level === 'WARN') {
      entry.stackTrace = new Error().stack
    }

    return entry
  }

  private addLog(entry: LogEntry) {
    this.logs.push(entry)
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Console output
    if (this.logToConsole) {
      this.logToConsole_Internal(entry)
    }

    // Save to .LOG directory structure
    this.saveToLogDirectory(entry)
  }

  private logToConsole_Internal(entry: LogEntry) {
    const style = this.getConsoleStyle(entry.level)
    const componentTag = entry.component ? `[${entry.component}]` : ''
    const timestamp = new Date(entry.timestamp).toLocaleTimeString()
    
    console.log(
      `%c${timestamp} [${entry.level}] ${componentTag} ${entry.message}`,
      style,
      entry.data ? entry.data : ''
    )

    if (entry.stackTrace && (entry.level === 'ERROR' || entry.level === 'WARN')) {
      console.groupCollapsed('Stack Trace')
      console.log(entry.stackTrace)
      console.groupEnd()
    }
  }

  private getConsoleStyle(level: LogLevel): string {
    switch (level) {
      case 'DEBUG': return 'color: #6b7280; font-size: 11px;'
      case 'INFO': return 'color: #059669; font-weight: bold;'
      case 'WARN': return 'color: #d97706; font-weight: bold; background: #fef3c7; padding: 2px 4px;'
      case 'ERROR': return 'color: #dc2626; font-weight: bold; background: #fef2f2; padding: 2px 4px;'
      case 'TRACE': return 'color: #7c3aed; font-size: 10px; font-style: italic;'
      default: return ''
    }
  }

  private saveToLogDirectory(entry: LogEntry) {
    try {
      const date = new Date(entry.timestamp)
      const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD
      const logKey = `logs_${dateStr}_${entry.level}`
      
      const existingLogs = JSON.parse(localStorage.getItem(logKey) || '[]')
      existingLogs.push(entry)
      
      // Keep only last 100 entries per day per level
      if (existingLogs.length > 100) {
        existingLogs.splice(0, existingLogs.length - 100)
      }
      
      localStorage.setItem(logKey, JSON.stringify(existingLogs))
    } catch (error) {
      console.warn('Failed to save log to directory structure:', error)
    }
  }

  private loadLogs() {
    try {
      const saved = localStorage.getItem('app-grid-logs-current')
      if (saved) {
        this.logs = JSON.parse(saved)
      }
    } catch (error) {
      console.warn('Failed to load logs from localStorage:', error)
    }
  }

  private saveLogs() {
    if (!this.logToStorage) return
    
    try {
      localStorage.setItem('app-grid-logs-current', JSON.stringify(this.logs))
    } catch (error) {
      console.warn('Failed to save logs to localStorage:', error)
    }
  }

  // Configuration methods
  setUserId(userId: string) {
    this.userId = userId
    this.info('User ID set', { userId })
  }

  setConsoleLogging(enabled: boolean) {
    this.logToConsole = enabled
    this.info('Console logging ' + (enabled ? 'enabled' : 'disabled'))
  }

  setStorageLogging(enabled: boolean) {
    this.logToStorage = enabled
    this.info('Storage logging ' + (enabled ? 'enabled' : 'disabled'))
  }

  // Public logging methods
  debug(message: string, data?: any, component?: string) {
    this.addLog(this.createLogEntry('DEBUG', message, data, component))
  }

  info(message: string, data?: any, component?: string) {
    this.addLog(this.createLogEntry('INFO', message, data, component))
  }

  warn(message: string, data?: any, component?: string) {
    this.addLog(this.createLogEntry('WARN', message, data, component))
  }

  error(message: string, data?: any, component?: string) {
    this.addLog(this.createLogEntry('ERROR', message, data, component))
  }

  trace(message: string, data?: any, component?: string) {
    this.addLog(this.createLogEntry('TRACE', message, data, component))
  }

  // Utility methods
  clear() {
    this.logs = []
    localStorage.removeItem('app-grid-logs-current')
    console.clear()
    this.info('Logs cleared')
  }

  getLogs(level?: LogLevel, component?: string): LogEntry[] {
    let filteredLogs = [...this.logs]
    
    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level)
    }
    
    if (component) {
      filteredLogs = filteredLogs.filter(log => log.component === component)
    }
    
    return filteredLogs
  }

  getLogsByDateRange(startDate: Date, endDate: Date): LogEntry[] {
    return this.logs.filter(log => {
      const logDate = new Date(log.timestamp)
      return logDate >= startDate && logDate <= endDate
    })
  }

  exportLogs(format: 'json' | 'csv' | 'txt' = 'txt'): string {
    switch (format) {
      case 'json':
        return JSON.stringify(this.logs, null, 2)
      
      case 'csv':
        const headers = 'Timestamp,Level,Component,Message,Data,Stack Trace'
        const rows = this.logs.map(log => [
          log.timestamp,
          log.level,
          log.component || '',
          `"${log.message.replace(/"/g, '""')}"`,
          log.data ? `"${log.data.replace(/"/g, '""')}"` : '',
          log.stackTrace ? `"${log.stackTrace.replace(/"/g, '""')}"` : ''
        ].join(','))
        return [headers, ...rows].join('\n')
      
      case 'txt':
      default:
        return this.logs.map(log => {
          const dataStr = log.data ? `\nData: ${log.data}` : ''
          const stackStr = log.stackTrace ? `\nStack: ${log.stackTrace}` : ''
          const componentStr = log.component ? `[${log.component}] ` : ''
          return `${log.timestamp} [${log.level}] ${componentStr}${log.message}${dataStr}${stackStr}`
        }).join('\n\n')
    }
  }

  downloadLogs(format: 'json' | 'csv' | 'txt' = 'txt') {
    const logContent = this.exportLogs(format)
    const blob = new Blob([logContent], { 
      type: format === 'json' ? 'application/json' : 
           format === 'csv' ? 'text/csv' : 'text/plain' 
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `app-grid-logs-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    this.info('Logs downloaded', { format, logCount: this.logs.length })
  }

  // Performance tracking
  timeStart(label: string, component?: string): number {
    const startTime = performance.now()
    this.trace(`Timer started: ${label}`, { startTime }, component)
    return startTime
  }

  timeEnd(label: string, startTime: number, component?: string): number {
    const endTime = performance.now()
    const duration = endTime - startTime
    this.debug(`Timer ended: ${label}`, { duration: `${duration.toFixed(2)}ms` }, component)
    return duration
  }

  // Component lifecycle tracking
  componentMount(componentName: string, props?: any) {
    this.trace(`Component mounted: ${componentName}`, props, componentName)
  }

  componentUnmount(componentName: string) {
    this.trace(`Component unmounted: ${componentName}`, undefined, componentName)
  }

  componentUpdate(componentName: string, prevProps?: any, nextProps?: any) {
    this.trace(`Component updated: ${componentName}`, { prevProps, nextProps }, componentName)
  }

  // Error boundary integration
  logReactError(error: Error, errorInfo: React.ErrorInfo, component?: string) {
    this.error('React Error Boundary Caught Error', {
      error: error.toString(),
      componentStack: errorInfo.componentStack,
      errorBoundary: component
    }, component)
  }

  // Network request logging
  logNetworkRequest(url: string, method: string, status?: number, duration?: number, component?: string) {
    const data = {
      method,
      status,
      duration: duration ? `${duration.toFixed(2)}ms` : undefined
    }
    
    if (status && status >= 400) {
      this.error(`Network ${method.toUpperCase()} ${url}`, data, component)
    } else if (status && status >= 300) {
      this.warn(`Network ${method.toUpperCase()} ${url}`, data, component)
    } else {
      this.info(`Network ${method.toUpperCase()} ${url}`, data, component)
    }
  }

  // State change logging
  logStateChange(stateName: string, oldValue: any, newValue: any, component?: string) {
    this.debug(`State changed: ${stateName}`, {
      from: oldValue,
      to: newValue,
      changed: oldValue !== newValue
    }, component)
  }

  // Effect logging
  logEffect(effectName: string, dependencies: any[], component?: string) {
    this.trace(`Effect executed: ${effectName}`, {
      dependencies,
      dependencyCount: dependencies.length
    }, component)
  }

  // Memory usage monitoring
  logMemoryUsage(component?: string) {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      this.debug('Memory usage', {
        usedJSHeapSize: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        totalJSHeapSize: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        jsHeapSizeLimit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
      }, component)
    }
  }

  // Search functionality
  searchLogs(query: string, options?: {
    level?: LogLevel,
    component?: string,
    startDate?: Date,
    endDate?: Date
  }): LogEntry[] {
    let results = this.logs

    // Filter by level
    if (options?.level) {
      results = results.filter(log => log.level === options.level)
    }

    // Filter by component
    if (options?.component) {
      results = results.filter(log => log.component === options.component)
    }

    // Filter by date range
    if (options?.startDate || options?.endDate) {
      results = results.filter(log => {
        const logDate = new Date(log.timestamp)
        if (options.startDate && logDate < options.startDate) return false
        if (options.endDate && logDate > options.endDate) return false
        return true
      })
    }

    // Search in message and data
    const lowerQuery = query.toLowerCase()
    return results.filter(log => 
      log.message.toLowerCase().includes(lowerQuery) ||
      (log.data && log.data.toLowerCase().includes(lowerQuery)) ||
      (log.component && log.component.toLowerCase().includes(lowerQuery))
    )
  }

  // Statistics
  getLogStats() {
    const stats = {
      total: this.logs.length,
      byLevel: {} as Record<LogLevel, number>,
      byComponent: {} as Record<string, number>,
      sessionId: this.sessionId,
      oldestLog: this.logs[0]?.timestamp,
      newestLog: this.logs[this.logs.length - 1]?.timestamp
    }

    this.logs.forEach(log => {
      // Count by level
      stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1
      
      // Count by component
      if (log.component) {
        stats.byComponent[log.component] = (stats.byComponent[log.component] || 0) + 1
      }
    })

    return stats
  }
}

// Create singleton instance
export const logger = new Logger()

// Global error handlers
window.addEventListener('error', (event) => {
  logger.error('Global JavaScript Error', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error?.toString(),
    stack: event.error?.stack
  })
})

window.addEventListener('unhandledrejection', (event) => {
  logger.error('Unhandled Promise Rejection', {
    reason: event.reason?.toString(),
    stack: event.reason?.stack
  })
})

// Export types for TypeScript
export type { LogLevel, LogEntry }
export default logger

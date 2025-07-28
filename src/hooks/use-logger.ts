// File: src/hooks/use-logger.ts
// Description: React hooks for automated logging
// Author: GitHub Copilot Agent

import { useEffect, useRef, useCallback } from 'react'
import { logger } from '@/utils/logger'

export function useLogger(componentName: string, props?: any) {
  const mountTimeRef = useRef<number | undefined>(undefined)
  const renderCountRef = useRef(0)

  useEffect(() => {
    // Component mount
    mountTimeRef.current = logger.timeStart(`${componentName}-lifecycle`)
    logger.componentMount(componentName, props)
    
    // Log memory usage on mount for heavy components
    if (componentName.includes('Widget') || componentName.includes('Container')) {
      logger.logMemoryUsage(componentName)
    }

    return () => {
      // Component unmount
      if (mountTimeRef.current) {
        logger.timeEnd(`${componentName}-lifecycle`, mountTimeRef.current)
      }
      logger.componentUnmount(componentName)
    }
  }, [componentName])

  // Track render count
  useEffect(() => {
    renderCountRef.current += 1
    if (renderCountRef.current > 1) {
      logger.trace(`Component re-rendered (#${renderCountRef.current})`, {
        renderCount: renderCountRef.current,
        props
      }, componentName)
    }
  })

  // Return logger instance with component context
  return {
    debug: useCallback((message: string, data?: any) => 
      logger.debug(message, data, componentName), [componentName]),
    info: useCallback((message: string, data?: any) => 
      logger.info(message, data, componentName), [componentName]),
    warn: useCallback((message: string, data?: any) => 
      logger.warn(message, data, componentName), [componentName]),
    error: useCallback((message: string, data?: any) => 
      logger.error(message, data, componentName), [componentName]),
    trace: useCallback((message: string, data?: any) => 
      logger.trace(message, data, componentName), [componentName]),
    timeStart: useCallback((label: string) => 
      logger.timeStart(label, componentName), [componentName]),
    timeEnd: useCallback((label: string, startTime: number) => 
      logger.timeEnd(label, startTime, componentName), [componentName]),
    logNetworkRequest: useCallback((url: string, method: string, status?: number, duration?: number) => 
      logger.logNetworkRequest(url, method, status, duration, componentName), [componentName])
  }
}

// Hook for tracking state changes with detailed logging
export function useStateLogger<T>(
  state: T, 
  stateName: string, 
  componentName: string,
  options?: {
    logLevel?: 'trace' | 'debug' | 'info'
    compareDeep?: boolean
    throttleMs?: number
  }
) {
  const prevStateRef = useRef<T | undefined>(undefined)
  const throttleTimeoutRef = useRef<number | undefined>(undefined)
  const { logLevel = 'debug', compareDeep = false, throttleMs = 0 } = options || {}

  useEffect(() => {
    const logChange = () => {
      if (prevStateRef.current !== undefined) {
        const hasChanged = compareDeep 
          ? JSON.stringify(prevStateRef.current) !== JSON.stringify(state)
          : prevStateRef.current !== state

        if (hasChanged) {
          const logData = {
            from: prevStateRef.current,
            to: state,
            type: typeof state,
            stateSize: typeof state === 'string' ? state.length : 
                      Array.isArray(state) ? state.length :
                      typeof state === 'object' ? Object.keys(state as any).length : undefined
          }

          switch (logLevel) {
            case 'trace':
              logger.trace(`State changed: ${stateName}`, logData, componentName)
              break
            case 'info':
              logger.info(`State changed: ${stateName}`, logData, componentName)
              break
            case 'debug':
            default:
              logger.debug(`State changed: ${stateName}`, logData, componentName)
              break
          }
        }
      }
      prevStateRef.current = state
    }

    if (throttleMs > 0) {
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current)
      }
      throttleTimeoutRef.current = window.setTimeout(logChange, throttleMs)
    } else {
      logChange()
    }

    return () => {
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current)
      }
    }
  }, [state, stateName, componentName, logLevel, compareDeep, throttleMs])
}

// Hook for tracking effect executions with dependency analysis
export function useEffectLogger(
  dependencies: any[], 
  effectName: string, 
  componentName: string,
  options?: {
    logDependencyDetails?: boolean
    warnOnFrequentExecution?: boolean
    maxExecutionsPerSecond?: number
  }
) {
  const prevDepsRef = useRef<any[]>()
  const executionCountRef = useRef(0)
  const lastExecutionTimeRef = useRef(0)
  const { 
    logDependencyDetails = true, 
    warnOnFrequentExecution = true,
    maxExecutionsPerSecond = 10
  } = options || {}

  useEffect(() => {
    const now = Date.now()
    executionCountRef.current += 1

    // Check for frequent executions (potential infinite loops)
    if (warnOnFrequentExecution && lastExecutionTimeRef.current > 0) {
      const timeSinceLastExecution = now - lastExecutionTimeRef.current
      if (timeSinceLastExecution < (1000 / maxExecutionsPerSecond)) {
        logger.warn(`Effect executing very frequently: ${effectName}`, {
          timeSinceLastExecution: `${timeSinceLastExecution}ms`,
          executionCount: executionCountRef.current,
          possibleInfiniteLoop: executionCountRef.current > 20
        }, componentName)
      }
    }

    lastExecutionTimeRef.current = now

    if (prevDepsRef.current && logDependencyDetails) {
      const changedDeps = dependencies.map((dep, index) => {
        const prev = prevDepsRef.current?.[index]
        const changed = prev !== dep
        return { 
          index, 
          changed, 
          prev: typeof prev === 'object' ? JSON.stringify(prev) : prev, 
          current: typeof dep === 'object' ? JSON.stringify(dep) : dep,
          type: typeof dep
        }
      }).filter(dep => dep.changed)

      logger.trace(`Effect executed: ${effectName}`, {
        executionCount: executionCountRef.current,
        changedDependencies: changedDeps,
        totalDependencies: dependencies.length,
        allDependencies: dependencies.map((dep, i) => ({
          index: i,
          value: typeof dep === 'object' ? JSON.stringify(dep) : dep,
          type: typeof dep
        }))
      }, componentName)
    } else {
      logger.trace(`Effect executed: ${effectName}`, {
        executionCount: executionCountRef.current,
        dependencyCount: dependencies.length
      }, componentName)
    }

    prevDepsRef.current = [...dependencies]
  }, dependencies)

  // Reset execution count periodically
  useEffect(() => {
    const interval = window.setInterval(() => {
      if (executionCountRef.current > 0) {
        logger.trace(`Effect execution summary: ${effectName}`, {
          totalExecutions: executionCountRef.current,
          averageExecutionsPerSecond: executionCountRef.current / 60
        }, componentName)
      }
      executionCountRef.current = 0
    }, 60000) // Reset every minute

    return () => clearInterval(interval)
  }, [effectName, componentName])
}

// Hook for performance monitoring
export function usePerformanceLogger(componentName: string) {
  const renderStartTimeRef = useRef<number>()
  const renderTimesRef = useRef<number[]>([])

  useEffect(() => {
    renderStartTimeRef.current = performance.now()
  })

  useEffect(() => {
    if (renderStartTimeRef.current) {
      const renderTime = performance.now() - renderStartTimeRef.current
      renderTimesRef.current.push(renderTime)

      // Keep only last 10 render times
      if (renderTimesRef.current.length > 10) {
        renderTimesRef.current = renderTimesRef.current.slice(-10)
      }

      const avgRenderTime = renderTimesRef.current.reduce((a, b) => a + b, 0) / renderTimesRef.current.length

      if (renderTime > 16.67) { // More than one frame at 60fps
        logger.warn(`Slow render detected: ${componentName}`, {
          renderTime: `${renderTime.toFixed(2)}ms`,
          averageRenderTime: `${avgRenderTime.toFixed(2)}ms`,
          renderCount: renderTimesRef.current.length
        }, componentName)
      } else if (renderTimesRef.current.length === 10) {
        logger.debug(`Performance summary: ${componentName}`, {
          averageRenderTime: `${avgRenderTime.toFixed(2)}ms`,
          maxRenderTime: `${Math.max(...renderTimesRef.current).toFixed(2)}ms`,
          minRenderTime: `${Math.min(...renderTimesRef.current).toFixed(2)}ms`
        }, componentName)
      }
    }
  })

  return {
    markRenderStart: useCallback(() => {
      renderStartTimeRef.current = performance.now()
    }, []),
    
    markRenderEnd: useCallback((label?: string) => {
      if (renderStartTimeRef.current) {
        const duration = performance.now() - renderStartTimeRef.current
        logger.debug(`Render completed: ${componentName}${label ? ` - ${label}` : ''}`, {
          duration: `${duration.toFixed(2)}ms`
        }, componentName)
      }
    }, [componentName])
  }
}

// Hook for network request logging
export function useNetworkLogger(componentName: string) {
  return useCallback(async <T>(
    promise: Promise<T>,
    requestInfo: {
      url: string
      method: string
      description?: string
    }
  ): Promise<T> => {
    const startTime = performance.now()
    const { url, method, description } = requestInfo
    
    logger.info(`Network request started: ${method.toUpperCase()} ${url}`, {
      description
    }, componentName)

    try {
      const result = await promise
      const duration = performance.now() - startTime
      
      logger.logNetworkRequest(url, method, 200, duration, componentName)
      
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      
      logger.logNetworkRequest(url, method, 500, duration, componentName)
      logger.error(`Network request failed: ${method.toUpperCase()} ${url}`, {
        error: error instanceof Error ? error.message : error,
        duration: `${duration.toFixed(2)}ms`
      }, componentName)
      
      throw error
    }
  }, [componentName])
}

// Hook for form validation logging
export function useFormLogger(formName: string, componentName: string) {
  return {
    logValidation: useCallback((fieldName: string, isValid: boolean, errors?: string[]) => {
      logger.debug(`Form validation: ${formName}.${fieldName}`, {
        isValid,
        errors,
        errorCount: errors?.length || 0
      }, componentName)
    }, [formName, componentName]),

    logSubmission: useCallback((data: any, success: boolean, errors?: any) => {
      if (success) {
        logger.info(`Form submitted successfully: ${formName}`, {
          dataKeys: Object.keys(data)
        }, componentName)
      } else {
        logger.error(`Form submission failed: ${formName}`, {
          errors,
          dataKeys: Object.keys(data)
        }, componentName)
      }
    }, [formName, componentName])
  }
}

export default useLogger

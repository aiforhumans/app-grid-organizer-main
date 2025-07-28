import { useEffect } from 'react'
import { GridContainer } from './components/GridContainer'
import { Toaster } from '@/components/ui/sonner'
import { ErrorBoundary } from './components/ErrorBoundary'
import { LogViewer } from './components/LogViewer'
import useLogger, { usePerformanceLogger } from './hooks/use-logger'
import { logger as mainLogger } from './utils/logger'

function App() {
  const logger = useLogger('App')
  const { markRenderStart, markRenderEnd } = usePerformanceLogger('App')

  useEffect(() => {
    logger.info('Application initialized', {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    })

    // Test all log levels
    logger.debug('Debug test message', { testData: 'debugging info' })
    logger.trace('Trace test message', { traceId: '12345' })
    logger.warn('Warning test message', { warningLevel: 'medium' })
    logger.error('Error test message', { testError: true, errorCode: 500 })

    // Test performance timing
    const startTime = logger.timeStart('App initialization')
    setTimeout(() => {
      logger.timeEnd('App initialization', startTime)
    }, 100)

    // Test network logging simulation
    logger.logNetworkRequest('http://localhost:3000/api/test', 'GET', 200, 150)
    
    // Test component lifecycle
    mainLogger.componentMount('App', { version: '1.0.0' })

    return () => {
      mainLogger.componentUnmount('App')
      logger.info('Application cleanup')
    }
  }, [])

  markRenderStart()

  return (
    <ErrorBoundary>
      <GridContainer />
      <Toaster />
      <LogViewer />
    </ErrorBoundary>
  )
}

export default App
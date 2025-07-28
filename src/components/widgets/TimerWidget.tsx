import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Pause, ArrowCounterClockwise } from '@phosphor-icons/react'
import { Widget } from '@/hooks/use-grid-system'

interface TimerWidgetProps {
  widget: Widget
  updateWidget: (id: string, updates: Partial<Widget>) => void
  autoResizeWidget?: (contentHeight: number, contentWidth?: number) => void
  connectedInputs?: Record<string, any>
}

export function TimerWidget({ widget, updateWidget, connectedInputs = {} }: TimerWidgetProps) {
  const [minutes, setMinutes] = useState(5)
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(minutes * 60 + seconds)

  useEffect(() => {
    let interval: number | null = null

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            setIsRunning(false)
            return 0
          }
          return time - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeLeft])

  const displayMinutes = Math.floor(timeLeft / 60)
  const displaySeconds = timeLeft % 60

  const handleStart = () => {
    if (timeLeft === 0) {
      setTimeLeft(minutes * 60 + seconds)
    }
    setIsRunning(true)
  }

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleReset = () => {
    setIsRunning(false)
    setTimeLeft(minutes * 60 + seconds)
  }

  const handleMinutesChange = (delta: number) => {
    const newMinutes = Math.max(0, Math.min(99, minutes + delta))
    setMinutes(newMinutes)
    if (!isRunning) {
      setTimeLeft(newMinutes * 60 + seconds)
    }
  }

  const handleSecondsChange = (delta: number) => {
    const newSeconds = Math.max(0, Math.min(59, seconds + delta))
    setSeconds(newSeconds)
    if (!isRunning) {
      setTimeLeft(minutes * 60 + newSeconds)
    }
  }

  return (
    <div className="p-3 h-full flex flex-col items-center justify-center space-y-4">
      <div className="text-3xl font-mono font-bold">
        {String(displayMinutes).padStart(2, '0')}:
        {String(displaySeconds).padStart(2, '0')}
      </div>

      {!isRunning && timeLeft === minutes * 60 + seconds && (
        <div className="flex items-center space-x-2 text-sm">
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-1">
              <Button
                size="sm"
                variant="outline"
                className="h-6 w-6 p-0"
                onClick={() => handleMinutesChange(-1)}
              >
                -
              </Button>
              <span className="w-8 text-center">{minutes}m</span>
              <Button
                size="sm"
                variant="outline"
                className="h-6 w-6 p-0"
                onClick={() => handleMinutesChange(1)}
              >
                +
              </Button>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-1">
              <Button
                size="sm"
                variant="outline"
                className="h-6 w-6 p-0"
                onClick={() => handleSecondsChange(-1)}
              >
                -
              </Button>
              <span className="w-8 text-center">{seconds}s</span>
              <Button
                size="sm"
                variant="outline"
                className="h-6 w-6 p-0"
                onClick={() => handleSecondsChange(1)}
              >
                +
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Button
          size="sm"
          variant={isRunning ? "secondary" : "default"}
          onClick={isRunning ? handlePause : handleStart}
          disabled={timeLeft === 0 && !isRunning}
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>
        <Button size="sm" variant="outline" onClick={handleReset}>
          <ArrowCounterClockwise className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
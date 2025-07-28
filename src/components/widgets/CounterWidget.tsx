import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Minus, ArrowCounterClockwise } from '@phosphor-icons/react'
import { Widget } from '@/hooks/use-grid-system'

interface CounterWidgetProps {
  widget: Widget
  updateWidget: (id: string, updates: Partial<Widget>) => void
  autoResizeWidget?: (contentHeight: number, contentWidth?: number) => void
}

export function CounterWidget({ widget, updateWidget }: CounterWidgetProps) {
  const [count, setCount] = useState(widget.data?.count || 0)
  const lastSavedCount = useRef(widget.data?.count || 0)

  useEffect(() => {
    // Only update if count has actually changed from the last saved value
    if (count !== lastSavedCount.current) {
      lastSavedCount.current = count
      updateWidget(widget.id, { data: { ...widget.data, count } })
    }
  }, [count, widget.id, updateWidget])

  const increment = () => setCount(prev => prev + 1)
  const decrement = () => setCount(prev => prev - 1)
  const reset = () => setCount(0)

  return (
    <div className="p-3 h-full flex flex-col items-center justify-center space-y-4">
      <div className="text-4xl font-bold font-mono">
        {count}
      </div>
      
      <div className="flex items-center space-x-2">
        <Button size="sm" variant="outline" onClick={decrement}>
          <Minus className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={reset}>
          <ArrowCounterClockwise className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="default" onClick={increment}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
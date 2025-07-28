import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Widget } from '@/hooks/use-grid-system'

interface AddTextWidgetProps {
  widget: Widget
  updateWidget: (id: string, updates: Partial<Widget>) => void
  autoResizeWidget?: (contentHeight: number, contentWidth?: number) => void
  connectedInputs?: Record<string, any>
}

export function AddTextWidget({ widget, updateWidget, connectedInputs = {} }: AddTextWidgetProps) {
  const [baseText, setBaseText] = useState(widget.data?.baseText || '')
  const [addText, setAddText] = useState(widget.data?.addText || '')
  const [position, setPosition] = useState(widget.data?.position || 'end')
  const [result, setResult] = useState('')
  const lastSavedData = useRef({
    baseText: widget.data?.baseText || '',
    addText: widget.data?.addText || '',
    position: widget.data?.position || 'end'
  })

  useEffect(() => {
    let combined = ''
    if (position === 'start') {
      combined = addText + baseText
    } else if (position === 'end') {
      combined = baseText + addText
    } else if (position === 'middle') {
      const midPoint = Math.floor(baseText.length / 2)
      combined = baseText.slice(0, midPoint) + addText + baseText.slice(midPoint)
    }
    setResult(combined)
  }, [baseText, addText, position])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const currentData = { baseText, addText, position }
      if (JSON.stringify(currentData) !== JSON.stringify(lastSavedData.current)) {
        lastSavedData.current = currentData
        updateWidget(widget.id, { data: { ...widget.data, ...currentData, result } })
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [baseText, addText, position, result, widget.data, updateWidget])

  return (
    <div className="p-3 h-full space-y-2 overflow-y-auto">
      <div className="space-y-1">
        <Label className="text-xs font-medium">Base Text</Label>
        <Input
          placeholder="Original text..."
          value={baseText}
          onChange={(e) => setBaseText(e.target.value)}
          className="h-7 text-xs"
        />
      </div>
      
      <div className="space-y-1">
        <Label className="text-xs font-medium">Text to Add</Label>
        <Input
          placeholder="Text to add..."
          value={addText}
          onChange={(e) => setAddText(e.target.value)}
          className="h-7 text-xs"
        />
      </div>
      
      <div className="space-y-1">
        <Label className="text-xs font-medium">Position</Label>
        <select
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          className="w-full h-7 text-xs border border-input bg-background px-2 rounded-md"
        >
          <option value="start">Beginning</option>
          <option value="end">End</option>
          <option value="middle">Middle</option>
        </select>
      </div>
      
      <div className="space-y-1">
        <Label className="text-xs font-medium">Result</Label>
        <div className="p-2 bg-muted rounded text-xs min-h-8 break-words">
          {result || 'Modified text will appear here...'}
        </div>
      </div>
    </div>
  )
}

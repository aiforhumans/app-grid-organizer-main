import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Widget } from '@/hooks/use-grid-system'

interface TextTransformWidgetProps {
  widget: Widget
  updateWidget: (id: string, updates: Partial<Widget>) => void
  autoResizeWidget?: (contentHeight: number, contentWidth?: number) => void
  connectedInputs?: Record<string, any>
}

export function TextTransformWidget({ widget, updateWidget, connectedInputs = {} }: TextTransformWidgetProps) {
  const [baseText, setBaseText] = useState(widget.data?.baseText || '')
  const [transform, setTransform] = useState(widget.data?.transform || 'none')
  const [result, setResult] = useState('')
  const lastSavedData = useRef({
    baseText: widget.data?.baseText || '',
    transform: widget.data?.transform || 'none'
  })

  useEffect(() => {
    let transformed = baseText
    switch (transform) {
      case 'uppercase':
        transformed = baseText.toUpperCase()
        break
      case 'lowercase':
        transformed = baseText.toLowerCase()
        break
      case 'capitalize':
        transformed = baseText.replace(/\b\w/g, l => l.toUpperCase())
        break
      case 'reverse':
        transformed = baseText.split('').reverse().join('')
        break
      case 'trim':
        transformed = baseText.trim()
        break
      case 'remove-spaces':
        transformed = baseText.replace(/\s+/g, '')
        break
      case 'normalize-spaces':
        transformed = baseText.replace(/\s+/g, ' ').trim()
        break
      default:
        transformed = baseText
    }
    setResult(transformed)
  }, [baseText, transform])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const currentData = { baseText, transform }
      if (JSON.stringify(currentData) !== JSON.stringify(lastSavedData.current)) {
        lastSavedData.current = currentData
        updateWidget(widget.id, { data: { ...widget.data, ...currentData, result } })
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [baseText, transform, result, widget.data, updateWidget])

  return (
    <div className="p-3 h-full space-y-2 overflow-y-auto">
      <div className="space-y-1">
        <Label className="text-xs font-medium">Input Text</Label>
        <Input
          placeholder="Text to transform..."
          value={baseText}
          onChange={(e) => setBaseText(e.target.value)}
          className="h-7 text-xs"
        />
      </div>
      
      <div className="space-y-1">
        <Label className="text-xs font-medium">Transform</Label>
        <select
          value={transform}
          onChange={(e) => setTransform(e.target.value)}
          className="w-full h-7 text-xs border border-input bg-background px-2 rounded-md"
        >
          <option value="none">None</option>
          <option value="uppercase">UPPERCASE</option>
          <option value="lowercase">lowercase</option>
          <option value="capitalize">Capitalize Words</option>
          <option value="reverse">Reverse Text</option>
          <option value="trim">Trim Whitespace</option>
          <option value="remove-spaces">Remove All Spaces</option>
          <option value="normalize-spaces">Normalize Spaces</option>
        </select>
      </div>
      
      <div className="space-y-1">
        <Label className="text-xs font-medium">Result</Label>
        <div className="p-2 bg-muted rounded text-xs min-h-8 break-words">
          {result || 'Transformed text will appear here...'}
        </div>
      </div>
    </div>
  )
}

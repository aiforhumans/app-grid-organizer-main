import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Widget } from '@/hooks/use-grid-system'

interface RemoveTextWidgetProps {
  widget: Widget
  updateWidget: (id: string, updates: Partial<Widget>) => void
  autoResizeWidget?: (contentHeight: number, contentWidth?: number) => void
}

export function RemoveTextWidget({ widget, updateWidget }: RemoveTextWidgetProps) {
  const [baseText, setBaseText] = useState(widget.data?.baseText || '')
  const [removeText, setRemoveText] = useState(widget.data?.removeText || '')
  const [mode, setMode] = useState(widget.data?.mode || 'all')
  const [result, setResult] = useState('')
  const lastSavedData = useRef({
    baseText: widget.data?.baseText || '',
    removeText: widget.data?.removeText || '',
    mode: widget.data?.mode || 'all'
  })

  useEffect(() => {
    let modified = baseText
    if (removeText) {
      if (mode === 'all') {
        modified = baseText.split(removeText).join('')
      } else if (mode === 'first') {
        modified = baseText.replace(removeText, '')
      } else if (mode === 'last') {
        const lastIndex = baseText.lastIndexOf(removeText)
        if (lastIndex !== -1) {
          modified = baseText.slice(0, lastIndex) + baseText.slice(lastIndex + removeText.length)
        }
      }
    }
    setResult(modified)
  }, [baseText, removeText, mode])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const currentData = { baseText, removeText, mode }
      if (JSON.stringify(currentData) !== JSON.stringify(lastSavedData.current)) {
        lastSavedData.current = currentData
        updateWidget(widget.id, { data: { ...widget.data, ...currentData, result } })
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [baseText, removeText, mode, result, widget.data, updateWidget])

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
        <Label className="text-xs font-medium">Text to Remove</Label>
        <Input
          placeholder="Text to remove..."
          value={removeText}
          onChange={(e) => setRemoveText(e.target.value)}
          className="h-7 text-xs"
        />
      </div>
      
      <div className="space-y-1">
        <Label className="text-xs font-medium">Remove Mode</Label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="w-full h-7 text-xs border border-input bg-background px-2 rounded-md"
        >
          <option value="all">All occurrences</option>
          <option value="first">First occurrence</option>
          <option value="last">Last occurrence</option>
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

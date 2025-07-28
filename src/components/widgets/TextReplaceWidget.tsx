import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Widget } from '@/hooks/use-grid-system'

interface TextReplaceWidgetProps {
  widget: Widget
  updateWidget: (id: string, updates: Partial<Widget>) => void
  autoResizeWidget?: (contentHeight: number, contentWidth?: number) => void
}

export function TextReplaceWidget({ widget, updateWidget }: TextReplaceWidgetProps) {
  const [baseText, setBaseText] = useState(widget.data?.baseText || '')
  const [searchText, setSearchText] = useState(widget.data?.searchText || '')
  const [replaceText, setReplaceText] = useState(widget.data?.replaceText || '')
  const [mode, setMode] = useState(widget.data?.mode || 'all')
  const [result, setResult] = useState('')
  const lastSavedData = useRef({
    baseText: widget.data?.baseText || '',
    searchText: widget.data?.searchText || '',
    replaceText: widget.data?.replaceText || '',
    mode: widget.data?.mode || 'all'
  })

  useEffect(() => {
    let modified = baseText
    if (searchText) {
      if (mode === 'all') {
        modified = baseText.split(searchText).join(replaceText)
      } else if (mode === 'first') {
        modified = baseText.replace(searchText, replaceText)
      } else if (mode === 'last') {
        const lastIndex = baseText.lastIndexOf(searchText)
        if (lastIndex !== -1) {
          modified = baseText.slice(0, lastIndex) + replaceText + baseText.slice(lastIndex + searchText.length)
        }
      }
    }
    setResult(modified)
  }, [baseText, searchText, replaceText, mode])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const currentData = { baseText, searchText, replaceText, mode }
      if (JSON.stringify(currentData) !== JSON.stringify(lastSavedData.current)) {
        lastSavedData.current = currentData
        updateWidget(widget.id, { data: { ...widget.data, ...currentData, result } })
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [baseText, searchText, replaceText, mode, result, widget.data, updateWidget])

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
        <Label className="text-xs font-medium">Find</Label>
        <Input
          placeholder="Text to find..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="h-7 text-xs"
        />
      </div>
      
      <div className="space-y-1">
        <Label className="text-xs font-medium">Replace With</Label>
        <Input
          placeholder="Replacement text..."
          value={replaceText}
          onChange={(e) => setReplaceText(e.target.value)}
          className="h-7 text-xs"
        />
      </div>
      
      <div className="space-y-1">
        <Label className="text-xs font-medium">Replace Mode</Label>
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

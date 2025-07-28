import { useState, useEffect, useRef } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Widget } from '@/hooks/use-grid-system'

interface NotesWidgetProps {
  widget: Widget
  updateWidget: (id: string, updates: Partial<Widget>) => void
  autoResizeWidget?: (contentHeight: number, contentWidth?: number) => void
  connectedInputs?: Record<string, any>
}

export function NotesWidget({ widget, updateWidget, connectedInputs = {} }: NotesWidgetProps) {
  const [text, setText] = useState(widget.data?.text || '')
  const lastSavedText = useRef(widget.data?.text || '')

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (text !== lastSavedText.current) {
        lastSavedText.current = text
        updateWidget(widget.id, { data: { ...widget.data, text } })
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [text, widget.id, updateWidget])

  return (
    <div className="p-3 h-full">
      <Textarea
        placeholder="Start typing your notes..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="h-full resize-none border-none focus-visible:ring-0 focus-visible:ring-offset-0"
      />
    </div>
  )
}
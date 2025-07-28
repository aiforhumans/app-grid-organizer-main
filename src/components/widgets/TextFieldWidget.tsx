import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Widget } from '@/hooks/use-grid-system'

interface TextFieldWidgetProps {
  widget: Widget
  updateWidget: (id: string, updates: Partial<Widget>) => void
  autoResizeWidget?: (contentHeight: number, contentWidth?: number) => void
}

export function TextFieldWidget({ widget, updateWidget }: TextFieldWidgetProps) {
  const [text, setText] = useState(widget.data?.text || '')
  const [label, setLabel] = useState(widget.data?.label || 'Text Field')
  const lastSavedData = useRef({ text: widget.data?.text || '', label: widget.data?.label || 'Text Field' })

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (text !== lastSavedData.current.text || label !== lastSavedData.current.label) {
        lastSavedData.current = { text, label }
        updateWidget(widget.id, { data: { ...widget.data, text, label } })
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [text, label, widget.data, updateWidget])

  return (
    <div className="p-3 h-full space-y-2">
      <div className="space-y-1">
        <Label htmlFor={`label-${widget.id}`} className="text-xs font-medium">
          Label
        </Label>
        <Input
          id={`label-${widget.id}`}
          placeholder="Field label..."
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="h-7 text-xs"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor={`text-${widget.id}`} className="text-xs font-medium">
          Value
        </Label>
        <Input
          id={`text-${widget.id}`}
          placeholder="Enter text..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="h-8"
        />
      </div>
    </div>
  )
}

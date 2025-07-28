import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Widget } from '@/hooks/use-grid-system'

interface TextFieldWidgetProps {
  widget: Widget
  updateWidget: (id: string, updates: Partial<Widget>) => void
  autoResizeWidget?: (contentHeight: number, contentWidth?: number) => void
  connectedInputs?: Record<string, any>
}

export function TextFieldWidget({ widget, updateWidget, connectedInputs = {} }: TextFieldWidgetProps) {
  const [text, setText] = useState(widget.data?.text || '')
  const [label, setLabel] = useState(widget.data?.label || 'Text Field')
  const lastSavedData = useRef({ text: widget.data?.text || '', label: widget.data?.label || 'Text Field' })

  // Use connected input if available
  const effectiveText = connectedInputs.text !== undefined ? connectedInputs.text : text
  const hasConnectedInput = connectedInputs.text !== undefined

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Only save if not using connected input
      if (!hasConnectedInput && (text !== lastSavedData.current.text || label !== lastSavedData.current.label)) {
        lastSavedData.current = { text, label }
        updateWidget(widget.id, { data: { ...widget.data, text, label } })
      } else if (hasConnectedInput && label !== lastSavedData.current.label) {
        // Save label changes even when using connected input
        lastSavedData.current = { text: effectiveText, label }
        updateWidget(widget.id, { data: { ...widget.data, text: effectiveText, label } })
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [text, label, widget.data, updateWidget, hasConnectedInput, effectiveText])

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
        <Label htmlFor={`text-${widget.id}`} className="text-xs font-medium flex items-center gap-2">
          Value
          {hasConnectedInput && (
            <span className="text-xs bg-accent text-accent-foreground px-1 py-0.5 rounded">
              Connected
            </span>
          )}
        </Label>
        <Input
          id={`text-${widget.id}`}
          placeholder="Enter text..."
          value={effectiveText}
          onChange={(e) => setText(e.target.value)}
          className="h-8"
          disabled={hasConnectedInput}
          title={hasConnectedInput ? "This field is receiving input from a connected widget" : undefined}
        />
      </div>
    </div>
  )
}

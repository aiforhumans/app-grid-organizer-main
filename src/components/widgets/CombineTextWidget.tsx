import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Plus } from '@phosphor-icons/react'
import { Widget } from '@/hooks/use-grid-system'

interface CombineTextWidgetProps {
  widget: Widget
  updateWidget: (id: string, updates: Partial<Widget>) => void
  autoResizeWidget?: (contentHeight: number, contentWidth?: number) => void
  connectedInputs?: Record<string, any>
}

export function CombineTextWidget({ widget, updateWidget, autoResizeWidget, connectedInputs = {} }: CombineTextWidgetProps) {
  const [inputs, setInputs] = useState<string[]>(widget.data?.inputs || ['', ''])
  const [separator, setSeparator] = useState(widget.data?.separator || ' ')
  const [result, setResult] = useState('')
  const lastSavedData = useRef({ inputs: widget.data?.inputs || ['', ''], separator: widget.data?.separator || ' ' })

  useEffect(() => {
    const combined = inputs.filter(input => input.trim()).join(separator)
    setResult(combined)
  }, [inputs, separator])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const currentData = { inputs, separator }
      if (JSON.stringify(currentData) !== JSON.stringify(lastSavedData.current)) {
        lastSavedData.current = currentData
        updateWidget(widget.id, { data: { ...widget.data, ...currentData, result } })
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [inputs, separator, result, widget.data, updateWidget])

  // Auto-resize based on number of inputs
  useEffect(() => {
    if (autoResizeWidget) {
      const baseHeight = 120 // Separator + labels + result
      const inputHeight = 32 // Each input field height
      const spacing = 8 // Spacing between inputs
      const calculatedHeight = baseHeight + (inputs.length * (inputHeight + spacing))
      
      autoResizeWidget(calculatedHeight)
    }
  }, [inputs.length, autoResizeWidget])

  const addInput = () => {
    setInputs([...inputs, ''])
  }

  const updateInput = (index: number, value: string) => {
    const newInputs = [...inputs]
    newInputs[index] = value
    setInputs(newInputs)
  }

  const removeInput = (index: number) => {
    if (inputs.length > 2) {
      const newInputs = inputs.filter((_, i) => i !== index)
      setInputs(newInputs)
    }
  }

  return (
    <div className="p-3 h-full space-y-2 overflow-y-auto">
      <div className="space-y-1">
        <Label className="text-xs font-medium">Separator</Label>
        <Input
          placeholder="Separator..."
          value={separator}
          onChange={(e) => setSeparator(e.target.value)}
          className="h-7 text-xs"
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">Text Inputs</Label>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={addInput}
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
        
        {inputs.map((input, index) => (
          <div key={index} className="flex gap-1">
            <Input
              placeholder={`Text ${index + 1}...`}
              value={input}
              onChange={(e) => updateInput(index, e.target.value)}
              className="h-7 text-xs flex-1"
            />
            {inputs.length > 2 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-destructive"
                onClick={() => removeInput(index)}
              >
                ×
              </Button>
            )}
          </div>
        ))}
      </div>
      
      <div className="space-y-1">
        <Label className="text-xs font-medium">Result</Label>
        <div className="p-2 bg-muted rounded text-xs min-h-8 break-words">
          {result || 'Combined text will appear here...'}
        </div>
      </div>
    </div>
  )
}

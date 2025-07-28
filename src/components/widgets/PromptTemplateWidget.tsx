import { useState, useEffect, useRef } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Widget } from '@/hooks/use-grid-system'

interface PromptTemplateWidgetProps {
  widget: Widget
  updateWidget: (id: string, updates: Partial<Widget>) => void
  autoResizeWidget?: (contentHeight: number, contentWidth?: number) => void
}

export function PromptTemplateWidget({ widget, updateWidget, autoResizeWidget }: PromptTemplateWidgetProps) {
  const [template, setTemplate] = useState(widget.data?.template || 'You are a helpful assistant. {context}\n\nPlease help with: {task}')
  const [variables, setVariables] = useState<Record<string, string>>(widget.data?.variables || {})
  const [result, setResult] = useState('')
  const lastSavedData = useRef({
    template: widget.data?.template || 'You are a helpful assistant. {context}\n\nPlease help with: {task}',
    variables: widget.data?.variables || {}
  })

  // Extract variables from template
  useEffect(() => {
    const matches = template.match(/\{([^}]+)\}/g)
    const newVariables: Record<string, string> = {}
    
    if (matches) {
      matches.forEach(match => {
        const varName = match.slice(1, -1)
        newVariables[varName] = variables[varName] || ''
      })
    }
    
    if (JSON.stringify(newVariables) !== JSON.stringify(variables)) {
      setVariables(newVariables)
    }
  }, [template])

  // Generate result
  useEffect(() => {
    let filled = template
    Object.entries(variables).forEach(([key, value]) => {
      filled = filled.replace(new RegExp(`\\{${key}\\}`, 'g'), value)
    })
    setResult(filled)
  }, [template, variables])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const currentData = { template, variables }
      if (JSON.stringify(currentData) !== JSON.stringify(lastSavedData.current)) {
        lastSavedData.current = currentData
        updateWidget(widget.id, { data: { ...widget.data, ...currentData, result } })
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [template, variables, result, widget.data, updateWidget])

  // Auto-resize based on template and number of variables
  useEffect(() => {
    if (autoResizeWidget) {
      const baseHeight = 180 // Template field + result field + labels
      const variableHeight = 60 // Each variable field (label + textarea)
      const variableCount = Object.keys(variables).length
      const calculatedHeight = baseHeight + (variableCount * variableHeight)
      
      autoResizeWidget(calculatedHeight)
    }
  }, [Object.keys(variables).length, autoResizeWidget])

  const updateVariable = (key: string, value: string) => {
    setVariables(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="p-3 h-full space-y-2 overflow-y-auto">
      <div className="space-y-1">
        <Label className="text-xs font-medium">Template</Label>
        <Textarea
          placeholder="Enter your prompt template with {variables}..."
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          className="h-16 text-xs resize-none"
        />
      </div>
      
      {Object.keys(variables).length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs font-medium">Variables</Label>
          {Object.entries(variables).map(([key, value]) => (
            <div key={key} className="space-y-1">
              <Label className="text-xs text-muted-foreground">{key}</Label>
              <Textarea
                placeholder={`Value for {${key}}...`}
                value={value}
                onChange={(e) => updateVariable(key, e.target.value)}
                className="h-12 text-xs resize-none"
              />
            </div>
          ))}
        </div>
      )}
      
      <div className="space-y-1">
        <Label className="text-xs font-medium">Generated Prompt</Label>
        <div className="p-2 bg-muted rounded text-xs min-h-16 break-words whitespace-pre-wrap">
          {result || 'Generated prompt will appear here...'}
        </div>
      </div>
    </div>
  )
}

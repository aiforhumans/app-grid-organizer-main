import { useState, useEffect, useRef, useCallback } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Robot, Play, Square, CircleNotch, ArrowsClockwise } from '@phosphor-icons/react'
import { Widget } from '@/hooks/use-grid-system'

interface LMStudioWidgetProps {
  widget: Widget
  updateWidget: (id: string, updates: Partial<Widget>) => void
  autoResizeWidget?: (contentHeight: number, contentWidth?: number) => void
  connectedInputs?: Record<string, any>
}

export function LMStudioWidget({ widget, updateWidget, autoResizeWidget, connectedInputs = {} }: LMStudioWidgetProps) {
  const [prompt, setPrompt] = useState(widget.data?.prompt || '')
  const [response, setResponse] = useState(widget.data?.response || '')
  const [isLoading, setIsLoading] = useState(false)
  const [serverUrl, setServerUrl] = useState(widget.data?.serverUrl || 'http://localhost:1234')
  const [temperature, setTemperature] = useState(widget.data?.temperature || 0.7)
  const [maxTokens, setMaxTokens] = useState(widget.data?.maxTokens || 500)
  const [modelName, setModelName] = useState(widget.data?.modelName || '')
  const [availableModels, setAvailableModels] = useState<Array<{id: string, object: string}>>([])
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('disconnected')
  
  const lastSavedData = useRef({
    prompt: widget.data?.prompt || '',
    response: widget.data?.response || '',
    serverUrl: widget.data?.serverUrl || 'http://localhost:1234',
    temperature: widget.data?.temperature || 0.7,
    maxTokens: widget.data?.maxTokens || 500,
    modelName: widget.data?.modelName || ''
  })

  // Use connected input if available
  const effectivePrompt = connectedInputs.prompt !== undefined ? connectedInputs.prompt : prompt
  const hasConnectedPrompt = connectedInputs.prompt !== undefined

  // Only get the selected model when available models change
  useEffect(() => {
    if (availableModels.length === 0) return;
    
    // If current model exists in available models, keep using it
    if (modelName && availableModels.find(m => m.id === modelName)) {
      return;
    }
    
    // Otherwise, use first available model
    setModelName(availableModels[0]?.id || '');
  }, [availableModels])

  // Auto-resize based on content (temporarily disabled to prevent infinite parent updates)
  // useEffect(() => {
  //   if (!autoResizeWidget) return
  //   const baseHeight = 350 // Base height for all controls
  //   const responseHeight = response ? Math.min(200, response.split('\n').length * 20) : 60
  //   autoResizeWidget(baseHeight + responseHeight)
  // }, [response])

  // Check LM Studio connection and fetch models
  useEffect(() => {
    const checkConnection = async () => {
      setConnectionStatus('checking')
      try {
        const response = await fetch(`${serverUrl}/v1/models`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
        
        if (response.ok) {
          const data = await response.json()
          setConnectionStatus('connected')
          
          if (data.data && data.data.length > 0) {
            setAvailableModels(prev => {
              // Only update if the models actually changed
              const newModels = data.data
              if (JSON.stringify(prev) === JSON.stringify(newModels)) {
                return prev
              }
              
              return newModels
            })
          } else {
            setAvailableModels([])
          }
        } else {
          setConnectionStatus('disconnected')
          setAvailableModels([])
        }
      } catch (error) {
        setConnectionStatus('disconnected')
        setAvailableModels([])
      }
    }

    checkConnection()
    const interval = setInterval(checkConnection, 10000) // Check every 10 seconds

    return () => clearInterval(interval)
  }, [serverUrl])

  // Save data to widget
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const currentData = {
        prompt: effectivePrompt,
        response,
        serverUrl,
        temperature,
        maxTokens,
        modelName
      }
      
      if (JSON.stringify(currentData) !== JSON.stringify(lastSavedData.current)) {
        lastSavedData.current = currentData
        updateWidget(widget.id, { data: currentData })
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [effectivePrompt, response, serverUrl, temperature, maxTokens, modelName, widget.id, updateWidget])

  const refreshModels = useCallback(async () => {
    try {
      const response = await fetch(`${serverUrl}/v1/models`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.data && data.data.length > 0) {
          setAvailableModels(prev => {
            // Only update if models actually changed
            if (JSON.stringify(prev) === JSON.stringify(data.data)) {
              return prev
            }
            return data.data
          })
        }
      }
    } catch (error) {
      console.error('Error refreshing models:', error)
    }
  }, [serverUrl])

  const sendToLMStudio = async () => {
    if (!effectivePrompt.trim() || connectionStatus !== 'connected') return

    setIsLoading(true)
    setResponse('')

    try {
      const requestBody = {
        model: modelName,
        messages: [
          {
            role: "user",
            content: effectivePrompt
          }
        ],
        temperature: temperature,
        max_tokens: maxTokens,
        stream: false
      }

      const response = await fetch(`${serverUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.choices && data.choices.length > 0) {
        const responseText = data.choices[0].message.content
        setResponse(responseText)
      } else {
        setResponse('No response received from model')
      }
    } catch (error) {
      console.error('Error calling LM Studio:', error)
      setResponse(`Error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const stopGeneration = () => {
    setIsLoading(false)
    // Note: LM Studio doesn't support stopping mid-generation via API
  }

  return (
    <div className="p-3 h-full space-y-3 overflow-y-auto">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Robot className="w-4 h-4" />
          <span className="text-sm font-medium">LM Studio</span>
        </div>
        <Badge 
          variant={connectionStatus === 'connected' ? 'default' : 'secondary'}
          className="text-xs"
        >
          {connectionStatus === 'checking' && <CircleNotch className="w-3 h-3 mr-1 animate-spin" />}
          {connectionStatus}
        </Badge>
      </div>

      {/* Server Configuration */}
      <div className="space-y-2">
        <Label className="text-xs font-medium">Server URL</Label>
        <Input
          placeholder="http://localhost:1234"
          value={serverUrl}
          onChange={(e) => setServerUrl(e.target.value)}
          className="h-7 text-xs"
        />
      </div>

      {/* Model Selection */}
      {connectionStatus === 'connected' && availableModels.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">Model</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshModels}
              className="h-6 w-6 p-0"
              title="Refresh models list"
            >
              <ArrowsClockwise className="w-3 h-3" />
            </Button>
          </div>
          <Select 
            value={modelName} 
            onValueChange={setModelName}
          >
            <SelectTrigger className="h-7 text-xs">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {availableModels.map((model) => (
                <SelectItem key={model.id} value={model.id} className="text-xs">
                  {model.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="text-xs text-muted-foreground">
            {availableModels.length} model{availableModels.length !== 1 ? 's' : ''} available
          </div>
        </div>
      )}

      {/* Model Settings */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs font-medium">Temperature</Label>
          <Input
            type="number"
            min="0"
            max="2"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="h-7 text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-medium">Max Tokens</Label>
          <Input
            type="number"
            min="1"
            max="4096"
            value={maxTokens}
            onChange={(e) => setMaxTokens(parseInt(e.target.value))}
            className="h-7 text-xs"
          />
        </div>
      </div>

      {/* Prompt Input */}
      <div className="space-y-1">
        <Label className="text-xs font-medium flex items-center gap-2">
          Prompt
          {hasConnectedPrompt && (
            <Badge className="text-xs bg-accent text-accent-foreground px-1 py-0.5">
              Connected
            </Badge>
          )}
        </Label>
        <Textarea
          placeholder="Enter your prompt here..."
          value={effectivePrompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="h-20 text-xs resize-none"
          disabled={hasConnectedPrompt}
          title={hasConnectedPrompt ? "This field is receiving input from a connected widget" : undefined}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={sendToLMStudio}
          disabled={isLoading || !effectivePrompt.trim() || connectionStatus !== 'connected'}
          size="sm"
          className="flex-1 h-8 text-xs"
        >
          {isLoading ? (
            <>
              <CircleNotch className="w-3 h-3 mr-1 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Play className="w-3 h-3 mr-1" />
              Send to LM Studio
            </>
          )}
        </Button>
        {isLoading && (
          <Button
            onClick={stopGeneration}
            variant="outline"
            size="sm"
            className="h-8 text-xs"
          >
            <Square className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Response */}
      <div className="space-y-1">
        <Label className="text-xs font-medium">Response</Label>
        <div className="p-2 bg-muted rounded text-xs min-h-16 max-h-48 overflow-y-auto break-words whitespace-pre-wrap">
          {response || 'Response will appear here...'}
        </div>
      </div>
    </div>
  )
}

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { 
  Plus, Calculator, Note, Timer, Hash, 
  TextT, TextAlignLeft, Quotes, ArrowsClockwise, 
  MagicWand, PlusCircle, MinusCircle, CaretDown, CaretRight, Robot
} from '@phosphor-icons/react'
import { useState } from 'react'
import { GridPosition } from '@/hooks/use-grid-system'

interface WidgetPaletteProps {
  onAddWidget: (type: string, position?: Partial<GridPosition>) => string
}

const WIDGET_CATEGORIES = [
  {
    name: 'Basic Widgets',
    expanded: true,
    widgets: [
      { 
        type: 'calculator', 
        icon: Calculator, 
        name: 'Calculator',
        description: 'Basic calculator with memory'
      },
      { 
        type: 'notes', 
        icon: Note, 
        name: 'Notes',
        description: 'Simple text notes'
      },
      { 
        type: 'timer', 
        icon: Timer, 
        name: 'Timer',
        description: 'Countdown timer'
      },
      { 
        type: 'counter', 
        icon: Hash, 
        name: 'Counter',
        description: 'Increment/decrement counter'
      }
    ]
  },
  {
    name: 'Text Widgets',
    expanded: false,
    widgets: [
      { 
        type: 'text-field', 
        icon: TextT, 
        name: 'Text Field',
        description: 'Input field for text'
      },
      { 
        type: 'combine-text', 
        icon: PlusCircle, 
        name: 'Combine Text',
        description: 'Join multiple text inputs'
      },
      { 
        type: 'add-text', 
        icon: TextAlignLeft, 
        name: 'Add Text',
        description: 'Add text to beginning, end, or middle'
      },
      { 
        type: 'remove-text', 
        icon: MinusCircle, 
        name: 'Remove Text',
        description: 'Remove specific text patterns'
      },
      { 
        type: 'text-replace', 
        icon: ArrowsClockwise, 
        name: 'Replace Text',
        description: 'Find and replace text'
      },
      { 
        type: 'text-transform', 
        icon: MagicWand, 
        name: 'Transform Text',
        description: 'Case, reverse, trim operations'
      },
      { 
        type: 'prompt-template', 
        icon: Quotes, 
        name: 'Prompt Template',
        description: 'Template with variables for prompts'
      }
    ]
  },
  {
    name: 'AI',
    expanded: false,
    widgets: [
      { 
        type: 'lm-studio', 
        icon: Robot, 
        name: 'LM Studio',
        description: 'Connect to local LLM models'
      }
    ]
  }
]

export function WidgetPalette({ onAddWidget }: WidgetPaletteProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(
    WIDGET_CATEGORIES.reduce((acc, category) => ({
      ...acc,
      [category.name]: category.expanded
    }), {})
  )

  const handleAddWidget = (type: string) => {
    // Add widget at a random position to avoid overlaps
    const randomX = Math.floor(Math.random() * 400) + 100
    const randomY = Math.floor(Math.random() * 300) + 100
    onAddWidget(type, { x: randomX, y: randomY })
  }

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }))
  }

  return (
    <Card className="w-64 h-full border-r border-border/50 rounded-none">
      <div className="p-4 border-b border-border/50">
        <h2 className="text-lg font-semibold">Widget Palette</h2>
        <p className="text-sm text-muted-foreground">Drag or click to add widgets</p>
      </div>
      
      <div className="p-2 space-y-2 overflow-y-auto">
        {WIDGET_CATEGORIES.map((category) => (
          <Collapsible 
            key={category.name}
            open={expandedCategories[category.name]}
            onOpenChange={() => toggleCategory(category.name)}
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start p-2 h-auto font-medium text-sm"
              >
                {expandedCategories[category.name] ? (
                  <CaretDown className="w-3 h-3 mr-2" />
                ) : (
                  <CaretRight className="w-3 h-3 mr-2" />
                )}
                {category.name}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-1 ml-2">
              {category.widgets.map(({ type, icon: Icon, name, description }) => (
                <Button
                  key={type}
                  variant="ghost"
                  className="w-full justify-start p-3 h-auto flex-col items-start space-y-1"
                  onClick={() => handleAddWidget(type)}
                >
                  <div className="flex items-center gap-2 w-full">
                    <Icon className="w-4 h-4 text-accent" />
                    <span className="font-medium text-sm">{name}</span>
                    <Plus className="w-3 h-3 ml-auto text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground text-left">{description}</p>
                </Button>
              ))}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>

      <div className="absolute bottom-4 left-4 right-4">
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Click to add widget</p>
          <p>• Drag widgets to move</p>
          <p>• Chain widgets with connections</p>
        </div>
      </div>
    </Card>
  )
}
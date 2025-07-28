import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Widget } from '@/hooks/use-grid-system'

interface CalculatorWidgetProps {
  widget: Widget
  updateWidget: (id: string, updates: Partial<Widget>) => void
  autoResizeWidget?: (contentHeight: number, contentWidth?: number) => void
}

export function CalculatorWidget({ widget, updateWidget }: CalculatorWidgetProps) {
  const [display, setDisplay] = useState('0')
  const [operation, setOperation] = useState<string | null>(null)
  const [previousValue, setPreviousValue] = useState<number | null>(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num)
      setWaitingForOperand(false)
    } else {
      setDisplay(display === '0' ? num : display + num)
    }
  }

  const inputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display)

    if (previousValue === null) {
      setPreviousValue(inputValue)
    } else if (operation) {
      const currentValue = previousValue || 0
      const newValue = calculate(currentValue, inputValue, operation)

      setDisplay(String(newValue))
      setPreviousValue(newValue)
    }

    setWaitingForOperand(true)
    setOperation(nextOperation)
  }

  const calculate = (firstValue: number, secondValue: number, operation: string) => {
    switch (operation) {
      case '+':
        return firstValue + secondValue
      case '-':
        return firstValue - secondValue
      case '×':
        return firstValue * secondValue
      case '÷':
        return firstValue / secondValue
      case '=':
        return secondValue
      default:
        return secondValue
    }
  }

  const performCalculation = () => {
    const inputValue = parseFloat(display)

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation)
      setDisplay(String(newValue))
      setPreviousValue(null)
      setOperation(null)
      setWaitingForOperand(true)
    }
  }

  const clear = () => {
    setDisplay('0')
    setOperation(null)
    setPreviousValue(null)
    setWaitingForOperand(false)
  }

  return (
    <div className="p-3 h-full flex flex-col">
      <div className="bg-muted rounded p-2 mb-2 text-right font-mono text-lg">
        {display}
      </div>
      
      <div className="grid grid-cols-4 gap-1 flex-1">
        <Button size="sm" variant="outline" className="text-xs" onClick={clear}>C</Button>
        <Button size="sm" variant="outline" className="text-xs" onClick={() => inputOperation('÷')}>÷</Button>
        <Button size="sm" variant="outline" className="text-xs" onClick={() => inputOperation('×')}>×</Button>
        <Button size="sm" variant="outline" className="text-xs" onClick={() => inputOperation('-')}>-</Button>
        
        <Button size="sm" variant="outline" className="text-xs" onClick={() => inputNumber('7')}>7</Button>
        <Button size="sm" variant="outline" className="text-xs" onClick={() => inputNumber('8')}>8</Button>
        <Button size="sm" variant="outline" className="text-xs" onClick={() => inputNumber('9')}>9</Button>
        <Button size="sm" variant="outline" className="text-xs row-span-2" onClick={() => inputOperation('+')}>+</Button>
        
        <Button size="sm" variant="outline" className="text-xs" onClick={() => inputNumber('4')}>4</Button>
        <Button size="sm" variant="outline" className="text-xs" onClick={() => inputNumber('5')}>5</Button>
        <Button size="sm" variant="outline" className="text-xs" onClick={() => inputNumber('6')}>6</Button>
        
        <Button size="sm" variant="outline" className="text-xs" onClick={() => inputNumber('1')}>1</Button>
        <Button size="sm" variant="outline" className="text-xs" onClick={() => inputNumber('2')}>2</Button>
        <Button size="sm" variant="outline" className="text-xs" onClick={() => inputNumber('3')}>3</Button>
        <Button size="sm" variant="outline" className="text-xs row-span-2" onClick={performCalculation}>=</Button>
        
        <Button size="sm" variant="outline" className="text-xs col-span-2" onClick={() => inputNumber('0')}>0</Button>
        <Button size="sm" variant="outline" className="text-xs" onClick={() => inputNumber('.')}>.</Button>
      </div>
    </div>
  )
}
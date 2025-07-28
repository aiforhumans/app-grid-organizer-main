// File: src/hooks/use-kv.ts
// Description: Local storage key-value hook replacement for @github/spark
// Author: GitHub Copilot Agent

import { useState, useCallback } from 'react'

export function useKV<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.warn(`Error loading from localStorage for key "${key}":`, error)
      return defaultValue
    }
  })

  const setStoredValue = useCallback((newValue: T | ((prev: T) => T)) => {
    try {
      setValue(currentValue => {
        const valueToStore = typeof newValue === 'function' ? (newValue as (prev: T) => T)(currentValue) : newValue
        localStorage.setItem(key, JSON.stringify(valueToStore))
        return valueToStore
      })
    } catch (error) {
      console.warn(`Error saving to localStorage for key "${key}":`, error)
    }
  }, [key])

  return [value, setStoredValue]
}

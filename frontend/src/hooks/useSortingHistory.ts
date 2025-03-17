import { useContext } from 'react'
import { SortingHistoryContext } from '@/contexts/SortingHistoryContext'
import { v4 as uuidv4 } from 'uuid'

export interface SortingItem {
  id: string
  name: string
  score?: number
}

export interface SortingResult {
  id: string
  timestamp: number
  result: SortingItem[]
  parameters?: string[]
}

export const useSortingHistory = () => {
  const context = useContext(SortingHistoryContext)
  
  if (!context) {
    throw new Error('useSortingHistory must be used within a SortingHistoryProvider')
  }
  
  const { sortingHistory, setSortingHistory } = context
  
  const addSortingResult = (result: SortingItem[]) => {
    const newResult: SortingResult = {
      id: uuidv4(),
      timestamp: Date.now(),
      result
    }
    
    setSortingHistory(prev => [newResult, ...prev])
    return newResult
  }
  
  const removeSortingResult = (id: string) => {
    setSortingHistory(prev => prev.filter(item => item.id !== id))
  }
  
  const clearSortingHistory = () => {
    setSortingHistory([])
  }
  
  const getSortingResultById = (id: string) => {
    return sortingHistory.find(item => item.id === id) || null
  }
  
  return {
    sortingHistory,
    addSortingResult,
    removeSortingResult,
    clearSortingHistory,
    getSortingResultById
  }
}

export default useSortingHistory 
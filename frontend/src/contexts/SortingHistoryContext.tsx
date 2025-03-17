import React, { createContext, useState, useEffect, ReactNode } from 'react'
import { SortingResult } from '@/hooks/useSortingHistory'

interface SortingHistoryContextType {
  sortingHistory: SortingResult[]
  setSortingHistory: React.Dispatch<React.SetStateAction<SortingResult[]>>
}

export const SortingHistoryContext = createContext<SortingHistoryContextType | null>(null)

interface SortingHistoryProviderProps {
  children: ReactNode
}

export const SortingHistoryProvider: React.FC<SortingHistoryProviderProps> = ({ children }) => {
  const [sortingHistory, setSortingHistory] = useState<SortingResult[]>(() => {
    const savedHistory = localStorage.getItem('sortingHistory')
    return savedHistory ? JSON.parse(savedHistory) : []
  })
  
  useEffect(() => {
    localStorage.setItem('sortingHistory', JSON.stringify(sortingHistory))
  }, [sortingHistory])
  
  return (
    <SortingHistoryContext.Provider value={{ sortingHistory, setSortingHistory }}>
      {children}
    </SortingHistoryContext.Provider>
  )
} 
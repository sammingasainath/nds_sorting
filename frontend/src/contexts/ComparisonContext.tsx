import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react'

interface College {
  id: string
  name: string
  [key: string]: any
}

interface ComparisonContextType {
  selectedColleges: College[]
  addCollege: (college: College) => void
  removeCollege: (collegeId: string) => void
  clearColleges: () => void
  isSelected: (collegeId: string) => boolean
}

export const ComparisonContext = createContext<ComparisonContextType | null>(null)

interface ComparisonProviderProps {
  children: ReactNode
}

export const ComparisonProvider: React.FC<ComparisonProviderProps> = ({ children }) => {
  const [selectedColleges, setSelectedColleges] = useState<College[]>(() => {
    const saved = localStorage.getItem('comparisonColleges')
    return saved ? JSON.parse(saved) : []
  })
  
  useEffect(() => {
    localStorage.setItem('comparisonColleges', JSON.stringify(selectedColleges))
  }, [selectedColleges])
  
  const addCollege = (college: College) => {
    if (!isSelected(college.id) && selectedColleges.length < 5) {
      setSelectedColleges(prev => [...prev, college])
      return true
    }
    return false
  }
  
  const removeCollege = (collegeId: string) => {
    setSelectedColleges(prev => prev.filter(c => c.id !== collegeId))
  }
  
  const clearColleges = () => {
    setSelectedColleges([])
  }
  
  const isSelected = (collegeId: string) => {
    return selectedColleges.some(c => c.id === collegeId)
  }
  
  return (
    <ComparisonContext.Provider 
      value={{ 
        selectedColleges, 
        addCollege, 
        removeCollege, 
        clearColleges, 
        isSelected 
      }}
    >
      {children}
    </ComparisonContext.Provider>
  )
}

export const useComparison = () => {
  const context = useContext(ComparisonContext)
  if (!context) {
    throw new Error('useComparison must be used within a ComparisonProvider')
  }
  return context
} 
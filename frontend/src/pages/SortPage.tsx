import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MobileLayout from '@/components/MobileLayout'
import useMobileDetect from '@/utils/useMobileDetect'
import { useCollegeData } from '@/hooks/useCollegeData'
import RecursiveSorting from '@/components/RecursiveSorting'
import { useSortingHistory } from '@/hooks/useSortingHistory'
import { Loader2 } from 'lucide-react'

const SortPage = () => {
  const navigate = useNavigate()
  const { isMobile, isTablet } = useMobileDetect()
  const { colleges, parameters, isLoading, error } = useCollegeData()
  const { addSortingResult } = useSortingHistory()
  
  const handleSaveResult = (result: any) => {
    const savedResult = addSortingResult(result)
    console.log('Sorting result saved:', savedResult)
    navigate('/history')
  }
  
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isMobile || isTablet ? 'p-4' : 'container mx-auto p-8'}`}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Loading data...</h2>
          <p className="text-muted-foreground">Please wait while we fetch the colleges and parameters</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className={`${isMobile || isTablet ? 'p-4' : 'container mx-auto p-8'}`}>
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-red-500">{error.message}</p>
        <button 
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    )
  }
  
  if (isMobile || isTablet) {
    return (
      <MobileLayout title="Sort Preferences" showBackButton={true}>
        <div className="p-4">
          <RecursiveSorting
            colleges={colleges}
            parameters={parameters}
            onSaveResult={handleSaveResult}
            isMobile={true}
          />
        </div>
      </MobileLayout>
    )
  }
  
  // Desktop version
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Sort Your Preferences</h1>
      <p className="mb-6 text-muted-foreground">
        Compare options to determine your preferences. This will help you find the best college match.
      </p>
      
      <RecursiveSorting
        colleges={colleges}
        parameters={parameters}
        onSaveResult={handleSaveResult}
        isMobile={false}
      />
    </div>
  )
}

export default SortPage 
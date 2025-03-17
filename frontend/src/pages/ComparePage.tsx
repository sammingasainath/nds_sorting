import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, ArrowRight, Plus, Trash2 } from 'lucide-react'
import MobileLayout from '@/components/MobileLayout'
import TouchFeedback from '@/components/TouchFeedback'
import useMobileDetect from '@/utils/useMobileDetect'
import { useCollegeData } from '@/hooks/useCollegeData'
import { useComparison } from '@/contexts/ComparisonContext'

interface College {
  id: string
  name: string
  [key: string]: any
}

const ComparePage = () => {
  const navigate = useNavigate()
  const { isMobile, isTablet } = useMobileDetect()
  const { colleges, parameters, isLoading, error } = useCollegeData()
  const { selectedColleges, addCollege, removeCollege, clearColleges } = useComparison()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<College[]>([])
  const [selectedParameters, setSelectedParameters] = useState<string[]>([])
  
  // Filter colleges based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([])
      return
    }
    
    const query = searchQuery.toLowerCase()
    const results = colleges
      .filter(college => 
        college.name.toLowerCase().includes(query) || 
        (college.state && college.state.toLowerCase().includes(query))
      )
      .slice(0, 10) // Limit results for performance
    
    setSearchResults(results)
  }, [searchQuery, colleges])
  
  // Initialize with some default parameters
  useEffect(() => {
    if (parameters.length > 0 && selectedParameters.length === 0) {
      // Select first 3 parameters by default
      setSelectedParameters(parameters.slice(0, 3).map(p => p.id))
    }
  }, [parameters, selectedParameters])
  
  const handleAddCollege = (college: College) => {
    addCollege(college)
    setSearchQuery('')
    setSearchResults([])
  }
  
  const handleRemoveCollege = (collegeId: string) => {
    removeCollege(collegeId)
  }
  
  const handleToggleParameter = (parameterId: string) => {
    setSelectedParameters(prev => 
      prev.includes(parameterId)
        ? prev.filter(id => id !== parameterId)
        : [...prev, parameterId]
    )
  }
  
  const handleCompare = () => {
    // In a real app, navigate to comparison results
    console.log('Comparing colleges:', selectedColleges)
    console.log('Selected parameters:', selectedParameters)
  }
  
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isMobile || isTablet ? 'p-4' : 'container mx-auto p-8'}`}>
        <div className="text-center">
          <div className="w-10 h-10 border-t-2 border-b-2 border-primary rounded-full animate-spin mx-auto mb-4"></div>
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
  
  // Mobile layout
  if (isMobile || isTablet) {
    return (
      <MobileLayout title="Compare Colleges" showBackButton={true}>
        <div className="p-4">
          {/* Search input */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search colleges to compare..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 pl-10 pr-10 bg-card rounded-lg"
              />
              <Search size={18} className="absolute left-3 top-3.5 text-muted-foreground" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3.5 text-muted-foreground"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            
            {/* Search results */}
            {searchResults.length > 0 && (
              <div className="mt-2 bg-card rounded-lg overflow-hidden">
                {searchResults.map(college => (
                  <TouchFeedback 
                    key={college.id} 
                    onClick={() => handleAddCollege(college)}
                  >
                    <div className="p-3 flex justify-between items-center border-b border-accent last:border-0">
                      <div>
                        <h3 className="font-medium">{college.name}</h3>
                        {college.state && (
                          <p className="text-sm text-muted-foreground">{college.state}</p>
                        )}
                      </div>
                      <Plus size={18} className="text-primary" />
                    </div>
                  </TouchFeedback>
                ))}
              </div>
            )}
          </div>
          
          {/* Selected colleges */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Selected Colleges</h2>
              {selectedColleges.length > 0 && (
                <TouchFeedback onClick={clearColleges}>
                  <div className="text-sm text-destructive">Clear All</div>
                </TouchFeedback>
              )}
            </div>
            
            {selectedColleges.length === 0 ? (
              <div className="bg-card rounded-lg p-4 text-center text-muted-foreground">
                <p>Search and select colleges to compare</p>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedColleges.map(college => (
                  <div 
                    key={college.id} 
                    className="bg-card rounded-lg p-3 flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-medium">{college.name}</h3>
                      {college.state && (
                        <p className="text-sm text-muted-foreground">{college.state}</p>
                      )}
                    </div>
                    <TouchFeedback onClick={() => handleRemoveCollege(college.id)}>
                      <div className="p-2 text-destructive">
                        <Trash2 size={18} />
                      </div>
                    </TouchFeedback>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Parameters */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Parameters to Compare</h2>
            <div className="bg-card rounded-lg p-4">
              <div className="space-y-2">
                {parameters.map(param => (
                  <div 
                    key={param.id} 
                    className="flex items-center"
                  >
                    <input
                      type="checkbox"
                      id={`param-${param.id}`}
                      checked={selectedParameters.includes(param.id)}
                      onChange={() => handleToggleParameter(param.id)}
                      className="mr-2 h-4 w-4"
                    />
                    <label htmlFor={`param-${param.id}`} className="text-sm">
                      {param.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Compare button */}
          <TouchFeedback 
            onClick={handleCompare}
            disabled={selectedColleges.length < 2}
          >
            <div 
              className={`py-3 px-4 rounded-md font-medium flex justify-center items-center ${
                selectedColleges.length < 2 
                  ? 'bg-muted text-muted-foreground' 
                  : 'bg-primary text-primary-foreground'
              }`}
            >
              Compare {selectedColleges.length} Colleges
              <ArrowRight size={18} className="ml-2" />
            </div>
          </TouchFeedback>
        </div>
      </MobileLayout>
    )
  }
  
  // Desktop layout
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Compare Colleges</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-card rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Search Colleges</h2>
            
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search colleges..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 pl-10 bg-accent rounded-lg"
              />
              <Search size={18} className="absolute left-3 top-3.5 text-muted-foreground" />
            </div>
            
            {searchResults.length > 0 && (
              <div className="bg-accent rounded-lg overflow-hidden">
                {searchResults.map(college => (
                  <div 
                    key={college.id} 
                    className="p-3 flex justify-between items-center border-b border-card last:border-0 hover:bg-muted cursor-pointer"
                    onClick={() => handleAddCollege(college)}
                  >
                    <div>
                      <h3 className="font-medium">{college.name}</h3>
                      {college.state && (
                        <p className="text-sm text-muted-foreground">{college.state}</p>
                      )}
                    </div>
                    <Plus size={18} className="text-primary" />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="bg-card rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Parameters</h2>
            </div>
            
            <div className="space-y-2">
              {parameters.map(param => (
                <div 
                  key={param.id} 
                  className="flex items-center"
                >
                  <input
                    type="checkbox"
                    id={`param-desktop-${param.id}`}
                    checked={selectedParameters.includes(param.id)}
                    onChange={() => handleToggleParameter(param.id)}
                    className="mr-2 h-4 w-4"
                  />
                  <label htmlFor={`param-desktop-${param.id}`}>
                    {param.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <div className="bg-card rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Selected Colleges</h2>
              {selectedColleges.length > 0 && (
                <button 
                  className="text-sm text-destructive hover:underline"
                  onClick={clearColleges}
                >
                  Clear All
                </button>
              )}
            </div>
            
            {selectedColleges.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                <p>Search and select colleges to compare</p>
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                {selectedColleges.map(college => (
                  <div 
                    key={college.id} 
                    className="bg-accent rounded-lg p-4 flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-medium">{college.name}</h3>
                      {college.state && (
                        <p className="text-sm text-muted-foreground">{college.state}</p>
                      )}
                    </div>
                    <button
                      className="p-2 text-destructive hover:bg-destructive/10 rounded"
                      onClick={() => handleRemoveCollege(college.id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <button 
              className={`w-full py-3 px-4 rounded-md font-medium flex justify-center items-center ${
                selectedColleges.length < 2 
                  ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
              onClick={handleCompare}
              disabled={selectedColleges.length < 2}
            >
              Compare {selectedColleges.length} Colleges
              <ArrowRight size={18} className="ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ComparePage 
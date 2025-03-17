import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, ChevronRight, Trash2 } from 'lucide-react'
import MobileLayout from '@/components/MobileLayout'
import TouchFeedback from '@/components/TouchFeedback'
import useMobileDetect from '@/utils/useMobileDetect'
import { useSortingHistory } from '@/hooks/useSortingHistory'
import { formatDistanceToNow } from 'date-fns'

const HistoryPage = () => {
  const navigate = useNavigate()
  const { isMobile, isTablet } = useMobileDetect()
  const { sortingHistory, clearSortingHistory, removeSortingResult } = useSortingHistory()
  
  const handleViewDetail = (id: string) => {
    navigate(`/history/${id}`)
  }
  
  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all sorting history?')) {
      clearSortingHistory()
    }
  }
  
  const handleDeleteItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (window.confirm('Are you sure you want to delete this item?')) {
      removeSortingResult(id)
    }
  }
  
  const formatDate = (timestamp: number) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
  }
  
  if (isMobile || isTablet) {
    return (
      <MobileLayout title="Sorting History" showBackButton={true}>
        <div className="p-4">
          {sortingHistory.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No history yet</h2>
              <p className="text-muted-foreground mb-4">
                Your sorting history will appear here once you complete a sorting session.
              </p>
              <TouchFeedback onClick={() => navigate('/sort')}>
                <div className="bg-primary text-primary-foreground py-3 px-4 rounded-md font-medium">
                  Start Sorting
                </div>
              </TouchFeedback>
            </div>
          ) : (
            <>
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-lg font-semibold">Your sorting sessions</h2>
                {sortingHistory.length > 0 && (
                  <TouchFeedback onClick={handleClearHistory}>
                    <div className="text-destructive flex items-center">
                      <Trash2 size={16} className="mr-1" />
                      <span>Clear All</span>
                    </div>
                  </TouchFeedback>
                )}
              </div>
              
              <div className="space-y-3">
                {sortingHistory.map((item) => (
                  <TouchFeedback key={item.id} onClick={() => handleViewDetail(item.id)}>
                    <div className="bg-card rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">
                          {item.result.length > 0 
                            ? `Top choice: ${item.result[0].name}` 
                            : 'Sorting session'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(item.timestamp)}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <TouchFeedback onClick={(e) => handleDeleteItem(e, item.id)}>
                          <div className="p-2 text-destructive mr-2">
                            <Trash2 size={18} />
                          </div>
                        </TouchFeedback>
                        <ChevronRight size={20} className="text-muted-foreground" />
                      </div>
                    </div>
                  </TouchFeedback>
                ))}
              </div>
            </>
          )}
        </div>
      </MobileLayout>
    )
  }
  
  // Desktop version
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Sorting History</h1>
        {sortingHistory.length > 0 && (
          <button 
            className="text-destructive flex items-center hover:underline"
            onClick={handleClearHistory}
          >
            <Trash2 size={16} className="mr-1" />
            <span>Clear All History</span>
          </button>
        )}
      </div>
      
      {sortingHistory.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg">
          <Calendar className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No history yet</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Your sorting history will appear here once you complete a sorting session.
          </p>
          <button 
            className="bg-primary text-primary-foreground py-2 px-6 rounded-md font-medium"
            onClick={() => navigate('/sort')}
          >
            Start Sorting
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortingHistory.map((item) => (
            <div 
              key={item.id} 
              className="bg-card rounded-lg p-6 hover:bg-accent transition-colors duration-200 cursor-pointer"
              onClick={() => handleViewDetail(item.id)}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold">
                  {item.result.length > 0 
                    ? `Top choice: ${item.result[0].name}` 
                    : 'Sorting session'}
                </h3>
                <button 
                  className="text-destructive p-1 hover:bg-destructive/10 rounded"
                  onClick={(e) => handleDeleteItem(e, item.id)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <p className="text-muted-foreground mb-2">
                {formatDate(item.timestamp)}
              </p>
              <p className="text-sm">
                {item.result.length} items sorted
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default HistoryPage 
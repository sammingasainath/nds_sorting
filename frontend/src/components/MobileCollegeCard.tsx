import React from 'react'
import { Star, ChevronRight } from 'lucide-react'
import TouchFeedback from './TouchFeedback'

interface College {
  id: string
  name: string
  state?: string
  rank?: number
  tuition?: number
  acceptanceRate?: number
  [key: string]: any
}

interface MobileCollegeCardProps {
  college: College
  onView: (id: string) => void
  onFavorite?: (id: string) => void
  isFavorited?: boolean
}

const MobileCollegeCard: React.FC<MobileCollegeCardProps> = ({
  college,
  onView,
  onFavorite,
  isFavorited = false
}) => {
  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onFavorite) {
      onFavorite(college.id)
    }
  }
  
  const formatCurrency = (value?: number) => {
    if (value === undefined) return 'N/A'
    return `$${value.toLocaleString()}`
  }
  
  const formatPercentage = (value?: number) => {
    if (value === undefined) return 'N/A'
    return `${(value * 100).toFixed(1)}%`
  }
  
  return (
    <TouchFeedback onClick={() => onView(college.id)}>
      <div className="bg-card rounded-lg overflow-hidden">
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold">{college.name}</h3>
            {onFavorite && (
              <TouchFeedback onClick={handleFavorite}>
                <div className={`p-1 ${isFavorited ? 'text-yellow-500' : 'text-muted-foreground'}`}>
                  <Star size={20} fill={isFavorited ? 'currentColor' : 'none'} />
                </div>
              </TouchFeedback>
            )}
          </div>
          
          {college.state && (
            <p className="text-sm text-muted-foreground mb-3">{college.state}</p>
          )}
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            {college.rank !== undefined && (
              <div>
                <span className="text-muted-foreground">Rank: </span>
                <span>#{college.rank}</span>
              </div>
            )}
            
            {college.tuition !== undefined && (
              <div>
                <span className="text-muted-foreground">Tuition: </span>
                <span>{formatCurrency(college.tuition)}</span>
              </div>
            )}
            
            {college.acceptanceRate !== undefined && (
              <div>
                <span className="text-muted-foreground">Acceptance: </span>
                <span>{formatPercentage(college.acceptanceRate)}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="border-t border-border p-2 flex justify-end">
          <ChevronRight size={18} className="text-muted-foreground" />
        </div>
      </div>
    </TouchFeedback>
  )
}

export default MobileCollegeCard 
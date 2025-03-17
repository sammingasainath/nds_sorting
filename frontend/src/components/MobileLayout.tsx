import React, { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Home, History, Search, Settings, Compare } from 'lucide-react'
import TouchFeedback from './TouchFeedback'
import MobileNavigation from './MobileNavigation'

interface MobileLayoutProps {
  children: ReactNode
  title: string
  showBackButton?: boolean
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ 
  children, 
  title,
  showBackButton = true
}) => {
  const navigate = useNavigate()
  
  const handleBack = () => {
    navigate(-1)
  }
  
  const navItems = [
    { icon: <Home size={24} />, label: 'Home', path: '/' },
    { icon: <History size={24} />, label: 'History', path: '/history' },
    { icon: <Search size={24} />, label: 'Search', path: '/search' },
    { icon: <Compare size={24} />, label: 'Compare', path: '/compare' },
    { icon: <Settings size={24} />, label: 'Settings', path: '/settings' }
  ]
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3 flex items-center">
        {showBackButton && (
          <TouchFeedback onClick={handleBack}>
            <div className="p-2 -ml-2 mr-2">
              <ChevronLeft size={24} />
            </div>
          </TouchFeedback>
        )}
        <h1 className="text-xl font-semibold flex-1 text-center">
          {title}
        </h1>
        {showBackButton && <div className="w-10"></div>}
      </header>
      
      {/* Main content */}
      <main className="flex-1 overflow-auto pb-20">
        {children}
      </main>
      
      {/* Bottom navigation */}
      <MobileNavigation items={navItems} />
    </div>
  )
}

export default MobileLayout 
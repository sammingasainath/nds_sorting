import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import TouchFeedback from './TouchFeedback'

interface NavItem {
  icon: React.ReactNode
  label: string
  path: string
}

interface MobileNavigationProps {
  items: NavItem[]
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ items }) => {
  const navigate = useNavigate()
  const location = useLocation()
  
  const handleNavigation = (path: string) => {
    navigate(path)
  }
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-10">
      <div className="flex justify-around items-center">
        {items.map((item, index) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/' && location.pathname.startsWith(item.path))
          
          return (
            <TouchFeedback 
              key={index} 
              onClick={() => handleNavigation(item.path)}
            >
              <div className="flex flex-col items-center py-2 px-3">
                <div className={`p-1 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                  {item.icon}
                </div>
                <span className={`text-xs mt-1 ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                  {item.label}
                </span>
              </div>
            </TouchFeedback>
          )
        })}
      </div>
    </nav>
  )
}

export default MobileNavigation 
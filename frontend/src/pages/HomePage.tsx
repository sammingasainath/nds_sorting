import React from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  SortDesc, 
  History, 
  Search, 
  Settings, 
  Compare 
} from 'lucide-react'
import MobileLayout from '@/components/MobileLayout'
import TouchFeedback from '@/components/TouchFeedback'
import useMobileDetect from '@/utils/useMobileDetect'

const HomePage = () => {
  const navigate = useNavigate()
  const { isMobile, isTablet } = useMobileDetect()
  
  const menuItems = [
    {
      icon: <SortDesc size={32} />,
      title: 'Sort',
      description: 'Sort your preferences',
      path: '/',
      action: () => navigate('/sort')
    },
    {
      icon: <History size={32} />,
      title: 'History',
      description: 'View your sorting history',
      path: '/history',
      action: () => navigate('/history')
    },
    {
      icon: <Search size={32} />,
      title: 'Search',
      description: 'Find colleges',
      path: '/search',
      action: () => navigate('/search')
    },
    {
      icon: <Compare size={32} />,
      title: 'Compare',
      description: 'Compare colleges',
      path: '/compare',
      action: () => navigate('/compare')
    },
    {
      icon: <Settings size={32} />,
      title: 'Settings',
      description: 'Customize your experience',
      path: '/settings',
      action: () => navigate('/settings')
    }
  ]
  
  if (isMobile || isTablet) {
    return (
      <MobileLayout title="UCHIT" showBackButton={false}>
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-6 text-center">University Choice Helper Interactive Tool</h1>
          
          <div className="grid gap-4">
            {menuItems.map((item, index) => (
              <TouchFeedback key={index} onClick={item.action}>
                <div className="bg-card rounded-lg p-4 flex items-center">
                  <div className="mr-4 text-primary">{item.icon}</div>
                  <div>
                    <h2 className="text-lg font-semibold">{item.title}</h2>
                    <p className="text-muted-foreground text-sm">{item.description}</p>
                  </div>
                </div>
              </TouchFeedback>
            ))}
          </div>
          
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>Version 1.0.0</p>
          </div>
        </div>
      </MobileLayout>
    )
  }
  
  // Desktop version
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8 text-center">University Choice Helper Interactive Tool</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item, index) => (
          <div 
            key={index} 
            className="bg-card hover:bg-accent transition-colors duration-200 rounded-lg p-6 cursor-pointer"
            onClick={item.action}
          >
            <div className="flex items-center mb-4">
              <div className="mr-4 text-primary">{item.icon}</div>
              <h2 className="text-xl font-semibold">{item.title}</h2>
            </div>
            <p className="text-muted-foreground">{item.description}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-12 text-center text-sm text-muted-foreground">
        <p>Version 1.0.0</p>
        <p className="mt-2">© 2023 UCHIT Team</p>
      </div>
    </div>
  )
}

export default HomePage 
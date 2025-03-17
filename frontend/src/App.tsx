import React, { useState, useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { ThemeProvider } from '@/components/ThemeProvider'
import { SortingHistoryProvider } from '@/contexts/SortingHistoryContext'
import { LLMProviderContext } from '@/contexts/LLMContext'
import { ComparisonProvider } from '@/contexts/ComparisonContext'
import SplashScreen from '@/components/SplashScreen'
import useMobileDetect from '@/utils/useMobileDetect'
import './index.css'
import './styles/mobile.css'

const App = () => {
  const [showSplash, setShowSplash] = useState(true)
  const { isMobile, isTablet } = useMobileDetect()
  
  // Only show splash screen on mobile devices
  const shouldShowSplash = (isMobile || isTablet) && showSplash
  
  return (
    <React.StrictMode>
      <ThemeProvider defaultTheme="dark" storageKey="uchit-theme">
        <LLMProviderContext>
          <SortingHistoryProvider>
            <ComparisonProvider>
              {shouldShowSplash ? (
                <SplashScreen onFinish={() => setShowSplash(false)} />
              ) : (
                <RouterProvider router={router} />
              )}
            </ComparisonProvider>
          </SortingHistoryProvider>
        </LLMProviderContext>
      </ThemeProvider>
    </React.StrictMode>
  )
}

export default App

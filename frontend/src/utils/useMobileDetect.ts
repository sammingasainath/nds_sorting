import { useState, useEffect } from 'react'

interface MobileDetectResult {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
}

const useMobileDetect = (): MobileDetectResult => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  })

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return
    
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    
    // Call handler right away so state gets updated with initial window size
    handleResize()
    
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isMobile = windowSize.width < 480
  const isTablet = windowSize.width >= 480 && windowSize.width < 768
  const isDesktop = windowSize.width >= 768

  return {
    isMobile,
    isTablet,
    isDesktop,
  }
}

export default useMobileDetect 
import React, { useState, ReactNode } from 'react'

interface TouchFeedbackProps {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
  activeClassName?: string
  activeScale?: number
  activeBgOpacity?: number
}

const TouchFeedback: React.FC<TouchFeedbackProps> = ({
  children,
  onClick,
  disabled = false,
  className = '',
  activeClassName = '',
  activeScale = 0.97,
  activeBgOpacity = 0.1
}) => {
  const [isActive, setIsActive] = useState(false)
  
  const handleTouchStart = () => {
    if (!disabled) {
      setIsActive(true)
    }
  }
  
  const handleTouchEnd = () => {
    if (!disabled) {
      setIsActive(false)
    }
  }
  
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick()
    }
  }
  
  const activeStyles = isActive ? {
    transform: `scale(${activeScale})`,
    transition: 'transform 0.1s ease-in-out',
    position: 'relative' as const
  } : {}
  
  const activeBgStyles = isActive ? {
    content: '""',
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'currentColor',
    opacity: activeBgOpacity,
    borderRadius: 'inherit',
    pointerEvents: 'none' as const
  } : {}
  
  return (
    <div
      className={`${className} ${isActive ? activeClassName : ''} relative`}
      style={activeStyles}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
    >
      {children}
      {isActive && <div style={activeBgStyles} />}
    </div>
  )
}

export default TouchFeedback 
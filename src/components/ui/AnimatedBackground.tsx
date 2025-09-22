"use client"

import { useEffect, useState } from 'react'

interface AnimatedBackgroundProps {
  className?: string
  intensity?: 'low' | 'medium' | 'high'
}

export default function AnimatedBackground({ 
  className = "", 
  intensity = 'medium' 
}: AnimatedBackgroundProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className={`animated-bg ${className}`} />
  }

  const getIntensityClass = () => {
    switch (intensity) {
      case 'low':
        return 'opacity-30'
      case 'high':
        return 'opacity-80'
      default:
        return 'opacity-50'
    }
  }

  return (
    <div className={`animated-bg ${getIntensityClass()} ${className}`}>
      {/* Floating geometric shapes */}
      <div className="geometric-shapes">
        <div className="geometric-shape floating-element" />
        <div className="geometric-shape floating-element" />
        <div className="geometric-shape floating-element" />
      </div>
    </div>
  )
}
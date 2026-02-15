import { useState, useEffect } from 'react'
import './CoverImage.css'

interface CoverImageProps {
  src?: string
  alt: string
  size?: 'small' | 'medium' | 'large' | 'xlarge'
  className?: string
  placeholder?: string
}

const SIZE_MAP = {
  small: 40,
  medium: 60,
  large: 120,
  xlarge: 280
}

export default function CoverImage({ 
  src, 
  alt, 
  size = 'medium',
  className = '',
  placeholder = '🎵'
}: CoverImageProps) {
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)
  
  // Reset error state when src changes
  useEffect(() => {
    setError(false)
    setLoaded(false)
  }, [src])
  
  const dimension = SIZE_MAP[size]
  
  // No src or error - show placeholder
  if (!src || error) {
    return (
      <div 
        className={`cover-image-placeholder ${size} ${className}`}
        style={{ width: dimension, height: dimension }}
        title={alt}
      >
        <span>{placeholder}</span>
      </div>
    )
  }
  
  return (
    <div 
      className={`cover-image-container ${size} ${loaded ? 'loaded' : ''} ${className}`}
      style={{ width: dimension, height: dimension }}
    >
      <img
        src={src}
        alt={alt}
        onError={() => {
          console.warn('Image failed to load:', src)
          setError(true)
        }}
        onLoad={() => setLoaded(true)}
        style={{ width: dimension, height: dimension }}
      />
    </div>
  )
}

import { useState, useEffect } from 'react'
import './SplashScreen.css'
// Import the logo so Vite processes it
import logoImage from '../../public/LOGO_WITH_NO_BACKGROUND.png'

const LOADING_MESSAGES = [
  'INITIALIZING WRLD...',
  'CONNECTING TO SERVER...',
  'LOADING 40,000+ SONGS...',
  'PREPARING PLAYER...',
  'ALMOST READY...'
]

export default function SplashScreen() {
  const [progress, setProgress] = useState(0)
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const duration = 3500 // 3.5 seconds total
    const interval = 50 // Update every 50ms
    const steps = duration / interval
    const increment = 100 / steps

    const timer = setInterval(() => {
      setProgress(prev => {
        const next = prev + increment
        // Update message based on progress
        const newIndex = Math.min(
          Math.floor((next / 100) * LOADING_MESSAGES.length),
          LOADING_MESSAGES.length - 1
        )
        setMessageIndex(newIndex)
        return Math.min(next, 100)
      })
    }, interval)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="splash-screen">
      {/* Background */}
      <div className="splash-bg">
        <img src="./assets/BackGround_FOR_APP.png" alt="" />
      </div>
      
      {/* Overlay gradient */}
      <div className="splash-overlay"></div>
      
      {/* Content */}
      <div className="splash-content">
        {/* Logo - using imported image */}
        <div className="splash-logo">
          <img src={logoImage} alt="WRLD" />
        </div>
        
        {/* Loading Section */}
        <div className="splash-loading">
          <div className="loading-text">{LOADING_MESSAGES[messageIndex]}</div>
          
          {/* Progress Bar */}
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${progress}%` }}>
              <div className="progress-glow"></div>
            </div>
          </div>
          
          <div className="progress-percent">{Math.round(progress)}%</div>
        </div>
        
        {/* Tagline */}
        <div className="splash-tagline">
          JUICE WRLD MUSIC PLAYER
        </div>
      </div>
      
      {/* Animated particles */}
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 2}s`
          }}></div>
        ))}
      </div>
    </div>
  )
}

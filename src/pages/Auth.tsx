import { useState } from 'react'
import { HiChevronLeft, HiUser, HiSparkles } from 'react-icons/hi'
import { User } from '../types'
import './Auth.css'

interface AuthProps {
  onBack: () => void
  onSuccess: (user: User) => void
}

export default function Auth({ onBack, onSuccess }: AuthProps) {
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username.trim()) {
      setError('Please enter a username')
      return
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters')
      return
    }

    if (username.length > 20) {
      setError('Username must be less than 20 characters')
      return
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username can only contain letters, numbers, and underscores')
      return
    }

    // Create user
    const avatars = ['avatar1', 'avatar2', 'avatar3', 'avatar4', 'avatar5', 'avatar6']
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)]
    
    const newUser: User = {
      id: `user_${Date.now()}`,
      username: username.trim(),
      displayName: (displayName || username).trim(),
      avatar: randomAvatar,
      createdAt: Date.now()
    }
    
    localStorage.setItem('wrld_user', JSON.stringify(newUser))
    onSuccess(newUser)
  }

  return (
    <div className="auth-page-modern">
      {/* Background */}
      <div className="auth-bg">
        <div className="auth-bg-gradient"></div>
        <div className="auth-bg-circles">
          <div className="circle circle-1"></div>
          <div className="circle circle-2"></div>
          <div className="circle circle-3"></div>
        </div>
      </div>

      {/* Back Button */}
      <button className="auth-back-modern" onClick={onBack}>
        <HiChevronLeft />
      </button>

      {/* Content */}
      <div className="auth-content-modern">
        {/* Logo */}
        <div className="auth-logo-modern">
          <div className="logo-circle">
            <HiSparkles />
          </div>
          <h1>WRLD</h1>
          <p>Create Your Account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form-modern">
          <div className="input-modern-group">
            <div className="input-icon">
              <HiUser />
            </div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-modern"
              autoFocus
            />
          </div>

          <div className="input-modern-group">
            <div className="input-icon">
              <HiSparkles />
            </div>
            <input
              type="text"
              placeholder="Display Name (optional)"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="input-modern"
            />
          </div>

          {error && (
            <div className="auth-error-modern">
              ⚠️ {error}
            </div>
          )}

          <button type="submit" className="auth-submit-modern">
            <span>Get Started</span>
            <HiSparkles />
          </button>
        </form>

        {/* Info */}
        <div className="auth-info-modern">
          <div className="info-item">
            <span className="info-icon">🔒</span>
            <span>100% Local - No server</span>
          </div>
          <div className="info-item">
            <span className="info-icon">⚡</span>
            <span>Instant setup</span>
          </div>
          <div className="info-item">
            <span className="info-icon">🎵</span>
            <span>40K+ songs</span>
          </div>
        </div>
      </div>
    </div>
  )
}

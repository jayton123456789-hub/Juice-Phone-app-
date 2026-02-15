import { useState } from 'react'
import { useUser } from '../hooks/useUser'
import './Auth.css'

export default function Auth() {
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const { signUp } = useUser()

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

    signUp(username, displayName || username)
  }

  return (
    <div className="auth-page">
      <div className="auth-header">
        <div className="logo">
          <span className="logo-icon">🧃</span>
          <h1>Juice Phone</h1>
        </div>
        <p className="tagline">Your personal Juice WRLD vault</p>
      </div>

      <div className="auth-form-container">
        <h2>Create Account</h2>
        <p className="auth-subtitle">Quick sign-up, no email required</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </div>

          <div className="input-group">
            <label htmlFor="displayName">Display Name (optional)</label>
            <input
              id="displayName"
              type="text"
              placeholder="How should we call you?"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-btn">
            Get Started
          </button>
        </form>

        <p className="auth-hint">
          This creates a local profile on your device only.
          <br />
          No data is sent to any server.
        </p>
      </div>

      <div className="auth-stats">
        <div className="stat-item">
          <span className="stat-number">40K+</span>
          <span className="stat-label">Songs</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">Unlimited</span>
          <span className="stat-label">Streaming</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">100%</span>
          <span className="stat-label">Free</span>
        </div>
      </div>
    </div>
  )
}

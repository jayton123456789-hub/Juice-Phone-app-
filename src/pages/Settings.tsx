import { useState } from 'react'
import { HiChevronLeft, HiUser, HiVolumeUp, HiMusicNote, HiColorSwatch } from 'react-icons/hi'
import { MdKeyboard } from 'react-icons/md'
import { User } from '../types'
import Equalizer from '../components/Equalizer'
import KeybindSettings from '../components/KeybindSettings'
import Auth from './Auth'
import { clearAllData } from '../utils/storage'
import './Settings.css'

interface SettingsProps {
  user: User | null
  onBack: () => void
  onUserChange: (user: User | null) => void
}

export default function Settings({ user, onBack, onUserChange }: SettingsProps) {
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('defaultVolume')
    return saved ? Number(saved) : 80
  })
  const [showProfileEdit, setShowProfileEdit] = useState(false)
  const [editName, setEditName] = useState(user?.displayName || '')
  const [showEQ, setShowEQ] = useState(false)
  const [showKeybinds, setShowKeybinds] = useState(false)
  const [showAuth, setShowAuth] = useState(false)

  // Volume change
  const handleVolumeChange = (v: number) => {
    setVolume(v)
    localStorage.setItem('defaultVolume', String(v))
  }

  // Update profile
  const handleSaveProfile = () => {
    if (user && editName.trim()) {
      const updatedUser = { ...user, displayName: editName.trim() }
      localStorage.setItem('wrld_user', JSON.stringify(updatedUser))
      onUserChange(updatedUser)
      setShowProfileEdit(false)
    }
  }

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('wrld_user')
    onUserChange(null)
  }

  // Clear all data
  const handleClearData = () => {
    if (confirm('Clear all saved data? This cannot be undone.')) {
      clearAllData()
      window.location.reload()
    }
  }

  // Handle successful login/signup
  const handleAuthSuccess = (newUser: User) => {
    onUserChange(newUser)
    setShowAuth(false)
  }

  // Show Auth modal if requested
  if (showAuth) {
    return (
      <Auth 
        onBack={() => setShowAuth(false)}
        onSuccess={handleAuthSuccess}
      />
    )
  }

  return (
    <div className="settings-page">
      {/* Header */}
      <div className="settings-header">
        <button className="back-btn" onClick={onBack}>
          <HiChevronLeft />
        </button>
        <h1>Settings</h1>
      </div>

      {/* Profile Section */}
      <section className="settings-section">
        <div className="section-title">
          <HiUser />
          <span>Profile</span>
        </div>
        
        {user ? (
          <div className="profile-card">
            <img src={`./assets/avatars/${user.avatar}.png`} alt={user.displayName} />
            <div className="profile-info">
              <h3>{user.displayName}</h3>
              <p>@{user.username}</p>
            </div>
            <button onClick={() => setShowProfileEdit(true)}>Edit</button>
          </div>
        ) : (
          <div className="profile-card guest">
            <div className="guest-avatar">👤</div>
            <div className="profile-info">
              <h3>Guest</h3>
              <p>Sign in to save your library</p>
            </div>
            <button onClick={() => setShowAuth(true)} className="sign-in-btn">Sign In</button>
          </div>
        )}

        {showProfileEdit && (
          <div className="edit-profile">
            <input
              type="text"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              placeholder="Display name"
            />
            <div className="edit-actions">
              <button onClick={() => setShowProfileEdit(false)}>Cancel</button>
              <button className="primary" onClick={handleSaveProfile}>Save</button>
            </div>
          </div>
        )}
      </section>

      {/* Audio Section */}
      <section className="settings-section">
        <div className="section-title">
          <HiVolumeUp />
          <span>Audio</span>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-label">Default Volume</span>
            <span className="setting-desc">{volume}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={e => handleVolumeChange(Number(e.target.value))}
            className="volume-slider"
          />
        </div>

        <button className="feature-btn" onClick={() => setShowEQ(true)}>
          <HiMusicNote />
          <div>
            <span className="feature-label">Equalizer</span>
            <span className="feature-desc">5-band EQ with presets</span>
          </div>
        </button>
      </section>

      {/* Controls Section */}
      <section className="settings-section">
        <div className="section-title">
          <MdKeyboard />
          <span>Controls</span>
        </div>

        <button className="feature-btn" onClick={() => setShowKeybinds(true)}>
          <MdKeyboard />
          <div>
            <span className="feature-label">Keybinds</span>
            <span className="feature-desc">Customize keyboard shortcuts</span>
          </div>
        </button>
      </section>

      {/* Data Section */}
      <section className="settings-section">
        <div className="section-title">
          <HiColorSwatch />
          <span>Data</span>
        </div>

        <button className="danger-btn" onClick={handleClearData}>
          Clear All Data
        </button>
        
        {user && (
          <button className="danger-btn logout" onClick={handleLogout}>
            Sign Out
          </button>
        )}
      </section>

      {/* Footer */}
      <div className="settings-footer">
        <p>WRLD Music Player v2.0</p>
        <p>Made with 💜 for Juice WRLD fans</p>
      </div>

      {/* Modals */}
      {showEQ && <Equalizer onClose={() => setShowEQ(false)} />}
      {showKeybinds && <KeybindSettings onClose={() => setShowKeybinds(false)} />}
    </div>
  )
}

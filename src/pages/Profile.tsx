import { useState } from 'react'
import { HiArrowLeft, HiPencil, HiLogout, HiTrash } from 'react-icons/hi'
import { useUser } from '../hooks/useUser'
import { clearAllData } from '../utils/storage'
import './Profile.css'

interface ProfileProps {
  onClose: () => void
}

const AVATAR_OPTIONS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=juice1',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=juice2',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=juice3',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=juice4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=juice5',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=juice6',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=juice7',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=juice8',
]

export default function Profile({ onClose }: ProfileProps) {
  const { user, updateProfile, updateAvatar, signOut } = useUser()
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)

  if (!user) return null

  const handleSave = () => {
    if (displayName.trim()) {
      updateProfile({ displayName: displayName.trim() })
    }
    setIsEditing(false)
  }

  const handleSignOut = () => {
    if (confirm('Are you sure you want to sign out?')) {
      signOut()
    }
  }

  const handleClearData = () => {
    if (confirm('⚠️ WARNING: This will delete ALL your data including:\n\n• Favorites\n• Playlists\n• Recently played\n• Settings\n• Account info\n\nThis cannot be undone!\n\nAre you sure?')) {
      clearAllData()
      signOut()
      window.location.reload()
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <button className="back-btn" onClick={onClose}>
          <HiArrowLeft />
        </button>
        <h1>Profile</h1>
      </div>

      <div className="profile-content">
        {/* Avatar Section */}
        <div className="avatar-section">
          <div className="avatar-container" onClick={() => setShowAvatarPicker(!showAvatarPicker)}>
            <img 
              src={user.avatar || AVATAR_OPTIONS[0]} 
              alt="Profile" 
              className="profile-avatar-large"
            />
            <div className="avatar-overlay">
              <HiPencil />
            </div>
          </div>
          
          {showAvatarPicker && (
            <div className="avatar-picker">
              <p>Choose Avatar</p>
              <div className="avatar-grid">
                {AVATAR_OPTIONS.map((avatar, i) => (
                  <img
                    key={i}
                    src={avatar}
                    alt={`Avatar ${i + 1}`}
                    className={user.avatar === avatar ? 'selected' : ''}
                    onClick={() => {
                      updateAvatar(avatar)
                      setShowAvatarPicker(false)
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Name Section */}
        <div className="name-section">
          {isEditing ? (
            <div className="edit-name">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                autoFocus
              />
              <button onClick={handleSave}>Save</button>
            </div>
          ) : (
            <div className="display-name" onClick={() => setIsEditing(true)}>
              <h2>{user.displayName}</h2>
              <HiPencil className="edit-icon" />
            </div>
          )}
          <p className="username">@{user.username}</p>
        </div>

        {/* Stats Section */}
        <div className="profile-stats">
          <div className="profile-stat">
            <span className="stat-value">
              {JSON.parse(localStorage.getItem('recentlyPlayed') || '[]').length}
            </span>
            <span className="stat-label">Songs Played</span>
          </div>
          <div className="profile-stat">
            <span className="stat-value">
              {JSON.parse(localStorage.getItem('favorites') || '[]').length}
            </span>
            <span className="stat-label">Favorites</span>
          </div>
          <div className="profile-stat">
            <span className="stat-value">
              {Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24))}
            </span>
            <span className="stat-label">Days Active</span>
          </div>
        </div>

        {/* Info Section */}
        <div className="info-section">
          <h3>Account Info</h3>
          <div className="info-item">
            <span>Member Since</span>
            <span>{formatDate(user.createdAt)}</span>
          </div>
          <div className="info-item">
            <span>User ID</span>
            <span className="user-id">{user.id.slice(0, 8)}...</span>
          </div>
        </div>

        {/* Clear Data Button */}
        <button className="clear-data-btn" onClick={handleClearData}>
          <HiTrash />
          Clear All Data
        </button>

        {/* Sign Out Button */}
        <button className="signout-btn" onClick={handleSignOut}>
          <HiLogout />
          Sign Out
        </button>
      </div>
    </div>
  )
}

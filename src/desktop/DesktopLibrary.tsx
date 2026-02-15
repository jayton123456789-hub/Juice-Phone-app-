import { useState, useEffect } from 'react'
import { Heart, Clock, Disc, Play, Plus, TrendingUp, Music } from 'lucide-react'
import { Song } from '../types'
import './DesktopLibrary.css'

interface DesktopLibraryProps {
  onSongSelect: (song: Song) => void
}

export default function DesktopLibrary({ onSongSelect }: DesktopLibraryProps) {
  const [activeSection, setActiveSection] = useState<'favorites' | 'recent' | 'playlists'>('favorites')
  const [favorites, setFavorites] = useState<Song[]>([])
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadLibraryData()
  }, [])

  const loadLibraryData = async () => {
    setLoading(true)
    try {
      // Load from localStorage
      const savedFavs = localStorage.getItem('favorites')
      const savedRecent = localStorage.getItem('recentlyPlayed')
      
      if (savedFavs) {
        const favIds = JSON.parse(savedFavs)
        setFavorites(favIds)
      }
      
      if (savedRecent) {
        const recentSongs = JSON.parse(savedRecent)
        setRecentlyPlayed(recentSongs)
      }
    } catch (err) {
      console.error('[Library] Load error:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = (song: Song) => {
    const isFav = favorites.some(f => f.id === song.id)
    let newFavorites
    
    if (isFav) {
      newFavorites = favorites.filter(f => f.id !== song.id)
    } else {
      newFavorites = [song, ...favorites]
    }
    
    setFavorites(newFavorites)
    localStorage.setItem('favorites', JSON.stringify(newFavorites))
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="library-loading">
          <div className="loading-spinner" />
          <p>Loading your library...</p>
        </div>
      )
    }

    switch (activeSection) {
      case 'favorites':
        return (
          <div className="library-section">
            <div className="section-header">
              <div>
                <h2>Liked Songs</h2>
                <p>{favorites.length} songs</p>
              </div>
              {favorites.length > 0 && (
                <button className="play-all-btn" onClick={() => onSongSelect(favorites[0])}>
                  <Play size={20} fill="currentColor" />
                  <span>Play All</span>
                </button>
              )}
            </div>

            {favorites.length === 0 ? (
              <div className="library-empty">
                <Heart size={64} opacity={0.2} />
                <h3>No liked songs yet</h3>
                <p>Songs you like will appear here</p>
              </div>
            ) : (
              <div className="library-grid">
                {favorites.map((song, index) => (
                  <div
                    key={`${song.id}-${index}`}
                    className="library-card"
                    onClick={() => onSongSelect(song)}
                  >
                    <div className="library-card-cover">
                      {song.coverArt ? (
                        <img src={song.coverArt} alt={song.title} />
                      ) : (
                        <div className="library-card-placeholder">
                          <Disc size={36} opacity={0.5} />
                        </div>
                      )}
                      <div className="library-card-overlay">
                        <button className="library-card-play-btn">
                          <Play size={28} fill="currentColor" />
                        </button>
                      </div>
                    </div>

                    <div className="library-card-info">
                      <h4>{song.title}</h4>
                      <p>{song.artist}</p>
                    </div>

                    <button
                      className="library-card-heart active"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorite(song)
                      }}
                    >
                      <Heart size={18} fill="currentColor" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case 'recent':
        return (
          <div className="library-section">
            <div className="section-header">
              <div>
                <h2>Recently Played</h2>
                <p>{recentlyPlayed.length} songs</p>
              </div>
            </div>

            {recentlyPlayed.length === 0 ? (
              <div className="library-empty">
                <Clock size={64} opacity={0.2} />
                <h3>No recent plays</h3>
                <p>Your listening history will appear here</p>
              </div>
            ) : (
              <div className="library-list">
                {recentlyPlayed.map((song, index) => (
                  <div
                    key={`${song.id}-${index}`}
                    className="library-list-item"
                    onClick={() => onSongSelect(song)}
                  >
                    <div className="list-item-number">{index + 1}</div>

                    <div className="list-item-cover">
                      {song.coverArt ? (
                        <img src={song.coverArt} alt={song.title} />
                      ) : (
                        <div className="list-item-placeholder">
                          <Music size={20} />
                        </div>
                      )}
                    </div>

                    <div className="list-item-info">
                      <h4>{song.title}</h4>
                      <p>{song.artist}</p>
                    </div>

                    <div className="list-item-meta">
                      {song.era && <span>{song.era.name}</span>}
                    </div>

                    <button className="list-item-play-btn">
                      <Play size={18} fill="currentColor" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case 'playlists':
        return (
          <div className="library-section">
            <div className="section-header">
              <div>
                <h2>Playlists</h2>
                <p>Coming soon</p>
              </div>
              <button className="create-playlist-btn">
                <Plus size={20} />
                <span>New Playlist</span>
              </button>
            </div>

            <div className="library-empty">
              <Disc size={64} opacity={0.2} />
              <h3>Create your first playlist</h3>
              <p>Organize your favorite tracks</p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="desktop-library">
      {/* Library Navigation */}
      <div className="library-nav">
        <button
          className={`library-nav-btn ${activeSection === 'favorites' ? 'active' : ''}`}
          onClick={() => setActiveSection('favorites')}
        >
          <Heart size={20} />
          <span>Liked Songs</span>
          {favorites.length > 0 && <span className="nav-badge">{favorites.length}</span>}
        </button>

        <button
          className={`library-nav-btn ${activeSection === 'recent' ? 'active' : ''}`}
          onClick={() => setActiveSection('recent')}
        >
          <Clock size={20} />
          <span>Recently Played</span>
          {recentlyPlayed.length > 0 && <span className="nav-badge">{recentlyPlayed.length}</span>}
        </button>

        <button
          className={`library-nav-btn ${activeSection === 'playlists' ? 'active' : ''}`}
          onClick={() => setActiveSection('playlists')}
        >
          <TrendingUp size={20} />
          <span>Playlists</span>
        </button>
      </div>

      {/* Library Content */}
      <div className="library-content">
        {renderContent()}
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { HiHeart, HiClock, HiDownload, HiMusicNote } from 'react-icons/hi'
import { Song } from '../types'
import './Library.css'

interface LibraryProps {
  onSongSelect: (song: Song) => void
}

export default function Library({ onSongSelect }: LibraryProps) {
  const [favorites, setFavorites] = useState<Song[]>([])
  const [activeTab, setActiveTab] = useState<'favorites' | 'recent' | 'downloaded'>('favorites')

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = () => {
    const saved = localStorage.getItem('favorites')
    if (saved) {
      setFavorites(JSON.parse(saved))
    }
  }

  const toggleFavorite = (song: Song) => {
    const isFav = favorites.some(f => f.id === song.id)
    let updated
    if (isFav) {
      updated = favorites.filter(f => f.id !== song.id)
    } else {
      updated = [...favorites, song]
    }
    setFavorites(updated)
    localStorage.setItem('favorites', JSON.stringify(updated))
  }

  return (
    <div className="page library">
      <h1 className="library-title">Your Library</h1>

      <div className="library-tabs">
        <TabButton 
          active={activeTab === 'favorites'} 
          onClick={() => setActiveTab('favorites')}
          icon={<HiHeart />}
          label="Favorites"
        />
        <TabButton 
          active={activeTab === 'recent'} 
          onClick={() => setActiveTab('recent')}
          icon={<HiClock />}
          label="Recent"
        />
        <TabButton 
          active={activeTab === 'downloaded'} 
          onClick={() => setActiveTab('downloaded')}
          icon={<HiDownload />}
          label="Offline"
        />
      </div>

      <div className="library-content">
        {activeTab === 'favorites' && (
          <>
            {favorites.length > 0 ? (
              <div className="library-list">
                {favorites.map((song) => (
                  <div 
                    key={song.id} 
                    className="library-item"
                    onClick={() => onSongSelect(song)}
                  >
                    <div className="lib-cover">
                      {song.coverArt ? (
                        <img src={song.coverArt} alt={song.title} />
                      ) : (
                        <div className="lib-cover-placeholder">
                          <HiMusicNote />
                        </div>
                      )}
                    </div>
                    <div className="lib-info">
                      <h4>{song.title}</h4>
                      <p>{song.artist}</p>
                    </div>
                    <button 
                      className="lib-fav-btn active"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorite(song)
                      }}
                    >
                      <HiHeart />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState 
                icon={<HiHeart />}
                title="No favorites yet"
                subtitle="Songs you favorite will appear here"
              />
            )}
          </>
        )}

        {activeTab === 'recent' && (
          <RecentSongs onSongSelect={onSongSelect} />
        )}

        {activeTab === 'downloaded' && (
          <EmptyState 
            icon={<HiDownload />}
            title="No downloads"
            subtitle="Download songs to listen offline"
          />
        )}
      </div>

      {/* Stats */}
      <div className="library-stats">
        <StatCard 
          value={favorites.length} 
          label="Favorites" 
        />
        <StatCard 
          value={JSON.parse(localStorage.getItem('recentlyPlayed') || '[]').length} 
          label="Played" 
        />
        <StatCard 
          value="0" 
          label="Downloads" 
        />
      </div>
    </div>
  )
}

function TabButton({ active, onClick, icon, label }: { 
  active: boolean; 
  onClick: () => void; 
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button 
      className={`lib-tab ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}

function RecentSongs({ onSongSelect }: { onSongSelect: (song: Song) => void }) {
  const [recent, setRecent] = useState<Song[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('recentlyPlayed')
    if (saved) {
      setRecent(JSON.parse(saved))
    }
  }, [])

  if (recent.length === 0) {
    return (
      <EmptyState 
        icon={<HiClock />}
        title="No recent plays"
        subtitle="Songs you play will appear here"
      />
    )
  }

  return (
    <div className="library-list">
      {recent.map((song) => (
        <div 
          key={song.id} 
          className="library-item"
          onClick={() => onSongSelect(song)}
        >
          <div className="lib-cover">
            {song.coverArt ? (
              <img src={song.coverArt} alt={song.title} />
            ) : (
              <div className="lib-cover-placeholder">
                <HiMusicNote />
              </div>
            )}
          </div>
          <div className="lib-info">
            <h4>{song.title}</h4>
            <p>{song.artist}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ icon, title, subtitle }: { 
  icon: React.ReactNode; 
  title: string; 
  subtitle: string;
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{subtitle}</p>
    </div>
  )
}

function StatCard({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="stat-card">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  )
}

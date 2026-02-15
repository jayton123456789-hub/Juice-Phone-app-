import { useState, useEffect } from 'react'
import { HiPlay, HiFire, HiClock, HiChevronRight } from 'react-icons/hi'
import { juiceApi } from '../api/juiceApi'
import CoverImage from '../components/CoverImage'
import { Song, User } from '../types'
import './Home.css'

interface HomeProps {
  onSongSelect: (song: Song) => void
  onRadioPlay: () => void
  onProfileClick: () => void
  onSongsLoaded: (songs: Song[]) => void
  user: User | null
}

export default function Home({ onSongSelect, onRadioPlay, onProfileClick, onSongsLoaded, user }: HomeProps) {
  const [songs, setSongs] = useState<Song[]>([])
  const [displayedSongs, setDisplayedSongs] = useState<Song[]>([])
  const [showAllSongs, setShowAllSongs] = useState(false)
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    loadData()
    loadRecentlyPlayed()
    loadStats()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      // Get random page for variety on each launch
      const randomPage = Math.floor(Math.random() * 10) + 1
      const result = await juiceApi.getSongs(randomPage, 50, 'released')
      console.log('Loaded songs:', result.songs.length, 'Total:', result.count)
      
      // Shuffle the songs for variety
      const shuffled = [...result.songs].sort(() => Math.random() - 0.5)
      
      setSongs(shuffled)
      setDisplayedSongs(shuffled.slice(0, 15))
      onSongsLoaded(shuffled)
    } catch (err) {
      console.error('Failed to load songs:', err)
      const mock = getMockSongs()
      setSongs(mock)
      setDisplayedSongs(mock)
      onSongsLoaded(mock)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    const data = await juiceApi.getStats()
    if (data) setStats(data)
  }

  const loadRecentlyPlayed = () => {
    const saved = localStorage.getItem('recentlyPlayed')
    if (saved) {
      try {
        setRecentlyPlayed(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse recently played:', e)
      }
    }
  }

  const handleSeeAll = () => {
    setShowAllSongs(!showAllSongs)
    if (!showAllSongs) {
      setDisplayedSongs(songs)
    } else {
      setDisplayedSongs(songs.slice(0, 15))
    }
  }

  if (showAllSongs) {
    return (
      <div className="page home">
        <div className="section-header all-songs-header">
          <button className="back-btn" onClick={handleSeeAll}>
            ← Back
          </button>
          <h2>All Released Songs ({songs.length})</h2>
        </div>
        <div className="song-list all-songs">
          {songs.map((song, index) => (
            <div 
              key={song.id} 
              className="song-item"
              onClick={() => onSongSelect(song)}
            >
              <span className="song-number">{index + 1}</span>
              <CoverImage 
                src={song.coverArt}
                alt={song.title}
                size="small"
              />
              <div className="song-info">
                <h4>{song.title}</h4>
                <p>{song.artist} • {song.album}</p>
              </div>
              <button className="play-btn-round" onClick={(e) => {
                e.stopPropagation()
                onSongSelect(song)
              }}>
                <HiPlay />
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="page home">
      <div className="home-header">
        <div className="greeting">
          <h1>WRLD</h1>
          <p>{user?.displayName ? `Welcome back, ${user.displayName}` : "40,000+ songs await"}</p>
        </div>
        <div className="profile-avatar" onClick={onProfileClick}>
          <img 
            src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'juice'}`} 
            alt="Profile" 
          />
        </div>
      </div>

      {/* Stats Banner */}
      {stats && (
        <div className="stats-banner">
          <div className="stat-badge">
            <span className="stat-num">{(stats.total_songs / 1000).toFixed(1)}K</span>
            <span className="stat-text">Songs</span>
          </div>
          <div className="stat-badge">
            <span className="stat-num">{stats.category_stats?.released || 0}</span>
            <span className="stat-text">Released</span>
          </div>
        </div>
      )}

      <div className="quick-picks">
        <h2>Quick Picks</h2>
        <div className="quick-grid">
          <QuickCard 
            icon={<HiFire />} 
            title="Radio" 
            subtitle="Random songs"
            gradient="linear-gradient(135deg, #ff006e, #ff4d00)"
            onClick={onRadioPlay}
          />
          <QuickCard 
            icon={<HiClock />} 
            title="Recent" 
            subtitle="Keep listening"
            gradient="linear-gradient(135deg, #00f5ff, #0066ff)"
            onClick={() => {}}
          />
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h2>Released Songs</h2>
          <button className="see-all-btn" onClick={handleSeeAll}>
            {showAllSongs ? 'Show Less' : 'See All'}
            <HiChevronRight />
          </button>
        </div>
        
        {loading ? (
          <div className="loading">Loading songs...</div>
        ) : (
          <div className="song-list">
            {displayedSongs.map((song, index) => (
              <div 
                key={song.id} 
                className="song-item"
                onClick={() => onSongSelect(song)}
              >
                <span className="song-number">{index + 1}</span>
                <CoverImage 
                  src={song.coverArt}
                  alt={song.title}
                  size="small"
                />
                <div className="song-info">
                  <h4>{song.title}</h4>
                  <p>{song.artist} • {song.album}</p>
                </div>
                <button className="play-btn-round" onClick={(e) => {
                  e.stopPropagation()
                  onSongSelect(song)
                }}>
                  <HiPlay />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="section">
        <div className="section-header">
          <h2>Recently Played</h2>
        </div>
        <div className="recent-grid">
          {recentlyPlayed.length > 0 ? (
            recentlyPlayed.slice(0, 4).map((song) => (
              <div 
                key={song.id} 
                className="recent-item"
                onClick={() => onSongSelect(song)}
              >
                <CoverImage 
                  src={song.coverArt}
                  alt={song.title}
                  size="large"
                />
                <span className="recent-title">{song.title}</span>
              </div>
            ))
          ) : (
            <p className="empty-text">No songs played yet</p>
          )}
        </div>
      </div>
    </div>
  )
}

function QuickCard({ icon, title, subtitle, gradient, onClick }: { 
  icon: React.ReactNode; 
  title: string;
  subtitle: string;
  gradient: string;
  onClick: () => void
}) {
  return (
    <button className="quick-card" style={{ background: gradient }} onClick={onClick}>
      {icon}
      <div className="quick-card-text">
        <span className="quick-title">{title}</span>
        <span className="quick-subtitle">{subtitle}</span>
      </div>
    </button>
  )
}

// Mock songs fallback
function getMockSongs(): Song[] {
  return [
    { id: '1', title: 'Lucid Dreams', artist: 'Juice WRLD', album: 'Goodbye & Good Riddance', duration: 239, hasLyrics: true },
    { id: '2', title: 'All Girls Are The Same', artist: 'Juice WRLD', album: 'Goodbye & Good Riddance', duration: 166, hasLyrics: true },
    { id: '3', title: 'Legends', artist: 'Juice WRLD', album: 'WRLD ON DRUGS', duration: 192, hasLyrics: true },
    { id: '4', title: 'Robbery', artist: 'Juice WRLD', album: 'Death Race for Love', duration: 240, hasLyrics: true },
    { id: '5', title: 'Hear Me Calling', artist: 'Juice WRLD', album: 'Death Race for Love', duration: 195, hasLyrics: true },
    { id: '6', title: 'Bandit', artist: 'Juice WRLD ft. NBA YoungBoy', album: 'Single', duration: 189, hasLyrics: true },
    { id: '7', title: 'Wasted', artist: 'Juice WRLD ft. Lil Uzi Vert', album: 'Goodbye & Good Riddance', duration: 221, hasLyrics: true },
    { id: '8', title: 'Lean Wit Me', artist: 'Juice WRLD', album: 'Goodbye & Good Riddance', duration: 178, hasLyrics: true },
  ]
}

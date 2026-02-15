import { useState, useEffect } from 'react'
import { HiPlay, HiFire, HiClock, HiUser } from 'react-icons/hi'
import { juiceApi } from '../api/juiceApi'
import { Song, User } from '../types'
import './Home.css'

interface HomeProps {
  onSongSelect: (song: Song) => void
  onProfileClick: () => void
  onSongsLoaded: (songs: Song[]) => void
  user: User | null
}

export default function Home({ onSongSelect, onProfileClick, onSongsLoaded, user }: HomeProps) {
  const [songs, setSongs] = useState<Song[]>([])
  const [popularSongs, setPopularSongs] = useState<Song[]>([])
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
      // Load released songs
      const result = await juiceApi.getSongs(1, 20, 'released')
      console.log('Loaded songs:', result.songs.length, 'Total:', result.count)
      setSongs(result.songs)
      onSongsLoaded(result.songs)
      
      // Load some popular/unreleased too
      const popular = await juiceApi.getSongs(1, 10)
      setPopularSongs(popular.songs.slice(0, 10))
    } catch (err) {
      console.error('Failed to load songs:', err)
      const mock = getMockSongs()
      setSongs(mock)
      setPopularSongs(mock)
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

  return (
    <div className="page home">
      <div className="home-header">
        <div className="greeting">
          <h1>Good Evening</h1>
          <p>{user?.displayName ? `Welcome back, ${user.displayName}` : "Let's vibe to some Juice"}</p>
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
            onClick={() => loadRadio()}
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
          <button className="see-all" onClick={() => {}}>See all</button>
        </div>
        
        {loading ? (
          <div className="loading">Loading songs...</div>
        ) : (
          <div className="song-list">
            {songs.slice(0, 15).map((song, index) => (
              <div 
                key={song.id} 
                className="song-item"
                onClick={() => onSongSelect(song)}
              >
                <span className="song-number">{index + 1}</span>
                <div className="song-cover-small">
                  {song.coverArt ? (
                    <img src={song.coverArt} alt={song.title} />
                  ) : (
                    <div className="cover-placeholder">🎵</div>
                  )}
                </div>
                <div className="song-info">
                  <h4>{song.title}</h4>
                  <p>{song.artist} • {song.album}</p>
                </div>
                <button className="play-btn" onClick={(e) => {
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
                <div className="recent-cover">
                  {song.coverArt ? (
                    <img src={song.coverArt} alt={song.title} />
                  ) : (
                    <div className="cover-placeholder">🎵</div>
                  )}
                </div>
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

  async function loadRadio() {
    const song = await juiceApi.getRadioSong()
    if (song) {
      onSongSelect(song)
    }
  }
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
  ]
}

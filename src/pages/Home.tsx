import { useState, useEffect } from 'react'
import { HiPlay, HiFire, HiClock } from 'react-icons/hi'
import { juiceApi } from '../api/juiceApi'
import { Song } from '../types'
import './Home.css'

// Mock songs for when API fails
const getMockSongs = (): Song[] => [
  { id: '1', title: 'Lucid Dreams', artist: 'Juice WRLD', album: 'Goodbye & Good Riddance', coverArt: 'https://i.scdn.co/image/ab67616d0000b273f7db7f8c8a92ffc9c3f2c422' },
  { id: '2', title: 'All Girls Are The Same', artist: 'Juice WRLD', album: 'Goodbye & Good Riddance', coverArt: 'https://i.scdn.co/image/ab67616d0000b273f7db7f8c8a92ffc9c3f2c422' },
  { id: '3', title: 'Legends', artist: 'Juice WRLD', album: 'WRLD ON DRUGS', coverArt: 'https://i.scdn.co/image/ab67616d0000b27333c6b920eabcf4b5e9514e66' },
  { id: '4', title: 'Robbery', artist: 'Juice WRLD', album: 'Death Race for Love', coverArt: 'https://i.scdn.co/image/ab67616d0000b273b333e7f932f317c981ac37b7' },
  { id: '5', title: 'Hear Me Calling', artist: 'Juice WRLD', album: 'Death Race for Love', coverArt: 'https://i.scdn.co/image/ab67616d0000b273b333e7f932f317c981ac37b7' },
  { id: '6', title: 'Bandit', artist: 'Juice WRLD ft. NBA YoungBoy', album: 'Single', coverArt: 'https://i.scdn.co/image/ab67616d0000b273fe0f6850f5d5c5c0b5c5c5c5' },
  { id: '7', title: 'Wasted', artist: 'Juice WRLD ft. Lil Uzi Vert', album: 'Goodbye & Good Riddance', coverArt: 'https://i.scdn.co/image/ab67616d0000b273f7db7f8c8a92ffc9c3f2c422' },
  { id: '8', title: 'Lean Wit Me', artist: 'Juice WRLD', album: 'Goodbye & Good Riddance', coverArt: 'https://i.scdn.co/image/ab67616d0000b273f7db7f8c8a92ffc9c3f2c422' },
]

interface HomeProps {
  onSongSelect: (song: Song) => void
}

export default function Home({ onSongSelect }: HomeProps) {
  const [songs, setSongs] = useState<Song[]>([])
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSongs()
    loadRecentlyPlayed()
  }, [])

  const loadSongs = async () => {
    try {
      setLoading(true)
      const data = await juiceApi.getSongs(10)
      console.log('Loaded songs:', data)
      setSongs(data || [])
    } catch (err) {
      console.error('Failed to load songs:', err)
      setSongs(getMockSongs())
    } finally {
      setLoading(false)
    }
  }

  const loadRecentlyPlayed = () => {
    const saved = localStorage.getItem('recentlyPlayed')
    if (saved) {
      setRecentlyPlayed(JSON.parse(saved))
    }
  }

  return (
    <div className="page home">
      <div className="home-header">
        <div className="greeting">
          <h1>Good Evening</h1>
          <p>Let's vibe to some Juice</p>
        </div>
        <div className="profile-avatar">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=juice" alt="Profile" />
        </div>
      </div>

      <div className="quick-picks">
        <h2>Quick Picks</h2>
        <div className="quick-grid">
          <QuickCard 
            icon={<HiFire />} 
            title="Trending" 
            gradient="linear-gradient(135deg, #ff006e, #ff4d00)"
            onClick={() => {}}
          />
          <QuickCard 
            icon={<HiClock />} 
            title="Recent" 
            gradient="linear-gradient(135deg, #00f5ff, #0066ff)"
            onClick={() => {}}
          />
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h2>Popular Songs</h2>
          <button className="see-all">See all</button>
        </div>
        
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="song-list">
            {songs.map((song, index) => (
              <div 
                key={song.id} 
                className="song-item"
                onClick={() => onSongSelect(song)}
              >
                <span className="song-number">{index + 1}</span>
                <div className="song-info">
                  <h4>{song.title}</h4>
                  <p>{song.artist} • {song.album}</p>
                </div>
                <button className="play-btn">
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
}

function QuickCard({ icon, title, gradient, onClick }: { 
  icon: React.ReactNode; 
  title: string; 
  gradient: string;
  onClick: () => void
}) {
  return (
    <button className="quick-card" style={{ background: gradient }} onClick={onClick}>
      {icon}
      <span>{title}</span>
    </button>
  )
}

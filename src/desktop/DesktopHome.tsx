import { useState, useEffect } from 'react'
import { HiPlay, HiClock, HiHeart, HiTrendingUp, HiSparkles, HiCollection, HiMusicNote } from 'react-icons/hi'
import { juiceApi } from '../api/juiceApi'
import { Song, User } from '../types'
import './DesktopHome.css'

interface DesktopHomeProps {
  onSongSelect: (song: Song) => void
  onRadioPlay: () => void
  onSongsLoaded: (songs: Song[]) => void
  user: User | null
}

interface Playlist {
  id: string
  name: string
  description: string
  songs: Song[]
  gradient: string
  icon: React.ReactNode
}

export default function DesktopHome({ onSongSelect, onRadioPlay, onSongsLoaded, user }: DesktopHomeProps) {
  const [greeting, setGreeting] = useState('Good evening')
  const [recent, setRecent] = useState<Song[]>([])
  const [favorites, setFavorites] = useState<Song[]>([])
  const [trending, setTrending] = useState<Song[]>([])
  const [discover, setDiscover] = useState<Song[]>([])
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')
    
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    
    // Load user data
    const savedRecent = localStorage.getItem('recentlyPlayed')
    const savedFavorites = localStorage.getItem('favorites')
    const recentSongs = savedRecent ? JSON.parse(savedRecent).slice(0, 8) : []
    const favSongs = savedFavorites ? JSON.parse(savedFavorites).slice(0, 8) : []
    
    setRecent(recentSongs)
    setFavorites(favSongs)
    
    // Load songs from API
    const [trendingRes, discoverRes] = await Promise.all([
      juiceApi.getSongs(1, 20, 'released'),
      juiceApi.getSongs(Math.floor(Math.random() * 5) + 1, 20)
    ])
    
    setTrending(trendingRes.songs)
    setDiscover(discoverRes.songs)
    
    // Auto-create playlists based on loaded data
    const autoPlaylists: Playlist[] = [
      {
        id: 'recent',
        name: 'Recently Played',
        description: 'Your recent listens',
        songs: recentSongs.slice(0, 6),
        gradient: 'linear-gradient(135deg, #1db954, #1ed760)',
        icon: <HiClock />
      },
      {
        id: 'favorites',
        name: 'Your Favorites',
        description: 'Songs you love',
        songs: favSongs.slice(0, 6),
        gradient: 'linear-gradient(135deg, #ff006e, #ff4d6d)',
        icon: <HiHeart />
      },
      {
        id: 'trending',
        name: 'Trending Now',
        description: 'Popular this week',
        songs: trendingRes.songs.slice(0, 6),
        gradient: 'linear-gradient(135deg, #8338ec, #3a86ff)',
        icon: <HiTrendingUp />
      },
      {
        id: 'discover',
        name: 'Discover Weekly',
        description: 'New music for you',
        songs: discoverRes.songs.slice(0, 6),
        gradient: 'linear-gradient(135deg, #ffbe0b, #fb5607)',
        icon: <HiSparkles />
      }
    ].filter(p => p.songs.length > 0 || p.id === 'trending' || p.id === 'discover')
    
    setPlaylists(autoPlaylists)
    onSongsLoaded([...trendingRes.songs, ...discoverRes.songs])
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="desktop-home loading">
        <div className="loading-spinner"></div>
        <p>Loading your music...</p>
      </div>
    )
  }

  return (
    <div className="desktop-home">
      {/* Hero Section */}
      <section className="hero-section">
        <h1>{greeting}{user ? `, ${user.displayName}` : ''}</h1>
        
        <div className="quick-grid">
          <button className="quick-card-large radio-card" onClick={onRadioPlay}>
            <div className="quick-icon" style={{ background: 'linear-gradient(135deg, #ff006e, #ff4d6d)' }}>
              <HiPlay />
            </div>
            <div className="quick-info">
              <span>Start Radio</span>
              <small>Infinite Juice WRLD mix</small>
            </div>
          </button>
          
          {recent[0] && (
            <button className="quick-card-large" onClick={() => onSongSelect(recent[0])}>
              <img 
                src={recent[0].coverArt || `https://api.dicebear.com/7.x/initials/svg?seed=${recent[0].title}`} 
                alt="Recent"
                className="quick-card-img"
              />
              <div className="quick-info">
                <span>Continue Listening</span>
                <small>{recent[0].title}</small>
              </div>
            </button>
          )}
          
          {favorites[0] && (
            <button className="quick-card-large" onClick={() => onSongSelect(favorites[0])}>
              <div className="quick-icon" style={{ background: 'linear-gradient(135deg, #1db954, #1ed760)' }}>
                <HiHeart />
              </div>
              <div className="quick-info">
                <span>Your Favorites</span>
                <small>{favorites.length} songs</small>
              </div>
            </button>
          )}
          
          <button className="quick-card-large" onClick={() => onSongSelect(trending[0] || discover[0])}>
            <div className="quick-icon" style={{ background: 'linear-gradient(135deg, #8338ec, #3a86ff)' }}>
              <HiCollection />
            </div>
            <div className="quick-info">
              <span>Top Hits</span>
              <small>Best of Juice WRLD</small>
            </div>
          </button>
        </div>
      </section>

      {/* Auto-Generated Playlists */}
      {playlists.map((playlist, index) => (
        <section key={playlist.id} className="home-section" style={{ animationDelay: `${index * 0.1}s` }}>
          <div className="section-header">
            <h2>{playlist.name}</h2>
            <span className="section-icon" style={{ background: playlist.gradient }}>{playlist.icon}</span>
          </div>
          <p className="section-desc">{playlist.description}</p>
          
          <div className="song-row">
            {playlist.songs.length > 0 ? (
              playlist.songs.map((song, i) => (
                <SongCard 
                  key={`${playlist.id}-${song.id}-${i}`} 
                  song={song} 
                  onClick={() => onSongSelect(song)} 
                  index={i}
                />
              ))
            ) : (
              <div className="empty-playlist" onClick={onRadioPlay}>
                <div className="empty-art" style={{ background: playlist.gradient }}>
                  {playlist.icon}
                </div>
                <h4>Start Listening</h4>
                <p>Tap to play radio</p>
              </div>
            )}
          </div>
        </section>
      ))}

      {/* Made For You Section */}
      <section className="home-section made-for-you">
        <div className="section-header">
          <h2>Made For You</h2>
          <span className="section-icon"><HiMusicNote /></span>
        </div>
        <div className="made-for-you-grid">
          {[
            { name: 'Daily Mix 1', desc: 'Released - Juice WRLD', color: '#ff006e' },
            { name: 'Daily Mix 2', desc: 'Unreleased - Juice WRLD', color: '#8338ec' },
            { name: 'Discover', desc: 'New songs you might like', color: '#3a86ff' },
          ].map((mix, i) => (
            <div 
              key={i} 
              className="mix-card-large"
              style={{ background: `linear-gradient(135deg, ${mix.color}40, ${mix.color}20)` }}
              onClick={() => onRadioPlay()}
            >
              <h3>{mix.name}</h3>
              <p>{mix.desc}</p>
              <button className="play-mix-btn">
                <HiPlay />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function SongCard({ song, onClick, index }: { song: Song; onClick: () => void; index: number }) {
  // Ensure coverArt has a fallback
  const coverUrl = song.coverArt || `https://api.dicebear.com/7.x/initials/svg?seed=${song.title}&backgroundColor=ff006e`
  
  return (
    <div className="song-card" onClick={onClick} style={{ animationDelay: `${index * 0.05}s` }}>
      <div className="song-card-art">
        <img 
          src={coverUrl} 
          alt={song.title}
          className="song-cover-img"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${song.title}&backgroundColor=ff006e`
          }}
        />
        <button className="song-card-play">
          <HiPlay />
        </button>
      </div>
      <h4>{song.title}</h4>
      <p>{song.artist}</p>
    </div>
  )
}

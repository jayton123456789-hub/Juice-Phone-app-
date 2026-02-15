import { useState, useEffect } from 'react'
import { HiPlay, HiClock, HiHeart, HiTrendingUp, HiSparkles, HiCog } from 'react-icons/hi'
import { juiceApi } from '../api/juiceApi'
import CoverImage from '../components/CoverImage'
import { Song, User } from '../types'
import './Home.css'

interface HomeProps {
  onSongSelect: (song: Song) => void
  onRadioPlay: () => void
  onProfileClick: () => void
  onSettingsClick?: () => void
  onSongsLoaded: (songs: Song[]) => void
  user: User | null
}

// Mix types for home sections
type MixType = 'recent' | 'favorite' | 'trending' | 'discover' | 'era'

interface Mix {
  id: string
  title: string
  subtitle: string
  songs: Song[]
  type: MixType
  gradient: string
  icon: React.ReactNode
}

export default function Home({ onSongSelect, onRadioPlay, onProfileClick, onSettingsClick: _onSettingsClick, onSongsLoaded, user }: HomeProps) {
  const [mixes, setMixes] = useState<Mix[]>([])
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([])
  const [favorites, setFavorites] = useState<Song[]>([])
  const [, setLoading] = useState(true)
  const [greeting, setGreeting] = useState('Good evening')

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')
    
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load user data
      const savedRecent = localStorage.getItem('recentlyPlayed')
      const savedFavorites = localStorage.getItem('favorites')
      const recent = savedRecent ? JSON.parse(savedRecent) : []
      const favs = savedFavorites ? JSON.parse(savedFavorites) : []
      
      setRecentlyPlayed(recent.slice(0, 8))
      setFavorites(favs.slice(0, 8))
      
      // Load different song batches for mixes
      const [recentSongs, trendingSongs, allSongs] = await Promise.all([
        juiceApi.getSongs(1, 20, 'released'),
        juiceApi.getSongs(2, 20, 'released'),
        juiceApi.getSongs(Math.floor(Math.random() * 5) + 3, 30)
      ])
      
      const generatedMixes: Mix[] = [
        {
          id: 'recent-mix',
          title: 'Recently Played',
          subtitle: 'Pick up where you left off',
          songs: recent.slice(0, 6),
          type: 'recent',
          gradient: 'linear-gradient(135deg, #1db954, #1ed760)',
          icon: <HiClock />
        },
        {
          id: 'favorites-mix',
          title: 'Your Favorites',
          subtitle: 'Songs you love',
          songs: favs.slice(0, 6),
          type: 'favorite',
          gradient: 'linear-gradient(135deg, #ff006e, #ff4d6d)',
          icon: <HiHeart />
        },
        {
          id: 'trending-mix',
          title: 'Trending Now',
          subtitle: 'Popular this week',
          songs: trendingSongs.songs.slice(0, 6),
          type: 'trending',
          gradient: 'linear-gradient(135deg, #8338ec, #3a86ff)',
          icon: <HiTrendingUp />
        },
        {
          id: 'discover-mix',
          title: 'Discover Weekly',
          subtitle: 'New music for you',
          songs: allSongs.songs.slice(0, 6),
          type: 'discover',
          gradient: 'linear-gradient(135deg, #ffbe0b, #fb5607)',
          icon: <HiSparkles />
        }
      ]
      
      setMixes(generatedMixes)
      onSongsLoaded([...recentSongs.songs, ...trendingSongs.songs, ...allSongs.songs])
    } catch (err) {
      console.error('Failed to load home data:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page home-spotify">
      {/* Header */}
      <div className="home-header-spotify">
        <div className="greeting-spotify">
          <h1>{greeting}</h1>
        </div>
        <div className="header-actions">
          <button className="settings-btn-header" onClick={_onSettingsClick}>
            <HiCog />
          </button>
          <div className="profile-avatar-spotify" onClick={onProfileClick}>
            <img 
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'juice'}`} 
              alt="Profile" 
            />
          </div>
        </div>
      </div>

      {/* Quick Actions Row */}
      <div className="quick-actions-spotify">
        <button className="quick-action-btn" onClick={onRadioPlay}>
          <div className="quick-action-icon radio">
            <HiPlay />
          </div>
          <span>Radio</span>
        </button>
        
        {recentlyPlayed.length > 0 && (
          <button className="quick-action-btn" onClick={() => onSongSelect(recentlyPlayed[0])}>
            <CoverImage src={recentlyPlayed[0].coverArt} alt="Recent" size="small" />
            <span>Recent</span>
          </button>
        )}
        
        {favorites.length > 0 && (
          <button className="quick-action-btn" onClick={() => onSongSelect(favorites[0])}>
            <div className="quick-action-icon favorite">
              <HiHeart />
            </div>
            <span>Favorites</span>
          </button>
        )}
      </div>

      {/* Mixes Sections */}
      <div className="mixes-container">
        {mixes.map((mix) => (
          <section key={mix.id} className="mix-section">
            <div className="mix-header">
              <h2>{mix.title}</h2>
              <p>{mix.subtitle}</p>
            </div>
            
            <div className="mix-grid">
              {mix.songs.length > 0 ? (
                mix.songs.map((song) => (
                  <div 
                    key={song.id} 
                    className="mix-card"
                    onClick={() => onSongSelect(song)}
                  >
                    <div className="mix-card-art">
                      <CoverImage src={song.coverArt} alt={song.title} size="large" />
                      <button className="mix-card-play">
                        <HiPlay />
                      </button>
                    </div>
                    <h4>{song.title}</h4>
                    <p>{song.artist}</p>
                  </div>
                ))
              ) : (
                <div className="mix-card empty" onClick={() => mix.type === 'recent' || mix.type === 'favorite' ? onRadioPlay() : null}>
                  <div className="mix-card-art empty-art" style={{ background: mix.gradient }}>
                    {mix.icon}
                  </div>
                  <h4>{mix.type === 'recent' ? 'Start Listening' : mix.type === 'favorite' ? 'Add Favorites' : mix.title}</h4>
                  <p>{mix.type === 'recent' || mix.type === 'favorite' ? 'Tap to play radio' : 'Loading...'}</p>
                </div>
              )}
            </div>
          </section>
        ))}
      </div>

      {/* Jump Back In Section */}
      {recentlyPlayed.length > 0 && (
        <section className="jump-back-section">
          <div className="mix-header">
            <h2>Jump Back In</h2>
          </div>
          <div className="jump-back-list">
            {recentlyPlayed.slice(0, 4).map((song) => (
              <div 
                key={song.id}
                className="jump-back-item"
                onClick={() => onSongSelect(song)}
              >
                <CoverImage src={song.coverArt} alt={song.title} size="small" />
                <span>{song.title}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer Spacer */}
      <div className="home-footer-spacer"></div>
    </div>
  )
}

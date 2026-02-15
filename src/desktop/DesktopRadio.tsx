import { useState, useEffect } from 'react'
import { Play, Radio as RadioIcon, Shuffle, RefreshCw, Disc, Zap } from 'lucide-react'
import { juiceApi } from '../api/juiceApi'
import { Song } from '../types'
import './DesktopRadio.css'

interface DesktopRadioProps {
  currentSong: Song | null
  isPlaying: boolean
  onSongSelect: (song: Song, customQueue?: Song[]) => void
}

export default function DesktopRadio({ currentSong, isPlaying, onSongSelect }: DesktopRadioProps) {
  const [radioQueue, setRadioQueue] = useState<Song[]>([])
  const [loading, setLoading] = useState(false)
  const [stationMode, setStationMode] = useState<'random' | 'released' | 'unreleased'>('random')

  useEffect(() => {
    loadRadioQueue()
  }, [stationMode])

  const loadRadioQueue = async () => {
    setLoading(true)
    try {
      console.log('[Radio] Loading queue for station:', stationMode)
      
      let songs: Song[] = []
      
      if (stationMode === 'random') {
        // Get random radio songs
        songs = await juiceApi.getRadioSongs(12)
      } else {
        // Get songs by category
        const { songs: categorySongs } = await juiceApi.getSongs(
          Math.floor(Math.random() * 10) + 1,
          12,
          stationMode
        )
        songs = categorySongs
      }
      
      console.log('[Radio] Loaded', songs.length, 'songs')
      setRadioQueue(Array.isArray(songs) ? songs : [])
    } catch (err) {
      console.error('[Radio] Error:', err)
      setRadioQueue([])
    } finally {
      setLoading(false)
    }
  }

  const playFromRadio = (song: Song) => {
    // Play this song and queue the rest from radio
    console.log('[Radio] Playing from radio with queue of', radioQueue.length, 'songs')
    onSongSelect(song, radioQueue)
  }

  const refreshStation = () => {
    loadRadioQueue()
  }

  return (
    <div className="desktop-radio">
      {/* Radio Header */}
      <div className="radio-header">
        <div className="radio-hero">
          <div className="radio-hero-icon">
            <RadioIcon size={48} />
          </div>
          <div className="radio-hero-content">
            <h1>Juice WRLD Radio</h1>
            <p>Infinite music, endless vibes. Discover tracks you've never heard.</p>
          </div>
        </div>

        {/* Station Selector */}
        <div className="radio-stations">
          <button
            className={`station-btn ${stationMode === 'random' ? 'active' : ''}`}
            onClick={() => setStationMode('random')}
          >
            <Shuffle size={20} />
            <div className="station-info">
              <span className="station-name">Random Mix</span>
              <span className="station-desc">Pure chaos, pure fire</span>
            </div>
          </button>
          
          <button
            className={`station-btn ${stationMode === 'released' ? 'active' : ''}`}
            onClick={() => setStationMode('released')}
          >
            <Disc size={20} />
            <div className="station-info">
              <span className="station-name">Official Releases</span>
              <span className="station-desc">The classics</span>
            </div>
          </button>
          
          <button
            className={`station-btn ${stationMode === 'unreleased' ? 'active' : ''}`}
            onClick={() => setStationMode('unreleased')}
          >
            <Zap size={20} />
            <div className="station-info">
              <span className="station-name">Unreleased</span>
              <span className="station-desc">Hidden gems</span>
            </div>
          </button>
        </div>

        <button className="refresh-btn" onClick={refreshStation} disabled={loading}>
          <RefreshCw size={20} className={loading ? 'spinning' : ''} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Now Playing Banner */}
      {currentSong && isPlaying && (
        <div className="radio-now-playing">
          <div className="now-playing-pulse">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div className="now-playing-info">
            <span className="now-playing-label">NOW PLAYING</span>
            <span className="now-playing-title">{currentSong.title}</span>
          </div>
        </div>
      )}

      {/* Radio Queue */}
      <div className="radio-queue-section">
        <div className="radio-queue-header">
          <h2>Up Next</h2>
          <span className="queue-count">{radioQueue.length} songs</span>
        </div>

        {loading ? (
          <div className="radio-loading">
            <div className="loading-spinner" />
            <p>Loading station...</p>
          </div>
        ) : radioQueue.length === 0 ? (
          <div className="radio-empty">
            <RadioIcon size={48} opacity={0.3} />
            <p>No songs in queue</p>
            <button onClick={refreshStation}>Load Station</button>
          </div>
        ) : (
          <div className="radio-queue-grid">
            {radioQueue.map((song, index) => (
              <div
                key={`${song.id}-${index}`}
                className="radio-queue-card"
                onClick={() => playFromRadio(song)}
              >
                <div className="queue-card-number">{index + 1}</div>
                
                <div className="queue-card-cover">
                  {song.coverArt ? (
                    <img src={song.coverArt} alt={song.title} />
                  ) : (
                    <div className="queue-card-placeholder">
                      <Disc size={32} opacity={0.5} />
                    </div>
                  )}
                  <div className="queue-card-overlay">
                    <button className="queue-card-play-btn">
                      <Play size={24} fill="currentColor" />
                    </button>
                  </div>
                </div>

                <div className="queue-card-info">
                  <h4>{song.title}</h4>
                  <p>{song.artist}</p>
                  
                  <div className="queue-card-meta">
                    {song.era && (
                      <span className="queue-tag">{song.era.name}</span>
                    )}
                    {song.category && (
                      <span className={`queue-tag ${song.category}`}>
                        {song.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

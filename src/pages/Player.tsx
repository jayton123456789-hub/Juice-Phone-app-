import { useState, useRef, useEffect } from 'react'
import { 
  HiChevronDown, HiPlay, HiPause, HiHeart, 
  HiShuffle, HiRepeat, HiVolumeUp, HiQueueList 
} from 'react-icons/hi2'
import { Song } from '../types'
import './Player.css'

interface PlayerProps {
  song: Song
  isPlaying: boolean
  setIsPlaying: (playing: boolean) => void
  onClose: () => void
}

export default function Player({ song, isPlaying, setIsPlaying, onClose }: PlayerProps) {
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(237) // Mock duration in seconds
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(80)
  const [isShuffle, setIsShuffle] = useState(false)
  const [isRepeat, setIsRepeat] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showLyrics, setShowLyrics] = useState(false)
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  // Save to recently played
  useEffect(() => {
    const recent = JSON.parse(localStorage.getItem('recentlyPlayed') || '[]')
    const updated = [song, ...recent.filter((s: Song) => s.id !== song.id)].slice(0, 20)
    localStorage.setItem('recentlyPlayed', JSON.stringify(updated))

    // Check if favorite
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
    setIsFavorite(favorites.some((f: Song) => f.id === song.id))
  }, [song])

  // Playback timer
  useEffect(() => {
    if (isPlaying) {
      progressInterval.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setIsPlaying(false)
            return 0
          }
          setProgress((prev + 1) / duration * 100)
          return prev + 1
        })
      }, 1000)
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
    }
  }, [isPlaying, duration, setIsPlaying])

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
    if (isFavorite) {
      localStorage.setItem('favorites', JSON.stringify(favorites.filter((f: Song) => f.id !== song.id)))
    } else {
      localStorage.setItem('favorites', JSON.stringify([...favorites, song]))
    }
    setIsFavorite(!isFavorite)
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    const newTime = percentage * duration
    setCurrentTime(newTime)
    setProgress(percentage * 100)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="player-page">
      {/* Background blur */}
      <div className="player-bg">
        <div className="blur-circle circle-1"></div>
        <div className="blur-circle circle-2"></div>
        <div className="blur-circle circle-3"></div>
      </div>

      {/* Header */}
      <div className="player-header">
        <button className="header-btn" onClick={onClose}>
          <HiChevronDown />
        </button>
        <span className="now-playing">Now Playing</span>
        <button className="header-btn">
          <HiQueueList />
        </button>
      </div>

      {/* Album Art */}
      <div className={`album-art-container ${isPlaying ? 'playing' : ''}`}>
        <div className="album-art">
          {song.coverArt ? (
            <img src={song.coverArt} alt={song.title} />
          ) : (
            <div className="album-placeholder">
              <div className="vinyl">
                <div className="vinyl-label">
                  <span>🎵</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Song Info */}
      <div className="song-details">
        <div className="song-title-row">
          <div className="song-text">
            <h2>{song.title}</h2>
            <p>{song.artist}</p>
          </div>
          <button 
            className={`favorite-btn ${isFavorite ? 'active' : ''}`}
            onClick={toggleFavorite}
          >
            <HiHeart />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <div className="progress-bar" onClick={handleProgressClick}>
          <div className="progress-bg"></div>
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          <div className="progress-handle" style={{ left: `${progress}%` }}></div>
        </div>
        <div className="time-display">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="player-controls">
        <button 
          className={`control-btn secondary ${isShuffle ? 'active' : ''}`}
          onClick={() => setIsShuffle(!isShuffle)}
        >
          <HiShuffle />
        </button>

        <button className="control-btn">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
          </svg>
        </button>

        <button className="control-btn play-btn" onClick={togglePlay}>
          {isPlaying ? <HiPause /> : <HiPlay />}
        </button>

        <button className="control-btn">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
          </svg>
        </button>

        <button 
          className={`control-btn secondary ${isRepeat ? 'active' : ''}`}
          onClick={() => setIsRepeat(!isRepeat)}
        >
          <HiRepeat />
        </button>
      </div>

      {/* Volume & Lyrics Toggle */}
      <div className="extra-controls">
        <div className="volume-control">
          <HiVolumeUp />
          <div className="volume-slider">
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
            />
          </div>
        </div>
        <button 
          className={`lyrics-toggle ${showLyrics ? 'active' : ''}`}
          onClick={() => setShowLyrics(!showLyrics)}
        >
          Lyrics
        </button>
      </div>

      {/* Lyrics Panel */}
      {showLyrics && (
        <div className="lyrics-panel">
          <div className="lyrics-content">
            <p className="lyric-line past">I still see your shadows in my room</p>
            <p className="lyric-line past">Can't take back the love that I gave you</p>
            <p className="lyric-line active">It's to the point where I love and I hate you</p>
            <p className="lyric-line">And I cannot change you, so I must replace you</p>
            <p className="lyric-line">Easier said than done</p>
            <p className="lyric-line">I thought you were the one</p>
          </div>
        </div>
      )}
    </div>
  )
}

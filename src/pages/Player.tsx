import { useState, useEffect } from 'react'
import { 
  HiChevronDown, HiPlay, HiPause, HiHeart,
  HiQueueList
} from 'react-icons/hi2'
import { FiVolume2, FiVolumeX } from 'react-icons/fi'
import { FiShuffle, FiRepeat, FiSkipBack, FiSkipForward } from 'react-icons/fi'
import CoverImage from '../components/CoverImage'
import { Song } from '../types'
import './Player.css'

interface PlayerProps {
  song: Song
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  queueLength: number
  hasNext: boolean
  hasPrevious: boolean
  onTogglePlay: () => void
  onNext: () => void
  onPrevious: () => void
  onSeek: (time: number) => void
  onVolumeChange: (volume: number) => void
  onClose: () => void
  onOpenQueue: () => void
}

export default function Player({
  song,
  isPlaying,
  currentTime,
  duration,
  volume,
  queueLength,
  hasNext,
  hasPrevious,
  onTogglePlay,
  onNext,
  onPrevious,
  onSeek,
  onVolumeChange,
  onClose,
  onOpenQueue
}: PlayerProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [showLyrics, setShowLyrics] = useState(false)
  const [isShuffle, setIsShuffle] = useState(false)
  const [isRepeat, setIsRepeat] = useState(false)
  const [showVolume, setShowVolume] = useState(false)

  // Check if favorite
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
    setIsFavorite(favorites.some((f: Song) => f.id === song.id))
  }, [song])

  // Save to recently played
  useEffect(() => {
    const recent = JSON.parse(localStorage.getItem('recentlyPlayed') || '[]')
    const updated = [song, ...recent.filter((s: Song) => s.id !== song.id)].slice(0, 20)
    localStorage.setItem('recentlyPlayed', JSON.stringify(updated))
  }, [song])

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
    const percentage = Math.max(0, Math.min(1, x / rect.width))
    const newTime = percentage * (duration || 1)
    onSeek(newTime)
  }

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = duration ? (currentTime / duration) * 100 : 0
  const hasAudio = !!song.audioUrl
  const hasLyrics = song.hasLyrics && song.lyrics

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
        <button className="header-btn" onClick={onOpenQueue}>
          <HiQueueList />
          {queueLength > 0 && <span className="queue-badge">{queueLength}</span>}
        </button>
      </div>

      {/* Album Art */}
      <div className={`album-art-container ${isPlaying && hasAudio ? 'playing' : ''}`}>
        <CoverImage 
          src={song.coverArt}
          alt={song.title}
          size="xlarge"
          className="player-album-art"
        />
        {!hasAudio && (
          <div className="no-audio-badge">No Audio Available</div>
        )}
      </div>

      {/* Song Info */}
      <div className="song-details">
        <div className="song-title-row">
          <div className="song-text">
            <h2>{song.title}</h2>
            <p>{song.artist} {song.album && `• ${song.album}`}</p>
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
          <span>{formatTime(duration || song.duration || 0)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="player-controls">
        <button 
          className={`control-btn secondary ${isShuffle ? 'active' : ''}`}
          onClick={() => setIsShuffle(!isShuffle)}
          title="Shuffle"
        >
          <FiShuffle />
        </button>

        <button 
          className={`control-btn ${!hasPrevious ? 'disabled' : ''}`}
          onClick={onPrevious}
          disabled={!hasPrevious}
          title="Previous"
        >
          <FiSkipBack />
        </button>

        <button 
          className={`control-btn play-btn ${!hasAudio ? 'disabled' : ''}`} 
          onClick={onTogglePlay}
          disabled={!hasAudio}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <HiPause /> : <HiPlay />}
        </button>

        <button 
          className={`control-btn ${!hasNext ? 'disabled' : ''}`}
          onClick={onNext}
          disabled={!hasNext}
          title="Next"
        >
          <FiSkipForward />
        </button>

        <button 
          className={`control-btn secondary ${isRepeat ? 'active' : ''}`}
          onClick={() => setIsRepeat(!isRepeat)}
          title="Repeat"
        >
          <FiRepeat />
        </button>
      </div>

      {/* Volume & Lyrics Toggle */}
      <div className="extra-controls">
        <div className="volume-control">
          <button 
            className="volume-btn"
            onClick={() => setShowVolume(!showVolume)}
          >
            {volume === 0 ? <FiVolumeX /> : <FiVolume2 />}
          </button>
          {showVolume && (
            <div className="volume-slider-popup">
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={volume}
                onChange={(e) => onVolumeChange(Number(e.target.value))}
              />
            </div>
          )}
        </div>
        
        {hasLyrics && (
          <button 
            className={`lyrics-toggle ${showLyrics ? 'active' : ''}`}
            onClick={() => setShowLyrics(!showLyrics)}
          >
            Lyrics
          </button>
        )}
      </div>

      {/* Lyrics Panel */}
      {showLyrics && hasLyrics && (
        <div className="lyrics-panel">
          <div className="lyrics-content">
            <h4>Lyrics</h4>
            <div className="lyrics-text">
              {song.lyrics?.split('\n').map((line, i) => (
                <p key={i} className="lyric-line">{line}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

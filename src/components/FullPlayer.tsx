import { useState, useRef, useEffect } from 'react'
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, ListMusic, X, Volume2, Sparkles, Heart } from 'lucide-react'
import { Song } from '../types'
import { isFavorite, toggleFavorite } from '../utils/storage'
import './FullPlayer.css'

interface FullPlayerProps {
  currentSong: Song | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isShuffle: boolean
  isRepeat: boolean
  queue: Song[]
  onPlayPause: () => void
  onNext: () => void
  onPrevious: () => void
  onSeek: (time: number) => void
  onVolumeChange: (volume: number) => void
  onShuffleToggle: () => void
  onRepeatToggle: () => void
  onClose: () => void
  onVisualize: () => void
  isVisualizing: boolean
}

export function FullPlayer({
  currentSong,
  isPlaying,
  currentTime,
  duration,
  volume,
  isShuffle,
  isRepeat,
  queue,
  onPlayPause,
  onNext,
  onPrevious,
  onSeek,
  onVolumeChange,
  onShuffleToggle,
  onRepeatToggle,
  onClose,
  onVisualize,
  isVisualizing
}: FullPlayerProps) {
  const [showQueue, setShowQueue] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (currentSong) {
      setIsLiked(isFavorite(currentSong.id))
    }
  }, [currentSong])

  const handleToggleLike = () => {
    if (!currentSong) return
    const newLikedState = toggleFavorite(currentSong)
    setIsLiked(newLikedState)
  }

  if (!currentSong) return null

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !duration) return
    const rect = progressRef.current.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    onSeek(percent * duration)
  }

  return (
    <div className={`full-player ${isVisualizing ? 'visualizing' : ''}`}>
      {/* Close Button */}
      <button className="full-player-close" onClick={onClose}>
        <X size={24} />
      </button>

      <div className="full-player-content">
        {/* Left: Album Art */}
        <div className="full-player-art-section">
          <div className="full-player-art">
            {currentSong.coverArt ? (
              <img src={currentSong.coverArt} alt={currentSong.title} />
            ) : (
              <div className="full-player-art-placeholder">
                <span>♪</span>
              </div>
            )}
          </div>
          
          {/* VISUALIZE Button */}
          <button 
            className={`visualize-btn ${isVisualizing ? 'active' : ''}`}
            onClick={onVisualize}
          >
            <Sparkles size={20} />
            <span>{isVisualizing ? 'STOP VISUALIZER' : 'VISUALIZE'}</span>
          </button>
        </div>

        {/* Right: Controls & Info */}
        <div className="full-player-info-section">
          <div className="full-player-song-info">
            <div className="song-info-header">
              <div>
                <h2 className="full-player-title">{currentSong.title}</h2>
                <p className="full-player-artist">{currentSong.artist}</p>
                {currentSong.album && (
                  <p className="full-player-album">{currentSong.album}</p>
                )}
                {currentSong.category && (
                  <span className="full-player-category">{currentSong.category}</span>
                )}
              </div>
              <button 
                className={`like-btn ${isLiked ? 'liked' : ''}`}
                onClick={handleToggleLike}
                title={isLiked ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart size={28} fill={isLiked ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="full-player-progress-section">
            <div 
              className="full-player-progress-bar"
              ref={progressRef}
              onClick={handleProgressClick}
            >
              <div 
                className="full-player-progress-fill"
                style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
              />
            </div>
            <div className="full-player-time">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Main Controls */}
          <div className="full-player-controls">
            <button 
              className={`control-btn ${isShuffle ? 'active' : ''}`}
              onClick={onShuffleToggle}
            >
              <Shuffle size={20} />
            </button>

            <button className="control-btn" onClick={onPrevious}>
              <SkipBack size={28} fill="currentColor" />
            </button>

            <button className="control-btn play" onClick={onPlayPause}>
              {isPlaying ? (
                <Pause size={32} fill="currentColor" />
              ) : (
                <Play size={32} fill="currentColor" />
              )}
            </button>

            <button className="control-btn" onClick={onNext}>
              <SkipForward size={28} fill="currentColor" />
            </button>

            <button 
              className={`control-btn ${isRepeat ? 'active' : ''}`}
              onClick={onRepeatToggle}
            >
              <Repeat size={20} />
            </button>
          </div>

          {/* Volume & Queue */}
          <div className="full-player-extras">
            <div className="volume-control">
              <Volume2 size={18} />
              <input
                type="range"
                min={0}
                max={100}
                value={volume}
                onChange={(e) => onVolumeChange(Number(e.target.value))}
                className="volume-slider"
              />
            </div>

            <button 
              className={`queue-toggle ${showQueue ? 'active' : ''}`}
              onClick={() => setShowQueue(!showQueue)}
            >
              <ListMusic size={20} />
              <span>{queue.length}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Queue Panel */}
      {showQueue && (
        <div className="queue-panel">
          <h3>Queue ({queue.length})</h3>
          <div className="queue-list">
            {queue.map((song, index) => (
              <div key={`${song.id}-${index}`} className="queue-item">
                {song.coverArt ? (
                  <img src={song.coverArt} alt={song.title} />
                ) : (
                  <div className="queue-item-placeholder">♪</div>
                )}
                <div className="queue-item-info">
                  <span className="queue-item-title">{song.title}</span>
                  <span className="queue-item-artist">{song.artist}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default FullPlayer

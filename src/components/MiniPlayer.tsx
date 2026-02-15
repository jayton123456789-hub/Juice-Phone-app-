import { HiPlay, HiPause, HiChevronUp } from 'react-icons/hi'
import { FiSkipBack, FiSkipForward } from 'react-icons/fi'
import { Song } from '../types'
import './MiniPlayer.css'

interface MiniPlayerProps {
  song: Song | null
  isPlaying: boolean
  onOpenFull: () => void
  onTogglePlay: () => void
  onNext: () => void
  onPrevious: () => void
}

export default function MiniPlayer({ 
  song, 
  isPlaying, 
  onOpenFull, 
  onTogglePlay,
  onNext,
  onPrevious
}: MiniPlayerProps) {
  if (!song) return null

  return (
    <div className="mini-player" onClick={onOpenFull}>
      <div className="mini-player-content">
        {/* Album Art */}
        <div className={`mini-art ${isPlaying ? 'playing' : ''}`}>
          {song.coverArt ? (
            <img src={song.coverArt} alt={song.title} />
          ) : (
            <div className="mini-art-placeholder">🎵</div>
          )}
        </div>

        {/* Song Info */}
        <div className="mini-info">
          <h4 className="mini-title">{song.title}</h4>
          <p className="mini-artist">{song.artist}</p>
        </div>

        {/* Controls */}
        <div className="mini-controls" onClick={(e) => e.stopPropagation()}>
          <button className="mini-btn" onClick={onPrevious}>
            <FiSkipBack />
          </button>
          
          <button className="mini-btn play" onClick={onTogglePlay}>
            {isPlaying ? <HiPause /> : <HiPlay />}
          </button>
          
          <button className="mini-btn" onClick={onNext}>
            <FiSkipForward />
          </button>
        </div>

        {/* Expand Button */}
        <button className="mini-expand" onClick={onOpenFull}>
          <HiChevronUp />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mini-progress">
        <div className={`mini-progress-bar ${isPlaying ? 'active' : ''}`}></div>
      </div>
    </div>
  )
}

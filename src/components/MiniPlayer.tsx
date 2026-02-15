import { Play, Pause, SkipForward, Maximize2 } from 'lucide-react'
import { Song } from '../types'
import './MiniPlayer.css'

interface MiniPlayerProps {
  currentSong: Song | null
  isPlaying: boolean
  onPlayPause: () => void
  onNext: () => void
  onExpand: () => void
}

export function MiniPlayer({ currentSong, isPlaying, onPlayPause, onNext, onExpand }: MiniPlayerProps) {
  if (!currentSong) return null

  return (
    <div className="mini-player">
      <div className="mini-player-content">
        {/* Song Info - Click to expand */}
        <button className="mini-player-info" onClick={onExpand}>
          <div className="mini-player-cover">
            {currentSong.coverArt ? (
              <img src={currentSong.coverArt} alt={currentSong.title} />
            ) : (
              <div className="mini-player-cover-placeholder">
                <span>♪</span>
              </div>
            )}
          </div>
          <div className="mini-player-text">
            <span className="mini-player-title">{currentSong.title}</span>
            <span className="mini-player-artist">{currentSong.artist}</span>
          </div>
        </button>

        {/* Controls */}
        <div className="mini-player-controls">
          <button 
            className="mini-player-btn"
            onClick={onPlayPause}
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          </button>
          
          <button 
            className="mini-player-btn"
            onClick={onNext}
          >
            <SkipForward size={18} />
          </button>
          
          <button 
            className="mini-player-btn expand"
            onClick={onExpand}
          >
            <Maximize2 size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default MiniPlayer

import { HiX, HiTrash, HiQueueList } from 'react-icons/hi'
import { Song } from '../types'
import './QueuePanel.css'

interface QueuePanelProps {
  queue: Song[]
  currentIndex: number
  isOpen: boolean
  onClose: () => void
  onSongSelect: (index: number) => void
  onClearQueue: () => void
  onRemoveSong: (index: number) => void
}

export default function QueuePanel({ 
  queue, 
  currentIndex, 
  isOpen, 
  onClose, 
  onSongSelect,
  onClearQueue,
  onRemoveSong
}: QueuePanelProps) {
  if (!isOpen) return null

  const upcomingSongs = queue.slice(currentIndex + 1)
  const playedSongs = queue.slice(0, currentIndex)

  return (
    <div className="queue-panel-overlay" onClick={onClose}>
      <div className="queue-panel" onClick={(e) => e.stopPropagation()}>
        <div className="queue-header">
          <div className="queue-title">
            <HiQueueList />
            <span>Queue ({queue.length})</span>
          </div>
          <div className="queue-actions">
            <button className="queue-action-btn" onClick={onClearQueue} title="Clear Queue">
              <HiTrash />
            </button>
            <button className="queue-action-btn" onClick={onClose}>
              <HiX />
            </button>
          </div>
        </div>

        <div className="queue-content">
          {/* Now Playing */}
          {currentIndex >= 0 && currentIndex < queue.length && (
            <div className="queue-section">
              <h4>Now Playing</h4>
              <QueueItem 
                song={queue[currentIndex]} 
                isPlaying={true}
                onClick={() => {}}
              />
            </div>
          )}

          {/* Up Next */}
          {upcomingSongs.length > 0 && (
            <div className="queue-section">
              <h4>Up Next ({upcomingSongs.length})</h4>
              {upcomingSongs.map((song, idx) => (
                <QueueItem 
                  key={`${song.id}-${currentIndex + 1 + idx}`}
                  song={song}
                  index={currentIndex + 1 + idx}
                  onClick={() => onSongSelect(currentIndex + 1 + idx)}
                  onRemove={() => onRemoveSong(currentIndex + 1 + idx)}
                />
              ))}
            </div>
          )}

          {/* Played */}
          {playedSongs.length > 0 && (
            <div className="queue-section played">
              <h4>Played ({playedSongs.length})</h4>
              {playedSongs.map((song, idx) => (
                <QueueItem 
                  key={`${song.id}-${idx}`}
                  song={song}
                  index={idx}
                  isPlayed={true}
                  onClick={() => onSongSelect(idx)}
                />
              ))}
            </div>
          )}

          {queue.length === 0 && (
            <div className="queue-empty">
              <p>Queue is empty</p>
              <span>Add songs to your queue</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface QueueItemProps {
  song: Song
  index?: number
  isPlaying?: boolean
  isPlayed?: boolean
  onClick: () => void
  onRemove?: () => void
}

function QueueItem({ song, isPlaying, isPlayed, onClick }: QueueItemProps) {
  return (
    <div 
      className={`queue-item ${isPlaying ? 'playing' : ''} ${isPlayed ? 'played' : ''}`}
      onClick={onClick}
    >
      <div className="queue-item-art">
        {song.coverArt ? (
          <img src={song.coverArt} alt={song.title} />
        ) : (
          <div className="queue-art-placeholder">🎵</div>
        )}
      </div>
      <div className="queue-item-info">
        <h5>{song.title}</h5>
        <p>{song.artist}</p>
      </div>
      {isPlaying && (
        <div className="playing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      )}
    </div>
  )
}

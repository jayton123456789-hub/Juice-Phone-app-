import { useState, useEffect, useRef } from 'react'
import { 
  HiChevronDown, HiPlay, HiPause, HiHeart,
  HiQueueList, HiCog
} from 'react-icons/hi2'
import { FiVolume2 } from 'react-icons/fi'
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
  volumeBoost: boolean
  queueLength: number
  hasNext: boolean
  hasPrevious: boolean
  onTogglePlay: () => void
  onNext: () => void
  onPrevious: () => void
  onSeek: (time: number) => void
  onVolumeChange: (volume: number) => void
  onToggleVolumeBoost: () => void
  onClose: () => void
  onOpenQueue: () => void
}

const EQ_PRESETS = {
  'Flat': { bass: 0, mid: 0, treble: 0 },
  'Bass Boost': { bass: 12, mid: 0, treble: 2 },
  'Deep Bass': { bass: 16, mid: -2, treble: 0 },
  'Vocal': { bass: -4, mid: 8, treble: 4 },
  'Electronic': { bass: 8, mid: 0, treble: 8 }
}

export default function Player({
  song,
  isPlaying,
  currentTime,
  duration,
  volume,
  volumeBoost,
  queueLength,
  hasNext,
  hasPrevious,
  onTogglePlay,
  onNext,
  onPrevious,
  onSeek,
  onVolumeChange,
  onToggleVolumeBoost,
  onClose,
  onOpenQueue
}: PlayerProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [showLyrics, setShowLyrics] = useState(false)
  const [isShuffle, setIsShuffle] = useState(false)
  const [isRepeat, setIsRepeat] = useState(false)
  const [showVolume, setShowVolume] = useState(false)
  const [showEQ, setShowEQ] = useState(false)
  const [eqPreset, setEqPreset] = useState<keyof typeof EQ_PRESETS>('Flat')
  const [fineVolume, setFineVolume] = useState(volume)

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

  // Initialize audio context for EQ
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Create gain node for volume boost
      gainNodeRef.current = audioContextRef.current.createGain()
      gainNodeRef.current.connect(audioContextRef.current.destination)
      
      // Create EQ filters
      const bass = audioContextRef.current.createBiquadFilter()
      bass.type = 'lowshelf'
      bass.frequency.value = 200
      
      const mid = audioContextRef.current.createBiquadFilter()
      mid.type = 'peaking'
      mid.frequency.value = 1000
      mid.Q.value = 1
      
      const treble = audioContextRef.current.createBiquadFilter()
      treble.type = 'highshelf'
      treble.frequency.value = 3000
      
      filterNodesRef.current = [bass, mid, treble]
      
      // Connect filters
      bass.connect(mid)
      mid.connect(treble)
      treble.connect(gainNodeRef.current)
    }
  }, [])

  // Apply EQ preset
  useEffect(() => {
    const preset = EQ_PRESETS[eqPreset]
    if (filterNodesRef.current[0]) {
      filterNodesRef.current[0].gain.value = preset.bass
      filterNodesRef.current[1].gain.value = preset.mid
      filterNodesRef.current[2].gain.value = preset.treble
    }
  }, [eqPreset])

  // Apply volume boost
  useEffect(() => {
    if (gainNodeRef.current) {
      const boost = volumeBoost ? 1.5 : 1.0 // 150% max volume
      gainNodeRef.current.gain.value = (fineVolume / 100) * boost
    }
    onVolumeChange(fineVolume)
  }, [fineVolume, volumeBoost, onVolumeChange])

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
        <span className="now-playing">WRLD PLAYER</span>
        <button className="header-btn" onClick={onOpenQueue}>
          <HiQueueList />
          {queueLength > 0 && <span className="queue-badge">{queueLength}</span>}
        </button>
      </div>

      {/* Centered Album Art */}
      <div className={`album-art-wrapper ${isPlaying && hasAudio ? 'playing' : ''}`}>
        <div className="album-art-glow"></div>
        <div className="album-art-container">
          <CoverImage 
            src={song.coverArt}
            alt={song.title}
            size="xlarge"
            className="player-album-art"
          />
        </div>
        {!hasAudio && (
          <div className="no-audio-badge">NO AUDIO</div>
        )}
      </div>

      {/* Song Info */}
      <div className="song-details">
        <div className="song-title-row">
          <div className="song-text">
            <h2 className="song-title-text">{song.title}</h2>
            <p className="song-artist-text">{song.artist} {song.album && `• ${song.album}`}</p>
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
        <div className="progress-bar-container" onClick={handleProgressClick}>
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

      {/* Volume & Extra Controls */}
      <div className="extra-controls">
        <div className="volume-section">
          <button 
            className="control-icon-btn"
            onClick={() => setShowVolume(!showVolume)}
          >
            <FiVolume2 />
          </button>
          
          {showVolume && (
            <div className="volume-popup">
              <div className="volume-header">
                <span>Volume</span>
                <label className="boost-toggle">
                  <input 
                    type="checkbox" 
                    checked={volumeBoost}
                    onChange={onToggleVolumeBoost}
                  />
                  <span>BOOST (150%)</span>
                </label>
              </div>
              <input 
                type="range" 
                min="0" 
                max={volumeBoost ? 150 : 100}
                value={fineVolume}
                onChange={(e) => setFineVolume(Number(e.target.value))}
                className="volume-slider"
              />
              <div className="volume-value">{Math.round(fineVolume)}%</div>
            </div>
          )}
        </div>

        <button 
          className={`control-icon-btn ${showEQ ? 'active' : ''}`}
          onClick={() => setShowEQ(!showEQ)}
          title="Equalizer"
        >
          <HiCog />
        </button>
        
        {hasLyrics && (
          <button 
            className={`lyrics-toggle ${showLyrics ? 'active' : ''}`}
            onClick={() => setShowLyrics(!showLyrics)}
          >
            Lyrics
          </button>
        )}
      </div>

      {/* EQ Panel */}
      {showEQ && (
        <div className="eq-panel">
          <h4>Equalizer</h4>
          <div className="eq-presets">
            {Object.keys(EQ_PRESETS).map((preset) => (
              <button
                key={preset}
                className={`eq-preset-btn ${eqPreset === preset ? 'active' : ''}`}
                onClick={() => setEqPreset(preset as keyof typeof EQ_PRESETS)}
              >
                {preset}
              </button>
            ))}
          </div>
          <div className="eq-visual">
            {Object.entries(EQ_PRESETS[eqPreset]).map(([band, value]) => (
              <div key={band} className="eq-band">
                <span className="eq-label">{band}</span>
                <div className="eq-bar-container">
                  <div 
                    className="eq-bar" 
                    style={{ height: `${50 + value * 2}%` }}
                  ></div>
                </div>
                <span className="eq-value">{value > 0 ? `+${value}` : value}dB</span>
              </div>
            ))}
          </div>
        </div>
      )}

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

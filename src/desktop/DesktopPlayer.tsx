import { useState } from 'react'
import { Song } from '../types'
import Visualizer from './Visualizer'
import './DesktopPlayer.css'

interface DesktopPlayerProps {
  song: Song
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  volumeBoost: boolean
  queueLength?: number
  hasNext: boolean
  hasPrevious: boolean
  onTogglePlay: () => void
  onNext: () => void
  onPrevious: () => void
  onSeek: (time: number) => void
  onVolumeChange: (volume: number) => void
  onToggleVolumeBoost: () => void
  onClose: () => void
}

type PlayerMode = 'player' | 'visualizer' | 'eq' | 'lyrics'
type VizType = 'milkdrop' | 'kaleidoscope' | 'particles' | 'off'

const EQ_PRESETS = [
  { name: 'Flat', values: [0, 0, 0, 0, 0] },
  { name: 'Bass Boost', values: [8, 4, 0, 0, 0] },
  { name: 'Electronic', values: [5, 2, -1, 2, 4] },
  { name: 'Hip Hop', values: [7, 3, 0, 1, 2] },
  { name: 'Vocal', values: [-2, 0, 4, 5, 2] },
]

export function DesktopPlayer({
  song,
  isPlaying,
  currentTime,
  duration,
  volume,
  volumeBoost,
  hasNext,
  hasPrevious,
  onTogglePlay,
  onNext,
  onPrevious,
  onSeek,
  onVolumeChange,
  onToggleVolumeBoost,
  onClose
}: DesktopPlayerProps) {
  const [mode, setMode] = useState<PlayerMode>('player')
  const [vizType, setVizType] = useState<VizType>('milkdrop')
  const [eqPreset, setEqPreset] = useState('Flat')
  const [eqValues, setEqValues] = useState([0, 0, 0, 0, 0])
  const [showInfo, setShowInfo] = useState(true)

  // Clean time format
  const formatTime = (t: number) => {
    const m = Math.floor(t / 60)
    const s = Math.floor(t % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const applyEq = (name: string) => {
    const preset = EQ_PRESETS.find(p => p.name === name)
    if (preset) {
      setEqPreset(name)
      setEqValues([...preset.values])
    }
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  // FULL SCREEN VISUALIZER
  if (mode === 'visualizer') {
    return (
      <div className="dp-fs-visualizer">
        {/* Professional Visualizer */}
        <Visualizer isPlaying={isPlaying} mode={vizType} />
        
        {/* Tap hint */}
        <div className="dp-fs-hint" onClick={() => setShowInfo(!showInfo)}>
          Click for controls
        </div>
        
        {/* Info overlay */}
        {showInfo && (
          <div className="dp-fs-overlay">
            <div className="dp-fs-song">
              <img src={song.coverArt} alt="" />
              <div>
                <h3>{song.title}</h3>
                <p>{song.artist}</p>
              </div>
            </div>
            
            <div className="dp-fs-viz-controls">
              <button onClick={() => setMode('player')}>EXIT VISUALIZER</button>
              <div className="dp-fs-modes">
                {(['milkdrop', 'kaleidoscope', 'particles', 'off'] as VizType[]).map(v => (
                  <button 
                    key={v}
                    className={vizType === v ? 'active' : ''}
                    onClick={() => setVizType(v)}
                  >
                    {v === 'off' ? 'OFF' : v.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // EQ MODE
  if (mode === 'eq') {
    return (
      <div className="dp-overlay">
        <button className="dp-back" onClick={() => setMode('player')}>BACK</button>
        
        <div className="dp-eq">
          <h2>Equalizer</h2>
          
          <div className="dp-eq-presets">
            {EQ_PRESETS.map(p => (
              <button 
                key={p.name}
                className={eqPreset === p.name ? 'active' : ''}
                onClick={() => applyEq(p.name)}
              >
                {p.name}
              </button>
            ))}
          </div>
          
          <div className="dp-eq-bands">
            {['60Hz', '250Hz', '1kHz', '4kHz', '16kHz'].map((freq, i) => (
              <div key={freq} className="dp-eq-band">
                <input 
                  type="range" 
                  min={-12} 
                  max={12} 
                  value={eqValues[i]}
                  onChange={(e) => {
                    const v = [...eqValues]
                    v[i] = Number(e.target.value)
                    setEqValues(v)
                    setEqPreset('Custom')
                  }}
                />
                <span>{freq}</span>
                <label>{eqValues[i] > 0 ? `+${eqValues[i]}` : eqValues[i]}dB</label>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // LYRICS MODE
  if (mode === 'lyrics') {
    return (
      <div className="dp-overlay">
        <button className="dp-back" onClick={() => setMode('player')}>BACK</button>
        
        <div className="dp-lyrics">
          <h2>{song.title}</h2>
          {song.lyrics ? (
            <pre>{song.lyrics}</pre>
          ) : (
            <p className="dp-no-lyrics">No lyrics available</p>
          )}
        </div>
      </div>
    )
  }

  // MAIN PLAYER
  return (
    <div className="dp-main-player">
      <button className="dp-close" onClick={onClose}>CLOSE</button>
      
      <div className="dp-player-content">
        {/* Album Art */}
        <div className="dp-left">
          <div className="dp-cover" onClick={() => setMode('visualizer')}>
            <img src={song.coverArt} alt={song.title} />
            <div className="dp-cover-hover">
              <span>OPEN VISUALIZER</span>
            </div>
          </div>
          <div className="dp-meta">
            <h2>{song.title}</h2>
            <p>{song.artist}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="dp-center-controls">
          <div className="dp-transport">
            <button onClick={onPrevious} disabled={!hasPrevious}>
              <svg viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
            </button>
            <button className="dp-play-big" onClick={onTogglePlay}>
              {isPlaying ? (
                <svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              ) : (
                <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              )}
            </button>
            <button onClick={onNext} disabled={!hasNext}>
              <svg viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
            </button>
          </div>

          <div className="dp-scrubber">
            <span>{formatTime(currentTime)}</span>
            <div className="dp-track">
              <input 
                type="range" 
                min={0} 
                max={duration || 100} 
                value={currentTime} 
                onChange={(e) => onSeek(Number(e.target.value))}
              />
              <div className="dp-progress" style={{ width: `${progress}%` }} />
            </div>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Options */}
        <div className="dp-right">
          <button className="dp-opt-btn" onClick={() => setMode('visualizer')}>
            VISUALIZER
          </button>
          <button className="dp-opt-btn" onClick={() => setMode('eq')}>
            EQUALIZER
          </button>
          {song.hasLyrics && (
            <button className="dp-opt-btn" onClick={() => setMode('lyrics')}>
              LYRICS
            </button>
          )}
          
          <div className="dp-volume-section">
            <label>VOLUME</label>
            <input 
              type="range" 
              min={0} 
              max={100} 
              value={volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
            />
            <span>{volume}%</span>
          </div>
          
          <button 
            className={`dp-boost-btn ${volumeBoost ? 'active' : ''}`}
            onClick={onToggleVolumeBoost}
          >
            BOOST {volumeBoost ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Bottom Mini Player
interface DesktopPlayerBarProps {
  currentSong: Song | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  onPlayPause: () => void
  onNext: () => void
  onPrevious: () => void
  onSeek: (time: number) => void
  onVolumeChange: (volume: number) => void
  onOpenFullPlayer: () => void
}

export function DesktopPlayerBar({
  currentSong, isPlaying, currentTime, duration, volume,
  onPlayPause, onNext, onPrevious, onSeek, onVolumeChange, onOpenFullPlayer
}: DesktopPlayerBarProps) {
  if (!currentSong) return null
  
  const formatTime = (t: number) => {
    const m = Math.floor(t / 60)
    const s = Math.floor(t % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="dp-bar">
      <div className="dp-bar-left" onClick={onOpenFullPlayer}>
        <img src={currentSong.coverArt} alt="" />
        <div>
          <span>{currentSong.title}</span>
          <small>{currentSong.artist}</small>
        </div>
      </div>

      <div className="dp-bar-center">
        <div className="dp-bar-btns">
          <button onClick={onPrevious}>
            <svg viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
          </button>
          <button onClick={onPlayPause}>
            {isPlaying ? (
              <svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            ) : (
              <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            )}
          </button>
          <button onClick={onNext}>
            <svg viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
          </button>
        </div>
        <div className="dp-bar-scrub">
          <span>{formatTime(currentTime)}</span>
          <input type="range" min={0} max={duration || 100} value={currentTime} onChange={(e) => onSeek(Number(e.target.value))} />
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="dp-bar-right">
        <input type="range" min={0} max={100} value={volume} onChange={(e) => onVolumeChange(Number(e.target.value))} />
      </div>
    </div>
  )
}

export default DesktopPlayer

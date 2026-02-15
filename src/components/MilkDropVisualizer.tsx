import { useEffect, useRef, useState } from 'react'
import { Play, Pause, SkipForward, SkipBack, Heart, Volume2, VolumeX, X, Settings } from 'lucide-react'
import './MilkDropVisualizer.css'

interface MilkDropVisualizerProps {
  isPlaying: boolean
  audioContext: AudioContext | null
  sourceNode: MediaElementAudioSourceNode | null
  onClose: () => void
  currentSong?: any
  onPlayPause?: () => void
  onNext?: () => void
  onPrevious?: () => void
  onToggleFavorite?: () => void
  volume?: number
  onVolumeChange?: (vol: number) => void
}

export function MilkDropVisualizer({
  isPlaying,
  audioContext,
  sourceNode,
  onClose,
  currentSong,
  onPlayPause,
  onNext,
  onPrevious,
  onToggleFavorite,
  volume = 100,
  onVolumeChange
}: MilkDropVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const visualizerRef = useRef<any>(null)
  const animationRef = useRef<number>(0)
  const cycleTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  const [presetName, setPresetName] = useState('')
  const [presetKeys, setPresetKeys] = useState<string[]>([])
  const [currentPresetIndex, setCurrentPresetIndex] = useState(0)
  const [presetsLibrary, setPresetsLibrary] = useState<any>(null)
  
  const [showControls, setShowControls] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [cycleEnabled, setCycleEnabled] = useState(true)
  const [cycleInterval, setCycleInterval] = useState(5)
  const [isReady, setIsReady] = useState(false)
  
  const hideTimerRef = useRef<number>(0)
  const [isMuted, setIsMuted] = useState(false)
  const prevVolumeRef = useRef(volume)

  // Initialize visualizer with CORRECT Butterchurn method
  useEffect(() => {
    const initVisualizer = async () => {
      const canvas = canvasRef.current
      if (!canvas || visualizerRef.current || !audioContext || !sourceNode) {
        console.log('[MilkDrop] Cannot init:', { canvas: !!canvas, hasViz: !!visualizerRef.current, hasAudio: !!audioContext, hasSource: !!sourceNode })
        return
      }

      try {
        console.log('[MilkDrop] Initializing...')
        
        // Import butterchurn correctly
        const butterchurn = await import('butterchurn')
        const butterchurnPresets = await import('butterchurn-presets')
        
        // Set canvas size with device pixel ratio
        const dpr = window.devicePixelRatio || 1
        canvas.width = window.innerWidth * dpr
        canvas.height = window.innerHeight * dpr
        canvas.style.width = window.innerWidth + 'px'
        canvas.style.height = window.innerHeight + 'px'
        
        // Create visualizer using CORRECT METHOD
        const visualizer = butterchurn.default.createVisualizer(audioContext, canvas, {
          width: canvas.width,
          height: canvas.height,
          pixelRatio: dpr,
          textureRatio: 1
        })
        
        visualizerRef.current = visualizer
        console.log('[MilkDrop] Visualizer created')

        // Connect audio
        visualizer.connectAudio(sourceNode)
        console.log('[MilkDrop] Audio connected')

        // Load presets
        const presets = butterchurnPresets.default.getPresets()
        const keys = Object.keys(presets)
        setPresetsLibrary(presets)
        setPresetKeys(keys)
        console.log('[MilkDrop] Loaded', keys.length, 'presets')

        // Load first preset with blend time
        const firstKey = keys[0]
        visualizer.loadPreset(presets[firstKey], 2.7)
        setPresetName(firstKey.replace(/_/g, ' '))
        setCurrentPresetIndex(0)
        setIsReady(true)
        
        console.log('[MilkDrop] Initialized successfully - READY TO RENDER')
      } catch (e) {
        console.error('[MilkDrop] Init error:', e)
      }
    }

    initVisualizer()

    // Handle window resize
    const handleResize = () => {
      const canvas = canvasRef.current
      const visualizer = visualizerRef.current
      if (!canvas || !visualizer) return
      
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
      
      visualizer.setRendererSize(canvas.width, canvas.height)
    }
    
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationRef.current)
      window.removeEventListener('resize', handleResize)
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
      if (cycleTimerRef.current) clearInterval(cycleTimerRef.current)
    }
  }, [audioContext, sourceNode])

  // Render loop - Starts when isReady = true
  useEffect(() => {
    if (!isReady || !visualizerRef.current) {
      console.log('[MilkDrop] Render loop waiting...', { isReady, hasViz: !!visualizerRef.current })
      return
    }

    const visualizer = visualizerRef.current
    console.log('[MilkDrop] Starting render loop NOW!')
    
    const render = () => {
      try {
        visualizer.render()
      } catch (e) {
        console.error('[MilkDrop] Render error:', e)
      }
      animationRef.current = requestAnimationFrame(render)
    }

    animationRef.current = requestAnimationFrame(render)
    return () => {
      console.log('[MilkDrop] Stopping render loop')
      cancelAnimationFrame(animationRef.current)
    }
  }, [isReady])

  // Preset cycling - RANDOM every 5 seconds
  useEffect(() => {
    if (cycleEnabled && presetKeys.length > 0 && isReady) {
      console.log('[MilkDrop] Starting RANDOM preset cycle every', cycleInterval, 'seconds')
      cycleTimerRef.current = setInterval(() => {
        randomPreset()
      }, cycleInterval * 1000)
    } else {
      if (cycleTimerRef.current) {
        console.log('[MilkDrop] Stopping preset cycle')
        clearInterval(cycleTimerRef.current)
        cycleTimerRef.current = null
      }
    }

    return () => {
      if (cycleTimerRef.current) {
        clearInterval(cycleTimerRef.current)
        cycleTimerRef.current = null
      }
    }
  }, [cycleEnabled, cycleInterval, presetKeys.length, isReady])

  // Next preset (sequential)
  const nextPreset = () => {
    const visualizer = visualizerRef.current
    if (!visualizer || !presetsLibrary || presetKeys.length === 0) return
    
    const nextIndex = (currentPresetIndex + 1) % presetKeys.length
    const key = presetKeys[nextIndex]
    
    console.log('[MilkDrop] Switching to preset:', key)
    visualizer.loadPreset(presetsLibrary[key], 2.7)
    setPresetName(key.replace(/_/g, ' '))
    setCurrentPresetIndex(nextIndex)
  }

  // Random preset (for auto-cycling)
  const randomPreset = () => {
    const visualizer = visualizerRef.current
    if (!visualizer || !presetsLibrary || presetKeys.length === 0) return
    
    // Get random index different from current
    let randomIndex
    do {
      randomIndex = Math.floor(Math.random() * presetKeys.length)
    } while (randomIndex === currentPresetIndex && presetKeys.length > 1)
    
    const key = presetKeys[randomIndex]
    
    console.log('[MilkDrop] Switching to RANDOM preset:', key)
    visualizer.loadPreset(presetsLibrary[key], 2.7)
    setPresetName(key.replace(/_/g, ' '))
    setCurrentPresetIndex(randomIndex)
  }

  // Load specific preset
  const loadPreset = (index: number) => {
    const visualizer = visualizerRef.current
    if (!visualizer || !presetsLibrary || index < 0 || index >= presetKeys.length) return
    
    const key = presetKeys[index]
    console.log('[MilkDrop] Loading preset:', key)
    visualizer.loadPreset(presetsLibrary[key], 2.7)
    setPresetName(key.replace(/_/g, ' '))
    setCurrentPresetIndex(index)
  }

  // Show controls temporarily
  const showControlsTemporarily = () => {
    setShowControls(true)
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    hideTimerRef.current = window.setTimeout(() => {
      if (!showSettings) setShowControls(false)
    }, 3000)
  }

  const handleMouseMove = () => {
    showControlsTemporarily()
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      
      switch (key) {
        case ' ':
        case 'k':
          e.preventDefault()
          onPlayPause?.()
          showControlsTemporarily()
          break
        
        case 'arrowright':
          e.preventDefault()
          onNext?.()
          showControlsTemporarily()
          break
        
        case 'arrowleft':
          e.preventDefault()
          onPrevious?.()
          showControlsTemporarily()
          break
        
        case 'l':
          e.preventDefault()
          onToggleFavorite?.()
          showControlsTemporarily()
          break
        
        case 'p':
          e.preventDefault()
          nextPreset()
          showControlsTemporarily()
          break
        
        case 'm':
          e.preventDefault()
          toggleMute()
          showControlsTemporarily()
          break
        
        case 'arrowup':
          e.preventDefault()
          if (onVolumeChange) {
            const newVol = Math.min(100, volume + 5)
            onVolumeChange(newVol)
            setIsMuted(false)
          }
          showControlsTemporarily()
          break
        
        case 'arrowdown':
          e.preventDefault()
          if (onVolumeChange) {
            const newVol = Math.max(0, volume - 5)
            onVolumeChange(newVol)
            if (newVol === 0) setIsMuted(true)
          }
          showControlsTemporarily()
          break
        
        case 'escape':
          e.preventDefault()
          if (showSettings) {
            setShowSettings(false)
          } else {
            onClose()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onPlayPause, onNext, onPrevious, onToggleFavorite, onVolumeChange, onClose, volume, showSettings])

  const toggleMute = () => {
    if (onVolumeChange) {
      if (isMuted) {
        onVolumeChange(prevVolumeRef.current || 100)
        setIsMuted(false)
      } else {
        prevVolumeRef.current = volume
        onVolumeChange(0)
        setIsMuted(true)
      }
    }
  }

  return (
    <div 
      className="milkdrop-fullscreen"
      onMouseMove={handleMouseMove}
      onClick={showControlsTemporarily}
    >
      <canvas ref={canvasRef} className="milkdrop-canvas" />
      
      {/* Transparent Top Bar */}
      <div className={`milkdrop-top-bar ${showControls ? 'visible' : ''}`}>
        <div className="milkdrop-preset-info">
          <span className="preset-name">{presetName}</span>
        </div>
        
        <div className="milkdrop-top-actions">
          <button 
            className="milkdrop-icon-btn" 
            onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings) }}
            title="Settings"
          >
            <Settings size={20} />
          </button>
          <button className="milkdrop-icon-btn" onClick={onClose} title="Close (ESC)">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="milkdrop-settings-panel">
          <h3>Visualizer Settings</h3>
          
          <div className="settings-group">
            <label>Select Preset</label>
            <select 
              value={currentPresetIndex} 
              onChange={(e) => loadPreset(Number(e.target.value))}
              className="preset-dropdown"
            >
              {presetKeys.map((key, index) => (
                <option key={key} value={index}>
                  {key.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          <div className="settings-group">
            <div className="toggle-row">
              <label>Auto-cycle presets</label>
              <button 
                className={`toggle-btn ${cycleEnabled ? 'active' : ''}`}
                onClick={() => setCycleEnabled(!cycleEnabled)}
              >
                <span className="toggle-slider"></span>
              </button>
            </div>
            
            {cycleEnabled && (
              <div className="cycle-input">
                <label>Cycle every</label>
                <input 
                  type="number" 
                  min="5" 
                  max="300" 
                  value={cycleInterval}
                  onChange={(e) => setCycleInterval(Number(e.target.value))}
                />
                <span>seconds</span>
              </div>
            )}
          </div>

          <button className="settings-close-btn" onClick={() => setShowSettings(false)}>
            CLOSE
          </button>
        </div>
      )}

      {/* Bottom Controls */}
      <div className={`milkdrop-controls ${showControls ? 'visible' : ''}`}>
        {currentSong && (
          <div className="milkdrop-song-info">
            <div className="song-title">{currentSong.title}</div>
            <div className="song-artist">{currentSong.artist}</div>
          </div>
        )}

        <div className="milkdrop-playback-controls">
          <button className="viz-control-btn" onClick={onPrevious} title="Previous (←)">
            <SkipBack size={24} fill="currentColor" />
          </button>
          
          <button className="viz-control-btn play-btn" onClick={onPlayPause} title="Play/Pause (Space)">
            {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
          </button>
          
          <button className="viz-control-btn" onClick={onNext} title="Next (→)">
            <SkipForward size={24} fill="currentColor" />
          </button>
          
          <button 
            className={`viz-control-btn ${currentSong?.isFavorite ? 'active' : ''}`}
            onClick={onToggleFavorite}
            title="Like (L)"
          >
            <Heart size={24} fill={currentSong?.isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="milkdrop-volume-control">
          <button className="viz-control-btn" onClick={toggleMute} title="Mute (M)">
            {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(e) => {
              onVolumeChange?.(Number(e.target.value))
              setIsMuted(Number(e.target.value) === 0)
            }}
            className="volume-slider"
          />
          <span className="volume-label">{volume}%</span>
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className={`milkdrop-shortcuts ${showControls ? 'visible' : ''}`}>
        <div className="shortcut-item"><kbd>Space</kbd> Play/Pause</div>
        <div className="shortcut-item"><kbd>←</kbd> <kbd>→</kbd> Prev/Next</div>
        <div className="shortcut-item"><kbd>L</kbd> Like</div>
        <div className="shortcut-item"><kbd>P</kbd> Next Preset</div>
        <div className="shortcut-item"><kbd>↑</kbd> <kbd>↓</kbd> Volume</div>
        <div className="shortcut-item"><kbd>M</kbd> Mute</div>
        <div className="shortcut-item"><kbd>ESC</kbd> Exit</div>
      </div>
    </div>
  )
}

export default MilkDropVisualizer

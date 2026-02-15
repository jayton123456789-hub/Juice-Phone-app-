import { useState, useEffect } from 'react'
import './KeybindSettings.css'

interface KeybindSettingsProps {
  onClose: () => void
}

interface Keybind {
  action: string
  key: string
  description: string
  category: 'playback' | 'navigation' | 'visualizer'
}

const DEFAULT_KEYBINDS: Keybind[] = [
  // Playback
  { action: 'play_pause', key: 'Space', description: 'Play/Pause', category: 'playback' },
  { action: 'next', key: 'ArrowRight', description: 'Next Track', category: 'playback' },
  { action: 'prev', key: 'ArrowLeft', description: 'Previous Track', category: 'playback' },
  { action: 'volume_up', key: 'ArrowUp', description: 'Volume Up', category: 'playback' },
  { action: 'volume_down', key: 'ArrowDown', description: 'Volume Down', category: 'playback' },
  { action: 'mute', key: 'M', description: 'Mute/Unmute', category: 'playback' },
  { action: 'shuffle', key: 'S', description: 'Toggle Shuffle', category: 'playback' },
  { action: 'repeat', key: 'R', description: 'Toggle Repeat', category: 'playback' },
  
  // Navigation
  { action: 'favorite', key: 'L', description: 'Toggle Favorite', category: 'navigation' },
  { action: 'queue', key: 'Q', description: 'Open Queue', category: 'navigation' },
  { action: 'search', key: '/', description: 'Focus Search', category: 'navigation' },
  
  // Visualizer
  { action: 'visualizer', key: 'V', description: 'Toggle Visualizer', category: 'visualizer' },
  { action: 'viz_next_preset', key: 'N', description: 'Next Preset', category: 'visualizer' },
  { action: 'viz_prev_preset', key: 'B', description: 'Previous Preset', category: 'visualizer' },
  { action: 'viz_random_preset', key: 'H', description: 'Random Preset', category: 'visualizer' },
  { action: 'viz_lock_preset', key: 'K', description: 'Lock Preset', category: 'visualizer' }
]

export default function KeybindSettings({ onClose }: KeybindSettingsProps) {
  const [keybinds, setKeybinds] = useState<Keybind[]>(() => {
    // FORCE clear old keybinds and use defaults
    localStorage.removeItem('keybinds')
    const binds = DEFAULT_KEYBINDS
    console.log('[KeybindSettings] FORCED defaults:', binds.length, binds)
    return binds
  })
  const [listening, setListening] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  console.log('[KeybindSettings] Rendering with', keybinds.length, 'keybinds')

  // Save keybinds whenever they change
  useEffect(() => {
    localStorage.setItem('keybinds', JSON.stringify(keybinds))
  }, [keybinds])

  // Listen for key presses when in listening mode
  useEffect(() => {
    if (!listening) return

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const key = e.key
      
      // Check for duplicates
      const duplicate = keybinds.find(kb => kb.key === key && kb.action !== listening)
      if (duplicate) {
        setError(`${key} is already bound to ${duplicate.description}`)
        setTimeout(() => setError(null), 3000)
        setListening(null)
        return
      }

      // Update keybind
      setKeybinds(prev => prev.map(kb => 
        kb.action === listening ? { ...kb, key } : kb
      ))
      setListening(null)
      setError(null)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [listening, keybinds])

  const resetToDefaults = () => {
    if (confirm('Reset all keybinds to default?')) {
      setKeybinds(DEFAULT_KEYBINDS)
    }
  }

  const formatKey = (key: string) => {
    const keyMap: Record<string, string> = {
      'ArrowUp': '↑',
      'ArrowDown': '↓',
      'ArrowLeft': '←',
      'ArrowRight': '→',
      ' ': 'Space',
      'Enter': '↵'
    }
    return keyMap[key] || key
  }

  const renderCategory = (category: 'playback' | 'navigation' | 'visualizer', title: string) => {
    const categoryBinds = keybinds.filter(kb => kb.category === category)
    console.log(`Rendering ${category}:`, categoryBinds.length, 'binds')
    
    return (
      <div className="keybind-game-section">
        <div className="section-header-game">{title}</div>
        <div className="keybind-game-table">
          {categoryBinds.map(kb => (
            <div key={kb.action} className="keybind-game-row">
              <div className="keybind-game-label">{kb.description}</div>
              <button
                className={`keybind-game-button ${listening === kb.action ? 'listening' : ''}`}
                onClick={() => setListening(kb.action)}
              >
                {listening === kb.action ? 'PRESS KEY...' : formatKey(kb.key)}
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="keybind-game-overlay" onClick={onClose}>
      <div className="keybind-game-panel" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="keybind-game-header">
          <h1>⌨️ KEY BINDINGS</h1>
          <button className="keybind-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="keybind-game-error">
            ⚠️ {error}
          </div>
        )}

        {/* Content */}
        <div className="keybind-game-content">
          {renderCategory('playback', 'PLAYBACK CONTROLS')}
          {renderCategory('navigation', 'NAVIGATION')}
          {renderCategory('visualizer', 'VISUALIZER')}
        </div>

        {/* Footer */}
        <div className="keybind-game-footer">
          <button className="keybind-game-action-btn secondary" onClick={resetToDefaults}>
            RESTORE DEFAULTS
          </button>
          <button className="keybind-game-action-btn primary" onClick={onClose}>
            APPLY
          </button>
        </div>
      </div>
    </div>
  )
}

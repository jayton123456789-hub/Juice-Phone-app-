import { useEffect } from 'react'
import { toggleFavorite } from '../utils/storage'

interface KeyboardShortcutsProps {
  onPlayPause?: () => void
  onNext?: () => void
  onPrevious?: () => void
  onVolumeUp?: () => void
  onVolumeDown?: () => void
  onMute?: () => void
  onShuffle?: () => void
  onRepeat?: () => void
  onToggleFavorite?: () => void
  onQueue?: () => void
  onVisualize?: () => void
  currentSong?: any
  volume?: number
  setVolume?: (vol: number) => void
}

export function useKeyboardShortcuts(props: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in input/textarea
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return
      }

      // Load keybinds
      const saved = localStorage.getItem('keybinds')
      const keybinds = saved ? JSON.parse(saved) : []
      
      const findAction = (action: string) => {
        const kb = keybinds.find((k: any) => k.action === action)
        return kb?.key === e.key
      }

      // Playback controls
      if (findAction('play_pause') || (e.key === ' ' && !saved)) {
        e.preventDefault()
        props.onPlayPause?.()
      } else if (findAction('next') || (e.key === 'ArrowRight' && !saved)) {
        e.preventDefault()
        props.onNext?.()
      } else if (findAction('prev') || (e.key === 'ArrowLeft' && !saved)) {
        e.preventDefault()
        props.onPrevious?.()
      } else if (findAction('volume_up') || (e.key === 'ArrowUp' && !saved)) {
        e.preventDefault()
        if (props.volume !== undefined && props.setVolume) {
          props.setVolume(Math.min(100, props.volume + 5))
        }
      } else if (findAction('volume_down') || (e.key === 'ArrowDown' && !saved)) {
        e.preventDefault()
        if (props.volume !== undefined && props.setVolume) {
          props.setVolume(Math.max(0, props.volume - 5))
        }
      } else if (findAction('mute') || (e.key === 'M' && !saved)) {
        e.preventDefault()
        props.onMute?.()
      } else if (findAction('shuffle') || (e.key === 'S' && !saved)) {
        e.preventDefault()
        props.onShuffle?.()
      } else if (findAction('repeat') || (e.key === 'R' && !saved)) {
        e.preventDefault()
        props.onRepeat?.()
      }
      
      // Navigation
      else if (findAction('favorite') || (e.key === 'L' && !saved)) {
        e.preventDefault()
        if (props.currentSong) {
          toggleFavorite(props.currentSong)
          props.onToggleFavorite?.()
        }
      } else if (findAction('queue') || (e.key === 'Q' && !saved)) {
        e.preventDefault()
        props.onQueue?.()
      }
      
      // Visualizer
      else if (findAction('visualizer') || (e.key === 'V' && !saved)) {
        e.preventDefault()
        props.onVisualize?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [props])
}

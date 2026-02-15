import { useState, useRef, useCallback, useEffect } from 'react'
import { Song } from '../types'
import { loadQueue, saveQueue, getSettings, saveSettings, addToRecentlyPlayed } from '../utils/storage'

export function useAudioPlayer() {
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [queue, setQueueState] = useState<Song[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(getSettings().volume)
  const [isShuffle, setIsShuffle] = useState(false)
  const [isRepeat, setIsRepeat] = useState(false)
  const [volumeBoost, setVolumeBoost] = useState(false)
  const [isReady, setIsReady] = useState(false)
  
  // Web Audio API refs - initialize IMMEDIATELY on hook mount
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const filtersRef = useRef<BiquadFilterNode[]>([])
  const initRef = useRef(false)

  // Initialize audio element and Web Audio API ONCE on mount
  useEffect(() => {
    if (initRef.current) return
    initRef.current = true

    console.log('[AudioPlayer] Initializing audio system...')

    const audio = new Audio()
    audioRef.current = audio
    audio.volume = Math.min(volume / 100, 1)

    // Initialize Web Audio API immediately
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      const audioContext = new AudioContextClass()
      audioContextRef.current = audioContext
      
      console.log('[AudioPlayer] AudioContext created:', audioContext.state)
      
      // Create gain node for volume boost
      gainNodeRef.current = audioContext.createGain()
      gainNodeRef.current.connect(audioContext.destination)
      
      // Create EQ filters
      const bass = audioContext.createBiquadFilter()
      bass.type = 'lowshelf'
      bass.frequency.value = 200
      bass.gain.value = 0
      
      const mid = audioContext.createBiquadFilter()
      mid.type = 'peaking'
      mid.frequency.value = 1000
      mid.Q.value = 1
      mid.gain.value = 0
      
      const treble = audioContext.createBiquadFilter()
      treble.type = 'highshelf'
      treble.frequency.value = 3000
      treble.gain.value = 0
      
      filtersRef.current = [bass, mid, treble]
      
      // Connect filter chain: bass -> mid -> treble -> gain -> destination
      bass.connect(mid)
      mid.connect(treble)
      treble.connect(gainNodeRef.current)
      
      // Create MediaElementSource ONCE
      const source = audioContext.createMediaElementSource(audio)
      sourceNodeRef.current = source
      
      // Connect source to filters
      source.connect(bass)
      
      console.log('[AudioPlayer] Audio system initialized successfully')
      console.log('[AudioPlayer] Source node created:', !!sourceNodeRef.current)
      setIsReady(true)
      
    } catch (e) {
      console.error('[AudioPlayer] Web Audio API failed:', e)
    }

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleLoadedMetadata = () => setDuration(audio.duration || 0)
    const handleEnded = () => handleSongEnded()
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleError = (e: ErrorEvent) => {
      console.error('[AudioPlayer] Audio error:', e)
      setIsPlaying(false)
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('error', handleError as EventListener)

    // Load saved queue
    const savedQueue = loadQueue()
    if (savedQueue && savedQueue.queue.length > 0) {
      setQueueState(savedQueue.queue)
      setCurrentIndex(savedQueue.currentIndex)
      setCurrentSong(savedQueue.queue[savedQueue.currentIndex])
    }

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('error', handleError as EventListener)
      audio.pause()
      
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close()
      }
    }
  }, [])

  // Resume AudioContext on user interaction (browser requirement)
  const resumeAudioContext = useCallback(async () => {
    const ctx = audioContextRef.current
    if (ctx && ctx.state === 'suspended') {
      try {
        await ctx.resume()
        console.log('[AudioPlayer] AudioContext resumed:', ctx.state)
      } catch (e) {
        console.error('[AudioPlayer] Failed to resume AudioContext:', e)
      }
    }
  }, [])

  // Apply volume boost
  useEffect(() => {
    if (gainNodeRef.current) {
      const boostMultiplier = volumeBoost ? 1.5 : 1.0
      const finalGain = (volume / 100) * boostMultiplier
      
      gainNodeRef.current.gain.setTargetAtTime(finalGain, audioContextRef.current?.currentTime || 0, 0.1)
    }
    
    if (audioRef.current) {
      audioRef.current.volume = Math.min(volume / 100, 1)
    }
  }, [volume, volumeBoost])

  // Save queue when it changes
  useEffect(() => {
    if (queue.length > 0) {
      saveQueue(queue, currentIndex)
    }
  }, [queue, currentIndex])

  // Handle song ended - play next
  const handleSongEnded = useCallback(() => {
    console.log('[AudioPlayer] Song ended. Repeat:', isRepeat, 'Queue length:', queue.length, 'Current index:', currentIndex)
    
    if (isRepeat && audioRef.current) {
      console.log('[AudioPlayer] Repeating current song')
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(console.error)
    } else if (currentIndex < queue.length - 1) {
      console.log('[AudioPlayer] Playing next song in queue')
      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)
      const nextSong = queue[nextIndex]
      if (nextSong && audioRef.current) {
        console.log('[AudioPlayer] Next song:', nextSong.title)
        
        if (!nextSong.audioUrl) {
          console.warn('[AudioPlayer] Next song has no audio URL, skipping')
          // Skip to next song
          if (nextIndex < queue.length - 1) {
            setCurrentIndex(nextIndex + 1)
            const followingSong = queue[nextIndex + 1]
            if (followingSong?.audioUrl) {
              audioRef.current.src = followingSong.audioUrl
              audioRef.current.load()
              setCurrentSong(followingSong)
              audioRef.current.play().catch(console.error)
            }
          }
          return
        }
        
        audioRef.current.src = nextSong.audioUrl
        audioRef.current.load()
        setCurrentSong(nextSong)
        audioRef.current.play().catch(err => {
          console.error('[AudioPlayer] Failed to play next song:', err)
          setIsPlaying(false)
        })
      }
    } else {
      console.log('[AudioPlayer] End of queue reached')
      setIsPlaying(false)
      setCurrentTime(0)
    }
  }, [currentIndex, queue, isRepeat])

  // Set queue directly
  const setQueue = useCallback((songs: Song[], startIndex: number = 0) => {
    setQueueState(songs)
    setCurrentIndex(startIndex)
    if (songs[startIndex]) {
      playSong(songs[startIndex], true)
    }
  }, [])

  // Play a specific song
  const playSong = useCallback(async (song: Song, autoPlay: boolean = true) => {
    if (!audioRef.current) return
    
    console.log('[AudioPlayer] Playing song:', song.title)
    
    // Resume AudioContext first (browser requirement)
    await resumeAudioContext()
    
    if (!song.audioUrl) {
      console.warn('[AudioPlayer] No audio URL for song:', song.title)
      setCurrentSong(song)
      setIsPlaying(false)
      return
    }

    // Check if same song is already loaded
    if (currentSong?.id === song.id && audioRef.current.src === song.audioUrl) {
      if (autoPlay) {
        audioRef.current.play().catch(console.error)
      }
      return
    }

    // Load new song
    audioRef.current.src = song.audioUrl
    audioRef.current.load()
    setCurrentSong(song)
    setCurrentTime(0)
    
    // Add to recently played
    addToRecentlyPlayed(song)
    
    if (autoPlay) {
      audioRef.current.play().catch(err => {
        console.error('[AudioPlayer] Failed to play:', err)
        setIsPlaying(false)
      })
    }
  }, [currentSong, resumeAudioContext])

  // Add song to queue and play it
  const playSongWithQueue = useCallback((song: Song, allSongs: Song[] = []) => {
    const songIndex = allSongs.findIndex(s => s.id === song.id)
    const queueSongs = allSongs.slice(Math.max(0, songIndex))
    
    setQueueState(queueSongs)
    setCurrentIndex(0)
    playSong(song)
  }, [playSong])

  // Toggle play/pause
  const togglePlay = useCallback(async () => {
    if (!audioRef.current || !currentSong) return
    
    await resumeAudioContext()
    
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch(console.error)
    }
  }, [isPlaying, currentSong, resumeAudioContext])

  // Play next song
  const playNext = useCallback(() => {
    if (currentIndex < queue.length - 1) {
      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)
      playSong(queue[nextIndex])
    }
  }, [currentIndex, queue, playSong])

  // Play previous song
  const playPrevious = useCallback(() => {
    if (currentTime > 3) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0
      }
      setCurrentTime(0)
      return
    }
    
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1
      setCurrentIndex(prevIndex)
      playSong(queue[prevIndex])
    }
  }, [currentIndex, queue, playSong, currentTime])

  // Seek to position
  const seek = useCallback((time: number) => {
    if (!audioRef.current) return
    audioRef.current.currentTime = time
    setCurrentTime(time)
  }, [])

  // Set volume
  const setAudioVolume = useCallback((vol: number) => {
    setVolume(vol)
    saveSettings({ volume: vol })
  }, [])

  // Toggle volume boost
  const toggleVolumeBoost = useCallback(() => {
    setVolumeBoost(prev => !prev)
  }, [])

  // Add to queue
  const addToQueue = useCallback((song: Song) => {
    setQueueState(prev => [...prev, song])
  }, [])

  // Remove from queue
  const removeFromQueue = useCallback((index: number) => {
    setQueueState(prev => {
      const newQueue = prev.filter((_, i) => i !== index)
      if (index < currentIndex) {
        setCurrentIndex(currentIndex - 1)
      }
      return newQueue
    })
  }, [currentIndex])

  // Clear queue
  const clearQueue = useCallback(() => {
    setQueueState([])
    setCurrentIndex(-1)
    if (!isPlaying) {
      setCurrentSong(null)
    }
  }, [isPlaying])

  // Shuffle queue
  const shuffleQueue = useCallback(() => {
    setQueueState(prev => {
      const current = prev[currentIndex]
      const rest = prev.filter((_, i) => i !== currentIndex)
      
      for (let i = rest.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rest[i], rest[j]] = [rest[j], rest[i]]
      }
      
      return current ? [current, ...rest] : rest
    })
    setCurrentIndex(0)
  }, [currentIndex])

  // Apply EQ preset
  const applyEQ = useCallback((preset: 'flat' | 'bass' | 'vocal' | 'electronic') => {
    if (filtersRef.current.length < 3) return
    
    const [bass, mid, treble] = filtersRef.current
    
    switch (preset) {
      case 'bass':
        bass.gain.setTargetAtTime(12, audioContextRef.current?.currentTime || 0, 0.1)
        mid.gain.setTargetAtTime(0, audioContextRef.current?.currentTime || 0, 0.1)
        treble.gain.setTargetAtTime(2, audioContextRef.current?.currentTime || 0, 0.1)
        break
      case 'vocal':
        bass.gain.setTargetAtTime(-4, audioContextRef.current?.currentTime || 0, 0.1)
        mid.gain.setTargetAtTime(8, audioContextRef.current?.currentTime || 0, 0.1)
        treble.gain.setTargetAtTime(4, audioContextRef.current?.currentTime || 0, 0.1)
        break
      case 'electronic':
        bass.gain.setTargetAtTime(8, audioContextRef.current?.currentTime || 0, 0.1)
        mid.gain.setTargetAtTime(0, audioContextRef.current?.currentTime || 0, 0.1)
        treble.gain.setTargetAtTime(8, audioContextRef.current?.currentTime || 0, 0.1)
        break
      default:
        bass.gain.setTargetAtTime(0, audioContextRef.current?.currentTime || 0, 0.1)
        mid.gain.setTargetAtTime(0, audioContextRef.current?.currentTime || 0, 0.1)
        treble.gain.setTargetAtTime(0, audioContextRef.current?.currentTime || 0, 0.1)
    }
  }, [])

  return {
    currentSong,
    queue,
    currentIndex,
    isPlaying,
    currentTime,
    duration,
    volume,
    volumeBoost,
    isShuffle,
    isRepeat,
    isReady,
    playSong,
    playSongWithQueue,
    togglePlay,
    playNext,
    playPrevious,
    seek,
    setAudioVolume,
    toggleVolumeBoost,
    addToQueue,
    removeFromQueue,
    clearQueue,
    shuffleQueue,
    setQueue,
    setIsShuffle,
    setIsRepeat,
    applyEQ,
    // Expose audio context and source node for visualizer
    audioContext: audioContextRef.current,
    sourceNode: sourceNodeRef.current
  }
}

export default useAudioPlayer

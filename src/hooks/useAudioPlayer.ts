import { useState, useRef, useCallback, useEffect } from 'react'
import { Song } from '../types'
import { loadQueue, saveQueue, getSettings, saveSettings } from '../utils/storage'

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
  
  // Web Audio API refs for volume boost
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const filtersRef = useRef<BiquadFilterNode[]>([])

  // Initialize audio element and Web Audio API
  useEffect(() => {
    const audio = new Audio()
    audioRef.current = audio
    audio.volume = Math.min(volume / 100, 1) // HTML volume max is 1.0

    // Initialize Web Audio API for volume boost
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      audioContextRef.current = new AudioContext()
      
      // Create gain node for volume boost
      gainNodeRef.current = audioContextRef.current.createGain()
      gainNodeRef.current.connect(audioContextRef.current.destination)
      
      // Create EQ filters
      const bass = audioContextRef.current.createBiquadFilter()
      bass.type = 'lowshelf'
      bass.frequency.value = 200
      bass.gain.value = 0
      
      const mid = audioContextRef.current.createBiquadFilter()
      mid.type = 'peaking'
      mid.frequency.value = 1000
      mid.Q.value = 1
      mid.gain.value = 0
      
      const treble = audioContextRef.current.createBiquadFilter()
      treble.type = 'highshelf'
      treble.frequency.value = 3000
      treble.gain.value = 0
      
      filtersRef.current = [bass, mid, treble]
      
      // Connect: audio -> bass -> mid -> treble -> gain -> destination
      bass.connect(mid)
      mid.connect(treble)
      treble.connect(gainNodeRef.current)
      
    } catch (e) {
      console.warn('Web Audio API not supported:', e)
    }

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleLoadedMetadata = () => setDuration(audio.duration || 0)
    const handleEnded = () => handleSongEnded()
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleError = (e: ErrorEvent) => {
      console.error('Audio error:', e)
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
      
      // Clean up Web Audio
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close()
      }
    }
  }, [])

  // Connect audio element to Web Audio API when source changes
  const connectAudioToWebAudio = useCallback(() => {
    if (!audioRef.current || !audioContextRef.current || !gainNodeRef.current) return
    
    // Only connect if not already connected
    if (!sourceNodeRef.current) {
      try {
        sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioRef.current)
        // Connect through EQ filters
        sourceNodeRef.current.connect(filtersRef.current[0])
      } catch (e) {
        // Already connected or other error
        console.log('Audio already connected or error:', e)
      }
    }
  }, [])

  // Apply volume boost
  useEffect(() => {
    if (gainNodeRef.current) {
      // Apply boost: normal volume is 1.0, boost can go to 1.5 (150%)
      const boostMultiplier = volumeBoost ? 1.5 : 1.0
      const finalGain = (volume / 100) * boostMultiplier
      
      // Smooth transition
      gainNodeRef.current.gain.setTargetAtTime(finalGain, audioContextRef.current?.currentTime || 0, 0.1)
    }
    
    // Also set HTML audio volume (capped at 1.0)
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
    if (isRepeat && audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(console.error)
    } else if (currentIndex < queue.length - 1) {
      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)
      const nextSong = queue[nextIndex]
      if (nextSong && audioRef.current) {
        audioRef.current.src = nextSong.audioUrl || ''
        audioRef.current.load()
        setCurrentSong(nextSong)
        connectAudioToWebAudio()
        audioRef.current.play().catch(console.error)
      }
    } else {
      setIsPlaying(false)
      setCurrentTime(0)
    }
  }, [currentIndex, queue, isRepeat, connectAudioToWebAudio])

  // Set queue directly
  const setQueue = useCallback((songs: Song[], startIndex: number = 0) => {
    setQueueState(songs)
    setCurrentIndex(startIndex)
    if (songs[startIndex]) {
      playSong(songs[startIndex], true)
    }
  }, [])

  // Play a specific song
  const playSong = useCallback((song: Song, autoPlay: boolean = true) => {
    if (!audioRef.current) return
    
    console.log('Playing song:', song.title, 'URL:', song.audioUrl)
    
    // If song has no audio URL, we can't play it
    if (!song.audioUrl) {
      console.warn('No audio URL for song:', song.title)
      setCurrentSong(song)
      setIsPlaying(false)
      return
    }

    // Check if same song is already loaded
    if (currentSong?.id === song.id && audioRef.current.src === song.audioUrl) {
      if (autoPlay) {
        connectAudioToWebAudio()
        audioRef.current.play().catch(console.error)
      }
      return
    }

    // Load new song
    audioRef.current.src = song.audioUrl
    audioRef.current.load()
    setCurrentSong(song)
    setCurrentTime(0)
    
    // Connect to Web Audio API for boost
    connectAudioToWebAudio()
    
    if (autoPlay) {
      audioRef.current.play().catch(err => {
        console.error('Failed to play:', err)
        setIsPlaying(false)
      })
    }
  }, [currentSong, connectAudioToWebAudio])

  // Add song to queue and play it
  const playSongWithQueue = useCallback((song: Song, allSongs: Song[] = []) => {
    const songIndex = allSongs.findIndex(s => s.id === song.id)
    const queueSongs = allSongs.slice(Math.max(0, songIndex))
    
    setQueueState(queueSongs)
    setCurrentIndex(0)
    playSong(song)
  }, [playSong])

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    if (!audioRef.current || !currentSong) return
    
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      connectAudioToWebAudio()
      audioRef.current.play().catch(console.error)
    }
  }, [isPlaying, currentSong, connectAudioToWebAudio])

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
      default: // flat
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
    applyEQ
  }
}

export default useAudioPlayer

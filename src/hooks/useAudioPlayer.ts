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
  
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio()
    audioRef.current = audio
    audio.volume = volume / 100

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
    }
  }, [])

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
        audioRef.current.play().catch(console.error)
      }
    } else {
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
        audioRef.current.play().catch(console.error)
      }
      return
    }

    // Load new song
    audioRef.current.src = song.audioUrl
    audioRef.current.load()
    setCurrentSong(song)
    setCurrentTime(0)
    
    if (autoPlay) {
      audioRef.current.play().catch(err => {
        console.error('Failed to play:', err)
        setIsPlaying(false)
      })
    }
  }, [currentSong])

  // Add song to queue and play it
  const playSongWithQueue = useCallback((song: Song, allSongs: Song[] = []) => {
    // Create queue from all songs starting from this one
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
      audioRef.current.play().catch(console.error)
    }
  }, [isPlaying, currentSong])

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
    // If more than 3 seconds in, restart song
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
    if (!audioRef.current) return
    audioRef.current.volume = vol / 100
    setVolume(vol)
    saveSettings({ volume: vol })
  }, [])

  // Add to queue
  const addToQueue = useCallback((song: Song) => {
    setQueueState(prev => [...prev, song])
  }, [])

  // Remove from queue
  const removeFromQueue = useCallback((index: number) => {
    setQueueState(prev => {
      const newQueue = prev.filter((_, i) => i !== index)
      // Adjust current index if needed
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
      
      // Shuffle the rest
      for (let i = rest.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rest[i], rest[j]] = [rest[j], rest[i]]
      }
      
      // Put current at beginning
      return current ? [current, ...rest] : rest
    })
    setCurrentIndex(0)
  }, [currentIndex])

  return {
    currentSong,
    queue,
    currentIndex,
    isPlaying,
    currentTime,
    duration,
    volume,
    isShuffle,
    isRepeat,
    playSong,
    playSongWithQueue,
    togglePlay,
    playNext,
    playPrevious,
    seek,
    setAudioVolume,
    addToQueue,
    removeFromQueue,
    clearQueue,
    shuffleQueue,
    setQueue,
    setIsShuffle,
    setIsRepeat
  }
}

export default useAudioPlayer

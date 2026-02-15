import { useState, useRef, useCallback, useEffect } from 'react'
import { Song, QueueItem } from '../types'

export function useAudioPlayer() {
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(80)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio()
    audioRef.current = audio
    audio.volume = volume / 100

    audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime))
    audio.addEventListener('loadedmetadata', () => setDuration(audio.duration))
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('play', () => setIsPlaying(true))
    audio.addEventListener('pause', () => setIsPlaying(false))
    audio.addEventListener('error', (e) => {
      console.error('Audio error:', e)
      setIsPlaying(false)
    })

    return () => {
      audio.removeEventListener('timeupdate', () => setCurrentTime(audio.currentTime))
      audio.removeEventListener('loadedmetadata', () => setDuration(audio.duration))
      audio.removeEventListener('ended', handleEnded)
      audio.pause()
    }
  }, [])

  // Handle song ended - play next
  const handleEnded = useCallback(() => {
    if (currentIndex < queue.length - 1) {
      playNext()
    } else {
      setIsPlaying(false)
      setCurrentTime(0)
    }
  }, [currentIndex, queue])

  // Play a specific song
  const playSong = useCallback((song: Song, autoPlay: boolean = true) => {
    if (!audioRef.current) return
    
    console.log('Playing song:', song.title, 'URL:', song.audioUrl)
    
    // If song has no audio URL, we can't play it
    if (!song.audioUrl) {
      console.warn('No audio URL for song:', song.title)
      // Still set it as current for display purposes
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
    const queueSongs = allSongs.slice(songIndex).map((s, i) => ({
      ...s,
      queueId: `${s.id}-${Date.now()}-${i}`
    }))
    
    setQueue(queueSongs)
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
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1
      setCurrentIndex(prevIndex)
      playSong(queue[prevIndex])
    }
  }, [currentIndex, queue, playSong])

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
  }, [])

  // Add to queue
  const addToQueue = useCallback((song: Song) => {
    setQueue(prev => [...prev, { ...song, queueId: `${song.id}-${Date.now()}` }])
  }, [])

  // Clear queue
  const clearQueue = useCallback(() => {
    setQueue([])
    setCurrentIndex(-1)
  }, [])

  // Shuffle queue
  const shuffleQueue = useCallback(() => {
    setQueue(prev => {
      const shuffled = [...prev]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      return shuffled
    })
  }, [])

  return {
    currentSong,
    queue,
    currentIndex,
    isPlaying,
    currentTime,
    duration,
    volume,
    playSong,
    playSongWithQueue,
    togglePlay,
    playNext,
    playPrevious,
    seek,
    setAudioVolume,
    addToQueue,
    clearQueue,
    shuffleQueue
  }
}

export default useAudioPlayer

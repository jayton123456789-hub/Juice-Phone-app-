import axios from 'axios'
import { Song } from '../types'
import { getCachedCover, cacheCover } from '../utils/storage'

const API_BASE = 'https://juicewrldapi.com/juicewrld'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000
})

// Get full URL for relative paths
const getFullUrl = (path: string): string => {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  if (path.startsWith('/')) {
    return `https://juicewrldapi.com${path}`
  }
  return `${API_BASE}/${path}`
}

// Get cover art URL for a song path
const getCoverArtUrl = (path?: string): string => {
  if (!path) return ''
  return `${API_BASE}/files/cover-art/?path=${encodeURIComponent(path)}`
}

// Transform API response to our Song type
const transformSong = (data: any): Song => {
  const path = data.path || data.song?.path || data.file_path
  const hasAudio = !!path && (path.endsWith('.mp3') || path.endsWith('.wav') || path.endsWith('.m4a'))
  const songId = String(data.id || data.public_id || data.song?.id || Math.random())
  
  // Get image URL - API returns relative URLs like "/assets/youtube.webp"
  let coverArt = ''
  const rawImageUrl = data.image_url || data.song?.image_url
  if (rawImageUrl) {
    coverArt = getFullUrl(rawImageUrl)
  }
  
  return {
    id: songId,
    title: data.name || data.title || data.song?.name || 'Unknown Title',
    artist: data.credited_artists || data.song?.credited_artists || data.artist || 'Juice WRLD',
    album: data.era?.name || data.song?.era?.name || data.album || 'Unknown Album',
    coverArt: coverArt,
    audioUrl: hasAudio ? `${API_BASE}/files/download/?path=${encodeURIComponent(path)}` : undefined,
    path: path,
    duration: parseDuration(data.length || data.song?.length || data.duration),
    lyrics: data.lyrics || data.song?.lyrics || '',
    hasLyrics: !!(data.lyrics || data.song?.lyrics),
    isFavorite: false
  }
}

// Parse duration string like "3:59" to seconds
const parseDuration = (duration: string | number): number => {
  if (typeof duration === 'number') return duration
  if (!duration) return 0
  const parts = duration.split(':').map(Number)
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  return 0
}

// Fetch cover art with multiple fallback strategies
const fetchCoverWithFallback = async (song: Song): Promise<string> => {
  // Check cache first
  const cached = getCachedCover(song.id)
  if (cached) {
    console.log('Using cached cover for:', song.title)
    return cached
  }
  
  // Strategy 1: Try the song's image_url (from API)
  if (song.coverArt) {
    console.log('Trying API image_url for:', song.title, song.coverArt)
    cacheCover(song.id, song.coverArt)
    return song.coverArt
  }
  
  // Strategy 2: Try cover-art endpoint if we have path
  if (song.path) {
    const coverUrl = getCoverArtUrl(song.path)
    console.log('Trying cover-art endpoint for:', song.title, coverUrl)
    cacheCover(song.id, coverUrl)
    return coverUrl
  }
  
  return ''
}

export const juiceApi = {
  // Get all songs with pagination
  async getSongs(page = 1, pageSize = 50, category?: string): Promise<{ songs: Song[], count: number, hasMore: boolean }> {
    try {
      const params: any = { page, page_size: pageSize }
      if (category) params.category = category
      
      console.log('Fetching songs with params:', params)
      const response = await api.get('/songs/', { params })
      const results = response.data.results || response.data || []
      const count = response.data.count || results.length
      
      console.log(`Got ${results.length} songs from API`)
      
      const songs = results.map(transformSong)
      
      // Fetch cover art for all songs (with fallback)
      const songsWithCovers = await Promise.all(
        songs.map(async (song: Song) => {
          if (!song.coverArt) {
            song.coverArt = await fetchCoverWithFallback(song)
          }
          console.log(`Song: ${song.title}, Cover: ${song.coverArt || 'NONE'}`)
          return song
        })
      )
      
      return {
        songs: songsWithCovers,
        count,
        hasMore: !!response.data.next
      }
    } catch (error) {
      console.error('API error:', error)
      return { songs: getMockSongs(), count: 8, hasMore: false }
    }
  },

  // Search songs
  async searchSongs(query: string, page = 1, pageSize = 50): Promise<{ songs: Song[], count: number, hasMore: boolean }> {
    try {
      console.log('Searching for:', query)
      const response = await api.get('/songs/', { 
        params: { search: query, page, page_size: pageSize }
      })
      const results = response.data.results || response.data || []
      
      const songs = results.map(transformSong)
      
      // Fetch cover art
      const songsWithCovers = await Promise.all(
        songs.map(async (song: Song) => {
          if (!song.coverArt) {
            song.coverArt = await fetchCoverWithFallback(song)
          }
          return song
        })
      )
      
      return {
        songs: songsWithCovers,
        count: response.data.count || results.length,
        hasMore: !!response.data.next
      }
    } catch (error) {
      console.error('Search error:', error)
      const mock = getMockSongs().filter(s => 
        s.title.toLowerCase().includes(query.toLowerCase()) ||
        s.artist.toLowerCase().includes(query.toLowerCase())
      )
      return { songs: mock, count: mock.length, hasMore: false }
    }
  },

  // Get song by ID
  async getSong(id: string): Promise<Song | null> {
    try {
      const response = await api.get(`/songs/${id}/`)
      const song = transformSong(response.data)
      if (!song.coverArt) {
        song.coverArt = await fetchCoverWithFallback(song)
      }
      return song
    } catch (error) {
      console.error('Get song error:', error)
      return null
    }
  },

  // Get random radio song (playable)
  async getRadioSong(): Promise<Song | null> {
    try {
      const response = await api.get('/radio/random/')
      const song = transformSong(response.data)
      if (!song.coverArt) {
        song.coverArt = await fetchCoverWithFallback(song)
      }
      console.log('Radio song cover:', song.coverArt)
      return song
    } catch (error) {
      console.error('Radio error:', error)
      const mock = getMockSongs()
      return mock[Math.floor(Math.random() * mock.length)]
    }
  },

  // Get multiple radio songs for queue
  async getRadioSongs(count: number = 10): Promise<Song[]> {
    const songs: Song[] = []
    for (let i = 0; i < count; i++) {
      const song = await this.getRadioSong()
      if (song) songs.push(song)
    }
    return songs
  },

  // Get stats
  async getStats(): Promise<any> {
    try {
      const response = await api.get('/stats/')
      return response.data
    } catch (error) {
      return null
    }
  },

  // Get file info (for checking if file has audio/cover)
  async getFileInfo(path: string): Promise<any> {
    try {
      const response = await api.get('/files/info/', { params: { path } })
      return response.data
    } catch (error) {
      return null
    }
  }
}

// Mock data fallback
function getMockSongs(): Song[] {
  return [
    { id: '1', title: 'Lucid Dreams', artist: 'Juice WRLD', album: 'Goodbye & Good Riddance', duration: 239, hasLyrics: true },
    { id: '2', title: 'All Girls Are The Same', artist: 'Juice WRLD', album: 'Goodbye & Good Riddance', duration: 166, hasLyrics: true },
    { id: '3', title: 'Legends', artist: 'Juice WRLD', album: 'WRLD ON DRUGS', duration: 192, hasLyrics: true },
    { id: '4', title: 'Robbery', artist: 'Juice WRLD', album: 'Death Race for Love', duration: 240, hasLyrics: true },
    { id: '5', title: 'Hear Me Calling', artist: 'Juice WRLD', album: 'Death Race for Love', duration: 195, hasLyrics: true },
    { id: '6', title: 'Bandit', artist: 'Juice WRLD ft. NBA YoungBoy', album: 'Single', duration: 189, hasLyrics: true },
    { id: '7', title: 'Wasted', artist: 'Juice WRLD ft. Lil Uzi Vert', album: 'Goodbye & Good Riddance', duration: 221, hasLyrics: true },
    { id: '8', title: 'Lean Wit Me', artist: 'Juice WRLD', album: 'Goodbye & Good Riddance', duration: 178, hasLyrics: true },
  ]
}

export default juiceApi

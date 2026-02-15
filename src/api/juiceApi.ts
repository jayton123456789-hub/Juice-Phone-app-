import axios from 'axios'
import { Song, QueueItem } from '../types'

const API_BASE = 'https://juicewrldapi.com/juicewrld'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000
})

// Transform API response to our Song type
const transformSong = (data: any): Song => {
  const path = data.path || data.song?.path
  const hasAudio = !!path && path.endsWith('.mp3')
  
  return {
    id: String(data.id || data.public_id || Math.random()),
    title: data.name || data.title || 'Unknown Title',
    artist: data.credited_artists || data.song?.credited_artists || 'Juice WRLD',
    album: data.era?.name || data.song?.era?.name || 'Unknown Album',
    coverArt: data.image_url || data.song?.image_url || '',
    audioUrl: hasAudio ? `${API_BASE}/files/download/?path=${encodeURIComponent(path)}` : undefined,
    path: path,
    duration: parseDuration(data.length || data.song?.length),
    lyrics: data.lyrics || data.song?.lyrics || '',
    hasLyrics: !!(data.lyrics || data.song?.lyrics),
    isFavorite: false
  }
}

// Parse duration string like "3:59" to seconds
const parseDuration = (duration: string): number => {
  if (!duration) return 0
  const parts = duration.split(':').map(Number)
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  return 0
}

export const juiceApi = {
  // Get all songs with pagination
  async getSongs(page = 1, pageSize = 50, category?: string): Promise<{ songs: Song[], count: number, hasMore: boolean }> {
    try {
      const params: any = { page, page_size: pageSize }
      if (category) params.category = category
      
      const response = await api.get('/songs/', { params })
      const results = response.data.results || response.data || []
      const count = response.data.count || results.length
      
      return {
        songs: results.map(transformSong),
        count,
        hasMore: !!response.data.next
      }
    } catch (error) {
      console.log('API error:', error)
      return { songs: getMockSongs(), count: 8, hasMore: false }
    }
  },

  // Search songs
  async searchSongs(query: string, page = 1, pageSize = 50): Promise<{ songs: Song[], count: number, hasMore: boolean }> {
    try {
      const response = await api.get('/songs/', { 
        params: { search: query, page, page_size: pageSize }
      })
      const results = response.data.results || response.data || []
      
      return {
        songs: results.map(transformSong),
        count: response.data.count || results.length,
        hasMore: !!response.data.next
      }
    } catch (error) {
      console.log('Search error:', error)
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
      return transformSong(response.data)
    } catch (error) {
      console.log('Get song error:', error)
      return null
    }
  },

  // Get random radio song (playable)
  async getRadioSong(): Promise<Song | null> {
    try {
      const response = await api.get('/radio/random/')
      return transformSong(response.data)
    } catch (error) {
      console.log('Radio error:', error)
      const mock = getMockSongs()
      return mock[Math.floor(Math.random() * mock.length)]
    }
  },

  // Get cover art URL for a song
  getCoverArtUrl(path: string): string {
    if (!path) return ''
    return `${API_BASE}/files/cover-art/?path=${encodeURIComponent(path)}`
  },

  // Stream audio URL
  getAudioUrl(path: string): string {
    if (!path) return ''
    return `${API_BASE}/files/download/?path=${encodeURIComponent(path)}`
  },

  // Get stats
  async getStats(): Promise<any> {
    try {
      const response = await api.get('/stats/')
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

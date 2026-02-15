import axios from 'axios'
import { Song, Era, SongsApiResponse, CategoriesApiResponse, StatsApiResponse, RadioApiResponse } from '../types'
import { getCachedCover, cacheCover, getCachedData, cacheData } from '../utils/storage'

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

// Parse duration string like "3:59" to seconds
const parseDuration = (duration: string | number): number => {
  if (typeof duration === 'number') return duration
  if (!duration) return 0
  const parts = duration.split(':').map(Number)
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  return 0
}

// Transform API response to our Song type - WITH ALL METADATA
const transformSong = (data: any): Song => {
  const source = data.song || data  // Handle nested song object from radio API
  const path = source.path || data.path
  const hasAudio = !!path && (path.endsWith('.mp3') || path.endsWith('.wav') || path.endsWith('.m4a'))
  const songId = String(source.id || source.public_id || Math.random())
  
  // Get image URL - API returns relative URLs like "/assets/youtube.webp"
  let coverArt = ''
  const rawImageUrl = source.image_url || data.image_url
  if (rawImageUrl) {
    coverArt = getFullUrl(rawImageUrl)
  }
  
  // Parse category - normalize to lowercase
  const category = source.category?.toLowerCase() || 'unknown'
  const releaseStatus = category as 'released' | 'unreleased' | 'unsurfaced' | 'recording_session'
  
  // Parse release date and year
  const releaseDate = source.release_date || source.releaseDate
  let releaseYear: number | undefined
  if (releaseDate) {
    const parsed = new Date(releaseDate)
    if (!isNaN(parsed.getTime())) {
      releaseYear = parsed.getFullYear()
    }
  }
  // Fallback: try to extract year from era time_frame
  if (!releaseYear && source.era?.time_frame) {
    const match = source.era.time_frame.match(/(\d{4})/)
    if (match) {
      releaseYear = parseInt(match[1])
    }
  }
  
  return {
    // Core identifiers
    id: songId,
    public_id: source.public_id,
    
    // Basic info
    title: source.name || source.title || 'Unknown Title',
    name: source.name,
    original_key: source.original_key,
    
    // Artist info
    artist: source.credited_artists || 'Juice WRLD',
    credited_artists: source.credited_artists,
    producers: source.producers,
    engineers: source.engineers,
    
    // Categorization
    category: category,
    era: source.era ? {
      id: source.era.id,
      name: source.era.name,
      description: source.era.description || '',
      time_frame: source.era.time_frame || '',
      play_count: source.era.play_count
    } : undefined,
    
    // Album/Project
    album: source.era?.name || 'Unknown Project',
    track_titles: source.track_titles,
    
    // Media
    coverArt: coverArt,
    image_url: rawImageUrl,
    audioUrl: hasAudio ? `${API_BASE}/files/download/?path=${encodeURIComponent(path)}` : undefined,
    path: path,
    
    // Duration & technical
    duration: parseDuration(source.length || source.duration),
    length: source.length,
    bitrate: source.bitrate,
    
    // Content
    lyrics: source.lyrics || '',
    hasLyrics: !!(source.lyrics && source.lyrics.length > 10),
    snippets: source.snippets,
    
    // Release info
    release_date: releaseDate,
    releaseDate: releaseDate,
    release_year: releaseYear,
    release_status: releaseStatus,
    preview_date: source.preview_date,
    date_leaked: source.date_leaked,
    leak_type: source.leak_type,
    
    // Recording info
    recording_locations: source.recording_locations,
    record_dates: source.record_dates,
    session_titles: source.session_titles,
    session_tracking: source.session_tracking,
    
    // File info
    file_names: source.file_names,
    file_names_array: source.file_names_array,
    instrumentals: source.instrumentals,
    instrumental_names: source.instrumental_names,
    
    // Additional
    additional_information: source.additional_information,
    notes: source.notes,
    dates: source.dates,
    
    // User data
    isFavorite: false
  }
}

// Fetch cover art with multiple fallback strategies
const fetchCoverWithFallback = async (song: Song): Promise<string> => {
  // Check cache first
  const cached = getCachedCover(String(song.id))
  if (cached) {
    return cached
  }
  
  // Strategy 1: Try the song's image_url (from API)
  if (song.coverArt) {
    cacheCover(String(song.id), song.coverArt)
    return song.coverArt
  }
  
  // Strategy 2: Try cover-art endpoint if we have path
  if (song.path) {
    const coverUrl = getCoverArtUrl(song.path)
    cacheCover(String(song.id), coverUrl)
    return coverUrl
  }
  
  return ''
}

export const juiceApi = {
  // Get all songs with pagination and filtering
  async getSongs(
    page = 1, 
    pageSize = 50, 
    category?: string,
    era?: string,
    search?: string
  ): Promise<{ songs: Song[], count: number, hasMore: boolean }> {
    try {
      const params: any = { page, page_size: pageSize }
      
      // Add category filter - API expects lowercase
      if (category && category !== 'all') {
        params.category = category.toLowerCase()
      }
      
      // Add era filter
      if (era && era !== 'all') {
        params.era = era
      }
      
      // Add search
      if (search) {
        params.search = search
      }
      
      console.log('[API] Fetching songs with params:', params)
      
      const response = await api.get<SongsApiResponse>('/songs/', { params })
      const results = response.data.results || []
      const count = response.data.count || results.length
      
      console.log(`[API] Got ${results.length} songs, total: ${count}`)
      
      const songs = results.map(transformSong)
      
      // Fetch cover art for all songs (with fallback)
      const songsWithCovers = await Promise.all(
        songs.map(async (song) => {
          if (!song.coverArt) {
            song.coverArt = await fetchCoverWithFallback(song)
          }
          return song
        })
      )
      
      return {
        songs: songsWithCovers,
        count: count,
        hasMore: !!response.data.next
      }
    } catch (error) {
      console.error('[API] Error fetching songs:', error)
      return { songs: [], count: 0, hasMore: false }
    }
  },

  // Get categories (Released, Unreleased, etc.)
  async getCategories(): Promise<{ value: string; label: string }[]> {
    try {
      const cached = getCachedData('categories')
      if (cached) return cached
      
      const response = await api.get<CategoriesApiResponse>('/categories/')
      const categories = response.data.categories || []
      
      cacheData('categories', categories)
      return categories
    } catch (error) {
      console.error('[API] Error fetching categories:', error)
      // Return default categories
      return [
        { value: 'released', label: 'Released' },
        { value: 'unreleased', label: 'Unreleased' },
        { value: 'unsurfaced', label: 'Unsurfaced' },
        { value: 'recording_session', label: 'Studio Sessions' }
      ]
    }
  },

  // Get eras (GBGR, DRFL, etc.)
  async getEras(): Promise<Era[]> {
    try {
      const cached = getCachedData('eras')
      if (cached) return cached
      
      const response = await api.get<Era[]>('/eras/')
      const eras = response.data || []
      
      cacheData('eras', eras)
      return eras
    } catch (error) {
      console.error('[API] Error fetching eras:', error)
      return []
    }
  },

  // Get statistics
  async getStats(): Promise<StatsApiResponse | null> {
    try {
      const response = await api.get<StatsApiResponse>('/stats/')
      return response.data
    } catch (error) {
      console.error('[API] Error fetching stats:', error)
      return null
    }
  },

  // Search songs
  async searchSongs(
    query: string, 
    page = 1, 
    pageSize = 50,
    searchType: 'search' | 'searchall' | 'lyrics' = 'search'
  ): Promise<{ songs: Song[], count: number, hasMore: boolean }> {
    try {
      console.log('[API] Searching for:', query, 'type:', searchType)
      
      const params: any = { page, page_size: pageSize }
      params[searchType] = query
      
      const response = await api.get<SongsApiResponse>('/songs/', { params })
      const results = response.data.results || []
      
      const songs = results.map(transformSong)
      
      // Fetch cover art
      const songsWithCovers = await Promise.all(
        songs.map(async (song) => {
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
      console.error('[API] Search error:', error)
      return { songs: [], count: 0, hasMore: false }
    }
  },

  // Get song by ID with full metadata
  async getSong(id: string): Promise<Song | null> {
    try {
      const response = await api.get(`/songs/${id}/`)
      const song = transformSong(response.data)
      
      if (!song.coverArt) {
        song.coverArt = await fetchCoverWithFallback(song)
      }
      
      return song
    } catch (error) {
      console.error('[API] Get song error:', error)
      return null
    }
  },

  // Get random radio song (playable)
  async getRadioSong(): Promise<Song | null> {
    try {
      const response = await api.get<RadioApiResponse>('/radio/random/')
      const song = transformSong(response.data)
      
      if (!song.coverArt) {
        song.coverArt = await fetchCoverWithFallback(song)
      }
      
      return song
    } catch (error) {
      console.error('[API] Radio error:', error)
      return null
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

  // Get file info (for checking if file has audio/cover)
  async getFileInfo(path: string): Promise<any> {
    try {
      const response = await api.get('/files/info/', { params: { path } })
      return response.data
    } catch (error) {
      console.error('[API] Get file info error:', error)
      return null
    }
  },

  // Quick search by era
  async searchByEra(eraName: string, page = 1): Promise<{ songs: Song[], count: number }> {
    return this.getSongs(page, 50, undefined, eraName)
  },

  // Quick search by category
  async searchByCategory(category: string, page = 1): Promise<{ songs: Song[], count: number }> {
    return this.getSongs(page, 50, category)
  }
}

export default juiceApi

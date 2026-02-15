export interface Era {
  id: number
  name: string
  description: string
  time_frame: string
  play_count?: number
}

export interface Song {
  // Core identifiers
  id: string | number
  public_id?: number
  
  // Basic info
  title: string
  name?: string  // API uses 'name'
  original_key?: string
  
  // Artist info
  artist: string
  credited_artists?: string
  producers?: string
  engineers?: string
  
  // Categorization
  category: 'released' | 'unreleased' | 'unsurfaced' | 'recording_session' | string
  era?: Era
  
  // Album/Project
  album?: string
  track_titles?: string[]
  
  // Media
  coverArt?: string
  image_url?: string
  audioUrl?: string
  path?: string
  
  // Duration & technical
  duration?: number
  length?: string
  bitrate?: string
  
  // Content
  lyrics?: string
  hasLyrics?: boolean
  snippets?: string[]
  
  // Release info
  release_date?: string
  releaseDate?: string
  release_year?: number
  release_status?: 'released' | 'unreleased' | 'unsurfaced' | 'recording_session'
  preview_date?: string
  date_leaked?: string
  leak_type?: string
  
  // Recording info
  recording_locations?: string
  record_dates?: string
  session_titles?: string
  session_tracking?: string
  
  // File info
  file_names?: string
  file_names_array?: string[]
  instrumentals?: string
  instrumental_names?: string
  
  // Additional
  additional_information?: string
  notes?: string
  dates?: string
  
  // User data
  isFavorite?: boolean
}

export interface QueueItem extends Song {
  queueId: string
}

export interface User {
  id: string
  username: string
  displayName: string
  avatar?: string
  createdAt: number
}

export interface Album {
  id: string
  name: string
  artist: string
  coverArt: string
  year?: string
  songs?: Song[]
}

export interface Artist {
  id: string
  name: string
  image?: string
  albums?: Album[]
}

export interface Playlist {
  id: string
  name: string
  description?: string
  coverArt?: string
  songs: Song[]
  createdAt: number
}

// API Response types
export interface SongsApiResponse {
  count: number
  next: string | null
  previous: string | null
  results: Song[]
}

export interface Category {
  value: string
  label: string
}

export interface CategoriesApiResponse {
  categories: Category[]
}

export interface StatsApiResponse {
  total_songs: number
  category_stats: Record<string, number>
  era_stats: Record<string, number>
}

export interface RadioApiResponse {
  id: string
  title: string
  path: string
  size: number
  modified: string
  hash: string
  song: Song
}

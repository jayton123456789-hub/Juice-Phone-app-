// Centralized storage management with versioning and clearing

const STORAGE_VERSION = '2.0'
const VERSION_KEY = 'juicephone_version'

export const StorageKeys = {
  USER: 'juicephone_user',
  FAVORITES: 'favorites',
  RECENTLY_PLAYED: 'recentlyPlayed',
  QUEUE: 'queue',
  PLAYLISTS: 'playlists',
  SETTINGS: 'settings',
  COVER_CACHE: 'coverCache',
  CURRENT_SONG: 'currentSong',
  CURRENT_TIME: 'currentTime',
  VOLUME: 'volume',
  SHUFFLE: 'shuffle',
  REPEAT: 'repeat',
} as const

export interface AppSettings {
  theme: 'dark' | 'light' | 'auto'
  volume: number
  autoplay: boolean
  sleepTimer: number | null
  showVisualizer: boolean
  compactMode: boolean
  skipIntro: boolean
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  volume: 80,
  autoplay: true,
  sleepTimer: null,
  showVisualizer: false,
  compactMode: false,
  skipIntro: false,
}

// Check and migrate storage version
export function checkStorageVersion(): void {
  const currentVersion = localStorage.getItem(VERSION_KEY)
  if (currentVersion !== STORAGE_VERSION) {
    console.log('Storage version mismatch, clearing old data...')
    clearAllData()
    localStorage.setItem(VERSION_KEY, STORAGE_VERSION)
  }
}

// Clear ALL app data
export function clearAllData(): void {
  Object.values(StorageKeys).forEach(key => {
    localStorage.removeItem(key)
  })
  console.log('All data cleared')
}

// Settings helpers
export function getSettings(): AppSettings {
  const stored = localStorage.getItem(StorageKeys.SETTINGS)
  if (stored) {
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
    } catch (e) {
      console.error('Failed to parse settings:', e)
    }
  }
  return DEFAULT_SETTINGS
}

export function saveSettings(settings: Partial<AppSettings>): void {
  const current = getSettings()
  localStorage.setItem(StorageKeys.SETTINGS, JSON.stringify({ ...current, ...settings }))
}

// Cover art cache
export function getCachedCover(songId: string): string | null {
  const cache = JSON.parse(localStorage.getItem(StorageKeys.COVER_CACHE) || '{}')
  const entry = cache[songId]
  if (entry && Date.now() - entry.timestamp < 7 * 24 * 60 * 60 * 1000) { // 7 days
    return entry.url
  }
  return null
}

export function cacheCover(songId: string, url: string): void {
  const cache = JSON.parse(localStorage.getItem(StorageKeys.COVER_CACHE) || '{}')
  cache[songId] = { url, timestamp: Date.now() }
  localStorage.setItem(StorageKeys.COVER_CACHE, JSON.stringify(cache))
}

// Playlist management
export interface Playlist {
  id: string
  name: string
  description?: string
  songIds: string[]
  createdAt: number
  updatedAt: number
}

export function getPlaylists(): Playlist[] {
  const stored = localStorage.getItem(StorageKeys.PLAYLISTS)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch (e) {
      console.error('Failed to parse playlists:', e)
    }
  }
  return []
}

export function savePlaylist(playlist: Playlist): void {
  const playlists = getPlaylists()
  const index = playlists.findIndex(p => p.id === playlist.id)
  if (index >= 0) {
    playlists[index] = { ...playlist, updatedAt: Date.now() }
  } else {
    playlists.push({ ...playlist, createdAt: Date.now(), updatedAt: Date.now() })
  }
  localStorage.setItem(StorageKeys.PLAYLISTS, JSON.stringify(playlists))
}

export function deletePlaylist(id: string): void {
  const playlists = getPlaylists().filter(p => p.id !== id)
  localStorage.setItem(StorageKeys.PLAYLISTS, JSON.stringify(playlists))
}

// Queue persistence
export function saveQueue(queue: any[], currentIndex: number): void {
  localStorage.setItem(StorageKeys.QUEUE, JSON.stringify({ queue, currentIndex }))
}

export function loadQueue(): { queue: any[], currentIndex: number } | null {
  const stored = localStorage.getItem(StorageKeys.QUEUE)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch (e) {
      console.error('Failed to parse queue:', e)
    }
  }
  return null
}

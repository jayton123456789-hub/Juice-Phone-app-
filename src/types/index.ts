export interface Song {
  id: string
  title: string
  artist: string
  album?: string
  coverArt?: string
  audioUrl?: string
  path?: string
  duration?: number
  lyrics?: string
  hasLyrics?: boolean
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

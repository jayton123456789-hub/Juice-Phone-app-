export interface Song {
  id: string
  title: string
  artist: string
  album?: string
  coverArt?: string
  audioUrl?: string
  duration?: number
  lyrics?: LyricLine[]
  isFavorite?: boolean
}

export interface LyricLine {
  time: number
  text: string
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
  createdAt: Date
}

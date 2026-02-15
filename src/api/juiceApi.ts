import axios from 'axios'
import { Song, Album, Artist } from '../types'

const API_BASE = 'https://juicewrldapi.com/api'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000
})

// Transform API response to our Song type
const transformSong = (data: any): Song => ({
  id: data.id || data._id || String(Math.random()),
  title: data.title || data.name || 'Unknown Title',
  artist: data.artist?.name || data.artist || 'Juice WRLD',
  album: data.album?.name || data.album,
  coverArt: data.album?.image || data.coverArt || data.image,
  audioUrl: data.audioUrl || data.audio,
  duration: data.duration || data.length,
})

export const juiceApi = {
  // Get all songs
  async getSongs(limit = 50): Promise<Song[]> {
    try {
      const response = await api.get('/songs', { params: { limit } })
      return (response.data.songs || response.data || []).map(transformSong)
    } catch (error) {
      console.error('Error fetching songs:', error)
      return getMockSongs()
    }
  },

  // Search songs
  async searchSongs(query: string): Promise<Song[]> {
    try {
      const response = await api.get('/search', { params: { q: query } })
      return (response.data.songs || response.data || []).map(transformSong)
    } catch (error) {
      console.error('Error searching songs:', error)
      return getMockSongs().filter(s => 
        s.title.toLowerCase().includes(query.toLowerCase())
      )
    }
  },

  // Get song by ID
  async getSong(id: string): Promise<Song | null> {
    try {
      const response = await api.get(`/songs/${id}`)
      return transformSong(response.data)
    } catch (error) {
      console.error('Error fetching song:', error)
      return null
    }
  },

  // Get song lyrics
  async getLyrics(songId: string): Promise<{ time: number; text: string }[]> {
    try {
      const response = await api.get(`/songs/${songId}/lyrics`)
      return response.data.lyrics || []
    } catch (error) {
      console.error('Error fetching lyrics:', error)
      return getMockLyrics()
    }
  },

  // Get albums
  async getAlbums(): Promise<Album[]> {
    try {
      const response = await api.get('/albums')
      return response.data.albums || response.data || []
    } catch (error) {
      console.error('Error fetching albums:', error)
      return getMockAlbums()
    }
  },

  // Get artists
  async getArtists(): Promise<Artist[]> {
    try {
      const response = await api.get('/artists')
      return response.data.artists || response.data || []
    } catch (error) {
      console.error('Error fetching artists:', error)
      return []
    }
  }
}

// Mock data for when API fails
function getMockSongs(): Song[] {
  return [
    { id: '1', title: 'Lucid Dreams', artist: 'Juice WRLD', album: 'Goodbye & Good Riddance' },
    { id: '2', title: 'All Girls Are The Same', artist: 'Juice WRLD', album: 'Goodbye & Good Riddance' },
    { id: '3', title: 'Legends', artist: 'Juice WRLD', album: 'Future & Juice WRLD Present... WRLD ON DRUGS' },
    { id: '4', title: 'Robbery', artist: 'Juice WRLD', album: 'Death Race for Love' },
    { id: '5', title: 'Hear Me Calling', artist: 'Juice WRLD', album: 'Death Race for Love' },
    { id: '6', title: 'Bandit', artist: 'Juice WRLD', album: 'Single' },
    { id: '7', title: 'Wasted', artist: 'Juice WRLD', album: 'Goodbye & Good Riddance' },
    { id: '8', title: 'Lean Wit Me', artist: 'Juice WRLD', album: 'Goodbye & Good Riddance' },
  ]
}

function getMockLyrics() {
  return [
    { time: 0, text: "I still see your shadows in my room" },
    { time: 4, text: "Can't take back the love that I gave you" },
    { time: 8, text: "It's to the point where I love and I hate you" },
    { time: 12, text: "And I cannot change you, so I must replace you, oh" },
    { time: 17, text: "Easier said than done" },
    { time: 19, text: "I thought you were the one" },
    { time: 21, text: "Listenin' to my heart instead of my head" },
  ]
}

function getMockAlbums(): Album[] {
  return [
    { id: '1', name: 'Goodbye & Good Riddance', artist: 'Juice WRLD', coverArt: '', year: '2018' },
    { id: '2', name: 'Death Race for Love', artist: 'Juice WRLD', coverArt: '', year: '2019' },
    { id: '3', name: 'Legends Never Die', artist: 'Juice WRLD', coverArt: '', year: '2020' },
    { id: '4', name: 'Fighting Demons', artist: 'Juice WRLD', coverArt: '', year: '2021' },
  ]
}

export default juiceApi

import { useState, useEffect, useCallback } from 'react'
import { HiSearch, HiX } from 'react-icons/hi'
import { juiceApi } from '../api/juiceApi'
import CoverImage from '../components/CoverImage'
import { Song } from '../types'
import './Search.css'

interface SearchProps {
  onSongSelect: (song: Song) => void
}

export default function Search({ onSongSelect }: SearchProps) {
  const [query, setQuery] = useState('')
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSongs([])
      setHasSearched(false)
      return
    }

    setLoading(true)
    setHasSearched(true)
    
    try {
      const result = await juiceApi.searchSongs(searchQuery, 1, 50)
      console.log('Search results:', result.songs.length)
      setSongs(result.songs)
    } catch (error) {
      console.error('Search error:', error)
      setSongs([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      search(query)
    }, 300)
    return () => clearTimeout(timeout)
  }, [query, search])

  const clearSearch = () => {
    setQuery('')
    setSongs([])
    setHasSearched(false)
  }

  return (
    <div className="page search">
      <h1 className="search-title">Search</h1>
      
      <div className="search-box">
        <HiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search songs, artists, albums..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        {query && (
          <button className="clear-btn" onClick={clearSearch}>
            <HiX />
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading-state">Searching...</div>
      ) : hasSearched ? (
        <div className="search-results">
          {songs.length > 0 ? (
            <>
              <div className="results-header">
                <h3>Songs</h3>
                <span className="results-count">{songs.length} results</span>
              </div>
              <div className="result-list">
                {songs.map((song) => (
                  <div 
                    key={song.id} 
                    className="result-item"
                    onClick={() => onSongSelect(song)}
                  >
                    <CoverImage 
                      src={song.coverArt}
                      alt={song.title}
                      size="small"
                    />
                    <div className="result-info">
                      <h4>{song.title}</h4>
                      <p>{song.artist} • {song.album}</p>
                    </div>
                    {song.duration && (
                      <span className="song-duration">
                        {formatDuration(song.duration)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="no-results">
              <p>No songs found for "{query}"</p>
              <span className="no-results-hint">Try different keywords</span>
            </div>
          )}
        </div>
      ) : (
        <div className="search-empty">
          <div className="search-icon-large">🔍</div>
          <h3>Find your favorite songs</h3>
          <p>Search by song title, artist, or album name</p>
        </div>
      )}
    </div>
  )
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

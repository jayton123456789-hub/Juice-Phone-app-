import { useState, useEffect, useCallback } from 'react'
import { HiSearch, HiX } from 'react-icons/hi'
import { juiceApi } from '../api/juiceApi'
import { Song } from '../types'
import './Search.css'

interface SearchProps {
  onSongSelect: (song: Song) => void
}

export default function Search({ onSongSelect }: SearchProps) {
  const [query, setQuery] = useState('')
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSongs([])
      return
    }

    setLoading(true)
    const results = await juiceApi.searchSongs(searchQuery)
    setSongs(results)
    setLoading(false)

    // Save to recent searches
    if (!recentSearches.includes(searchQuery)) {
      const updated = [searchQuery, ...recentSearches].slice(0, 5)
      setRecentSearches(updated)
      localStorage.setItem('recentSearches', JSON.stringify(updated))
    }
  }, [recentSearches])

  useEffect(() => {
    const timeout = setTimeout(() => {
      search(query)
    }, 300)
    return () => clearTimeout(timeout)
  }, [query, search])

  const clearSearch = () => {
    setQuery('')
    setSongs([])
  }

  const removeRecentSearch = (term: string) => {
    const updated = recentSearches.filter(s => s !== term)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  return (
    <div className="page search">
      <h1 className="search-title">Search</h1>
      
      <div className="search-box">
        <HiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Songs, artists, albums..."
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
      ) : query ? (
        <div className="search-results">
          {songs.length > 0 ? (
            <>
              <h3>Songs</h3>
              <div className="result-list">
                {songs.map((song) => (
                  <div 
                    key={song.id} 
                    className="result-item"
                    onClick={() => onSongSelect(song)}
                  >
                    <div className="result-cover">
                      {song.coverArt ? (
                        <img src={song.coverArt} alt={song.title} />
                      ) : (
                        <div className="cover-placeholder-small">🎵</div>
                      )}
                    </div>
                    <div className="result-info">
                      <h4>{song.title}</h4>
                      <p>{song.artist} • {song.album}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="no-results">
              <p>No results found for "{query}"</p>
            </div>
          )}
        </div>
      ) : (
        <div className="recent-searches">
          <h3>Recent Searches</h3>
          {recentSearches.length > 0 ? (
            <div className="recent-list">
              {recentSearches.map((term) => (
                <div key={term} className="recent-item-search">
                  <span onClick={() => setQuery(term)}>{term}</span>
                  <button onClick={() => removeRecentSearch(term)}>
                    <HiX />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-text">No recent searches</p>
          )}

          <div className="browse-categories">
            <h3>Browse Categories</h3>
            <div className="category-grid">
              <CategoryCard title="Hip Hop" color="#ff006e" />
              <CategoryCard title="Emo Rap" color="#8338ec" />
              <CategoryCard title="Pop" color="#00f5ff" />
              <CategoryCard title="Rock" color="#ff4d00" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CategoryCard({ title, color }: { title: string; color: string }) {
  return (
    <div className="category-card" style={{ background: color }}>
      <span>{title}</span>
    </div>
  )
}

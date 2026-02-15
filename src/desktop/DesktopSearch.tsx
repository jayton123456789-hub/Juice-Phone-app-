import { useState, useEffect } from 'react'
import { Search as SearchIcon, X, Play, Disc, TrendingUp, Clock, Music } from 'lucide-react'
import { juiceApi } from '../api/juiceApi'
import { Song, Era } from '../types'
import './DesktopSearch.css'

interface DesktopSearchProps {
  onSongSelect: (song: Song) => void
  initialQuery?: string
}

export default function DesktopSearch({ onSongSelect, initialQuery = '' }: DesktopSearchProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [searchResults, setSearchResults] = useState<Song[]>([])
  const [eras, setEras] = useState<Era[]>([])
  const [searching, setSearching] = useState(false)
  const [searchType, setSearchType] = useState<'search' | 'searchall' | 'lyrics'>('searchall')
  const [hasSearched, setHasSearched] = useState(false)

  // Load eras on mount
  useEffect(() => {
    const loadEras = async () => {
      const loadedEras = await juiceApi.getEras()
      setEras(Array.isArray(loadedEras) ? loadedEras : [])
    }
    loadEras()
  }, [])

  // Update search when initialQuery changes
  useEffect(() => {
    if (initialQuery && initialQuery !== searchQuery) {
      setSearchQuery(initialQuery)
    }
  }, [initialQuery])

  // Debounced search
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([])
      setHasSearched(false)
      return
    }

    const timer = setTimeout(() => {
      performSearch()
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery, searchType])

  const performSearch = async () => {
    if (searchQuery.trim().length < 2) return

    setSearching(true)
    setHasSearched(true)

    try {
      console.log('[Search] Searching for:', searchQuery, 'type:', searchType)
      const { songs } = await juiceApi.searchSongs(searchQuery, 1, 50, searchType)
      console.log('[Search] Results:', songs.length)
      setSearchResults(Array.isArray(songs) ? songs : [])
    } catch (err) {
      console.error('[Search] Error:', err)
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const quickSearchEra = async (eraName: string) => {
    setSearchQuery(eraName)
    setSearchType('search')
    setSearching(true)
    setHasSearched(true)

    try {
      const { songs } = await juiceApi.searchByEra(eraName)
      setSearchResults(Array.isArray(songs) ? songs : [])
    } catch (err) {
      console.error('[Search] Era search error:', err)
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
    setHasSearched(false)
  }

  return (
    <div className="desktop-search">
      {/* Search Header */}
      <div className="search-header">
        <div className="search-input-wrapper">
          <SearchIcon size={20} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search songs, artists, producers, or lyrics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          {searchQuery && (
            <button className="search-clear-btn" onClick={clearSearch}>
              <X size={18} />
            </button>
          )}
        </div>

        {/* Search Type Filters */}
        <div className="search-filters">
          <button
            className={`search-filter-btn ${searchType === 'searchall' ? 'active' : ''}`}
            onClick={() => setSearchType('searchall')}
          >
            <Music size={16} />
            <span>All Fields</span>
          </button>
          <button
            className={`search-filter-btn ${searchType === 'search' ? 'active' : ''}`}
            onClick={() => setSearchType('search')}
          >
            <Disc size={16} />
            <span>Title & Artist</span>
          </button>
          <button
            className={`search-filter-btn ${searchType === 'lyrics' ? 'active' : ''}`}
            onClick={() => setSearchType('lyrics')}
          >
            <TrendingUp size={16} />
            <span>Lyrics</span>
          </button>
        </div>
      </div>

      {/* Quick Search Era Chips */}
      {!hasSearched && eras.length > 0 && (
        <div className="quick-search-section">
          <h3>Quick Search by Era</h3>
          <div className="quick-search-chips">
            {eras.slice(0, 8).map(era => (
              <button
                key={era.id}
                className="quick-search-chip"
                onClick={() => quickSearchEra(era.name)}
              >
                <Clock size={14} />
                <span>{era.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      <div className="search-results">
        {searching && (
          <div className="search-loading">
            <div className="loading-spinner" />
            <p>Searching...</p>
          </div>
        )}

        {!searching && hasSearched && searchResults.length === 0 && (
          <div className="search-empty">
            <SearchIcon size={48} opacity={0.3} />
            <p>No results found</p>
            <span>Try a different search term or filter</span>
          </div>
        )}

        {!searching && searchResults.length > 0 && (
          <>
            <div className="search-results-header">
              <h3>{searchResults.length} results for "{searchQuery}"</h3>
            </div>
            <div className="search-results-grid">
              {searchResults.map((song, index) => (
                <div
                  key={`${song.id}-${index}`}
                  className="search-result-card"
                  onClick={() => onSongSelect(song)}
                >
                  <div className="search-result-cover">
                    {song.coverArt ? (
                      <img src={song.coverArt} alt={song.title} />
                    ) : (
                      <div className="search-result-placeholder">
                        <Disc size={32} opacity={0.5} />
                      </div>
                    )}
                    <div className="search-result-overlay">
                      <button className="search-result-play-btn">
                        <Play size={24} fill="currentColor" />
                      </button>
                    </div>
                  </div>

                  <div className="search-result-info">
                    <h4 className="search-result-title">{song.title}</h4>
                    <p className="search-result-artist">{song.artist}</p>

                    <div className="search-result-meta">
                      {song.era && (
                        <span className="search-result-tag">{song.era.name}</span>
                      )}
                      {song.release_year && (
                        <span className="search-result-tag">{song.release_year}</span>
                      )}
                      {song.category && (
                        <span className={`search-result-tag ${song.category}`}>
                          {song.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {!hasSearched && (
          <div className="search-start">
            <SearchIcon size={64} opacity={0.2} />
            <h2>Search Juice WRLD's Catalog</h2>
            <p>Search by song title, artist, producer, era, or even lyrics</p>
            <div className="search-tips">
              <span>💡 Tip: Try searching for producers like "Nick Mira" or specific eras</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

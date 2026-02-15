import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Clock, TrendingUp, Disc, Radio } from 'lucide-react'
import { juiceApi } from '../api/juiceApi'
import { Song, Era } from '../types'
import './DesktopDiscover.css'

interface DesktopDiscoverProps {
  onSongSelect: (song: Song) => void
}

export default function DesktopDiscover({ onSongSelect }: DesktopDiscoverProps) {
  const [activeTab, setActiveTab] = useState<'released' | 'unreleased'>('released')
  const [songs, setSongs] = useState<Song[]>([])
  const [eras, setEras] = useState<Era[]>([])
  const [selectedEra, setSelectedEra] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [featuredSong, setFeaturedSong] = useState<Song | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  
  const observerTarget = useRef<HTMLDivElement>(null)

  // Reset when tab or era changes
  useEffect(() => {
    setSongs([])
    setPage(1)
    setHasMore(true)
    loadData(1, true)
  }, [activeTab, selectedEra])

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          loadMoreSongs()
        }
      },
      { threshold: 0.1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [hasMore, loading, loadingMore, page])

  const loadData = async (pageNum: number = 1, reset: boolean = false) => {
    if (reset) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }
    setError(null)
    
    try {
      console.log('[Discover] Loading page:', pageNum)
      
      // Load eras if not loaded
      if (eras.length === 0) {
        const loadedEras = await juiceApi.getEras()
        console.log('[Discover] Loaded eras:', loadedEras)
        setEras(Array.isArray(loadedEras) ? loadedEras : [])
      }
      
      // Load songs based on active tab and era
      const result = await juiceApi.getSongs(
        pageNum, 
        40, 
        activeTab,
        selectedEra !== 'all' ? selectedEra : undefined
      )
      
      console.log('[Discover] Loaded songs result:', result)
      
      const loadedSongs = Array.isArray(result.songs) ? result.songs : []
      
      if (reset) {
        setSongs(loadedSongs)
        // Set featured song (first song)
        if (loadedSongs.length > 0) {
          setFeaturedSong(loadedSongs[0])
        }
      } else {
        setSongs(prev => [...prev, ...loadedSongs])
      }
      
      setHasMore(result.hasMore)
      console.log('[Discover] Done loading, total songs:', reset ? loadedSongs.length : songs.length + loadedSongs.length)
    } catch (err) {
      console.error('[Discover] Load error:', err)
      setError('Failed to load songs. Please try again.')
      setSongs([])
      setEras([])
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMoreSongs = useCallback(() => {
    const nextPage = page + 1
    setPage(nextPage)
    loadData(nextPage, false)
  }, [page])

  const renderFeaturedSection = () => {
    if (!featuredSong) return null
    
    return (
      <div className="featured-section">
        <div 
          className="featured-backdrop"
          style={{
            backgroundImage: featuredSong.coverArt 
              ? `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.9)), url(${featuredSong.coverArt})`
              : 'linear-gradient(135deg, #ff006e 0%, #8338ec 100%)'
          }}
        />
        <div className="featured-content">
          <div className="featured-badge">
            <TrendingUp size={16} />
            <span>Featured Track</span>
          </div>
          
          <h1 className="featured-title">{featuredSong.title}</h1>
          <p className="featured-artist">{featuredSong.artist}</p>
          
          <div className="featured-meta">
            {featuredSong.era && (
              <span className="featured-tag">{featuredSong.era.name}</span>
            )}
            {featuredSong.release_year && (
              <span className="featured-tag">{featuredSong.release_year}</span>
            )}
            <span className="featured-tag">{activeTab === 'released' ? 'Released' : 'Unreleased'}</span>
          </div>
          
          <button 
            className="featured-play-btn"
            onClick={() => onSongSelect(featuredSong)}
          >
            <Play size={24} fill="currentColor" />
            <span>Play Now</span>
          </button>
        </div>
      </div>
    )
  }

  const renderEraFilter = () => {
    if (!Array.isArray(eras) || eras.length === 0) return null
    
    return (
      <div className="era-filter-section">
        <button
          className={`era-chip ${selectedEra === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedEra('all')}
        >
          <span>All Eras</span>
        </button>
        {eras.map(era => (
          <button
            key={era.id}
            className={`era-chip ${selectedEra === era.name ? 'active' : ''}`}
            onClick={() => setSelectedEra(era.name)}
          >
            <span>{era.name}</span>
          </button>
        ))}
      </div>
    )
  }

  const renderSongGrid = () => {
    if (loading) {
      return (
        <div className="discover-loading">
          <div className="loading-spinner" />
          <p>Loading tracks...</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className="discover-empty">
          <Radio size={48} opacity={0.3} />
          <p>Error loading songs</p>
          <span>{error}</span>
          <button 
            onClick={() => loadData(1, true)}
            style={{ 
              marginTop: '16px', 
              padding: '10px 20px', 
              background: '#8338ec', 
              border: 'none', 
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      )
    }

    if (!Array.isArray(songs) || songs.length === 0) {
      return (
        <div className="discover-empty">
          <Radio size={48} opacity={0.3} />
          <p>No songs found</p>
          <span>Try a different filter</span>
        </div>
      )
    }

    // Skip the first song since it's featured
    const gridSongs = songs.slice(1)

    return (
      <>
        <div className="songs-grid">
          {gridSongs.map((song, index) => (
            <div 
              key={`${song.id}-${index}`}
              className="song-card"
              onClick={() => onSongSelect(song)}
            >
              <div className="song-card-cover">
                {song.coverArt ? (
                  <img src={song.coverArt} alt={song.title} />
                ) : (
                  <div className="song-card-placeholder">
                    <Disc size={40} opacity={0.5} />
                  </div>
                )}
                <div className="song-card-overlay">
                  <button className="song-card-play-btn">
                    <Play size={28} fill="currentColor" />
                  </button>
                </div>
              </div>
              
              <div className="song-card-info">
                <h3 className="song-card-title">{song.title}</h3>
                <p className="song-card-artist">{song.artist}</p>
                
                <div className="song-card-meta">
                  {song.era && (
                    <span className="song-card-tag">{song.era.name}</span>
                  )}
                  {song.release_year && (
                    <span className="song-card-tag">{song.release_year}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Infinite scroll trigger */}
        <div ref={observerTarget} style={{ height: '20px', margin: '20px 0' }} />
        
        {/* Loading more indicator */}
        {loadingMore && (
          <div className="discover-loading-more">
            <div className="loading-spinner-small" />
            <span>Loading more songs...</span>
          </div>
        )}
        
        {/* End of results */}
        {!hasMore && songs.length > 0 && (
          <div className="discover-end">
            <p>You've reached the end! 🎵</p>
            <span>Loaded {songs.length} songs</span>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="desktop-discover">
      {/* Category Tabs */}
      <div className="discover-tabs">
        <button
          className={`discover-tab ${activeTab === 'released' ? 'active' : ''}`}
          onClick={() => setActiveTab('released')}
        >
          <Clock size={18} />
          <span>Released</span>
        </button>
        <button
          className={`discover-tab ${activeTab === 'unreleased' ? 'active' : ''}`}
          onClick={() => setActiveTab('unreleased')}
        >
          <Radio size={18} />
          <span>Unreleased</span>
        </button>
      </div>

      {/* Featured Section */}
      {!loading && !error && renderFeaturedSection()}

      {/* Era Filter */}
      {!loading && !error && renderEraFilter()}

      {/* Songs Grid with Infinite Scroll */}
      {renderSongGrid()}
    </div>
  )
}

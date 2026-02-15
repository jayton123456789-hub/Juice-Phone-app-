import { useState, useEffect, useRef, useCallback } from 'react'
import { HiPlay, HiFilter } from 'react-icons/hi'
import { juiceApi } from '../api/juiceApi'
import CoverImage from '../components/CoverImage'
import { Song } from '../types'
import './Discover.css'

interface DiscoverProps {
  onSongSelect: (song: Song) => void
}

interface Playlist {
  id: string
  title: string
  description: string
  coverColor: string
  songs: Song[]
  icon: string
}

export default function Discover({ onSongSelect }: DiscoverProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [catalogSongs, setCatalogSongs] = useState<Song[]>([])
  const [catalogPage, setCatalogPage] = useState(1)
  const [, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [activeTab, setActiveTab] = useState<'playlists' | 'catalog'>('playlists')
  const catalogRef = useRef<HTMLDivElement>(null)
  
  // Filters
  const [showFilters, setShowFilters] = useState(false)
  const [filterEra, setFilterEra] = useState('all')
  const [filterYear, setFilterYear] = useState('all')
  const [filterProducer, setFilterProducer] = useState('all')
  const [sortBy, setSortBy] = useState('popular')
  
  // Filter options
  const eras = ['all', 'Early (2015-2017)', 'DRFL Era', 'LND Era', 'Post-Death']
  const years = ['all', '2015', '2016', '2017', '2018', '2019', '2020', '2021']
  const producers = ['all', 'Nick Mira', 'Benny Blanco', 'Rex Kudo', 'DT', 'Purps', 'Sid Roams', 'MaxLord']
  const sortOptions = ['popular', 'a-z', 'recent', 'random']

  // Generate auto-playlists
  useEffect(() => {
    generatePlaylists()
    loadCatalog(1)
  }, [])

  const generatePlaylists = async () => {
    setLoading(true)
    try {
      const [released, all, trending] = await Promise.all([
        juiceApi.getSongs(1, 30, 'released'),
        juiceApi.getSongs(Math.floor(Math.random() * 10) + 1, 30),
        juiceApi.getSongs(2, 30, 'released')
      ])

      const autoPlaylists: Playlist[] = [
        {
          id: 'best-of',
          title: 'Best of Juice WRLD',
          description: 'The essential tracks',
          coverColor: 'linear-gradient(135deg, #1db954, #1ed760)',
          songs: released.songs.slice(0, 8),
          icon: '⭐'
        },
        {
          id: 'hidden-gems',
          title: 'Hidden Gems',
          description: 'Underappreciated tracks',
          coverColor: 'linear-gradient(135deg, #8338ec, #3a86ff)',
          songs: all.songs.slice(0, 8),
          icon: '💎'
        },
        {
          id: 'vibes',
          title: 'Late Night Vibes',
          description: 'For when the sun goes down',
          coverColor: 'linear-gradient(135deg, #ff006e, #ff4d6d)',
          songs: trending.songs.slice(0, 8),
          icon: '🌙'
        },
        {
          id: 'energy',
          title: 'High Energy',
          description: 'Turn up the volume',
          coverColor: 'linear-gradient(135deg, #ffbe0b, #fb5607)',
          songs: released.songs.slice(8, 16),
          icon: '⚡'
        },
        {
          id: 'melancholy',
          title: 'Melancholy',
          description: 'For the feels',
          coverColor: 'linear-gradient(135deg, #00f5ff, #0066ff)',
          songs: all.songs.slice(8, 16),
          icon: '💙'
        },
        {
          id: '999',
          title: '999 Forever',
          description: 'Legends Never Die',
          coverColor: 'linear-gradient(135deg, #ff006e, #8338ec)',
          songs: trending.songs.slice(8, 16),
          icon: '9️⃣'
        }
      ]

      setPlaylists(autoPlaylists)
    } catch (err) {
      console.error('Failed to generate playlists:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadCatalog = async (page: number) => {
    if (page === 1) setLoading(true)
    else setLoadingMore(true)

    try {
      const result = await juiceApi.getSongs(page, 50, 'released')
      let songs = result.songs
      
      // Apply filters
      if (filterEra !== 'all') {
        songs = songs.filter(song => {
          if (!song.releaseDate) return false
          const year = new Date(song.releaseDate).getFullYear()
          if (filterEra === 'Early (2015-2017)') return year >= 2015 && year <= 2017
          if (filterEra === 'DRFL Era') return year === 2018 || year === 2019
          if (filterEra === 'LND Era') return year === 2020
          if (filterEra === 'Post-Death') return year >= 2020
          return true
        })
      }
      
      if (filterYear !== 'all') {
        songs = songs.filter(song => {
          if (!song.releaseDate) return false
          return new Date(song.releaseDate).getFullYear() === parseInt(filterYear)
        })
      }
      
      if (filterProducer !== 'all') {
        songs = songs.filter(song => {
          if (!song.producers) return false
          // Producers is a string, check if it includes the producer name
          return song.producers.toLowerCase().includes(filterProducer.toLowerCase())
        })
      }
      
      // Apply sorting
      if (sortBy === 'a-z') {
        songs = songs.sort((a, b) => a.title.localeCompare(b.title))
      } else if (sortBy === 'recent') {
        songs = songs.sort((a, b) => {
          const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0
          const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0
          return dateB - dateA
        })
      } else if (sortBy === 'random') {
        songs = songs.sort(() => Math.random() - 0.5)
      }
      
      if (page === 1) {
        setCatalogSongs(songs)
      } else {
        setCatalogSongs(prev => [...prev, ...songs])
      }
      setCatalogPage(page)
    } catch (err) {
      console.error('Failed to load catalog:', err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // Infinite scroll
  const handleScroll = useCallback(() => {
    if (activeTab !== 'catalog' || loadingMore) return
    
    const container = catalogRef.current
    if (!container) return

    const { scrollTop, scrollHeight, clientHeight } = container
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      loadCatalog(catalogPage + 1)
    }
  }, [activeTab, catalogPage, loadingMore])

  useEffect(() => {
    const container = catalogRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  return (
    <div className="page discover-page" ref={catalogRef}>
      {/* Header */}
      <div className="discover-header">
        <h1>Discover</h1>
        
        {/* Tabs */}
        <div className="discover-tabs">
          <button 
            className={activeTab === 'playlists' ? 'active' : ''}
            onClick={() => setActiveTab('playlists')}
          >
            Playlists
          </button>
          <button 
            className={activeTab === 'catalog' ? 'active' : ''}
            onClick={() => setActiveTab('catalog')}
          >
            Catalog
          </button>
        </div>
        
        {/* Filter Button */}
        {activeTab === 'catalog' && (
          <button 
            className="filter-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            <HiFilter />
            Filters
          </button>
        )}
      </div>
      
      {/* Filters Panel */}
      {showFilters && activeTab === 'catalog' && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>Era</label>
            <select value={filterEra} onChange={e => { setFilterEra(e.target.value); loadCatalog(1) }}>
              {eras.map(era => <option key={era} value={era}>{era}</option>)}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Year</label>
            <select value={filterYear} onChange={e => { setFilterYear(e.target.value); loadCatalog(1) }}>
              {years.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Producer</label>
            <select value={filterProducer} onChange={e => { setFilterProducer(e.target.value); loadCatalog(1) }}>
              {producers.map(prod => <option key={prod} value={prod}>{prod}</option>)}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Sort By</label>
            <select value={sortBy} onChange={e => { setSortBy(e.target.value); loadCatalog(1) }}>
              {sortOptions.map(sort => (
                <option key={sort} value={sort}>
                  {sort.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
          
          <button 
            className="reset-filters-btn"
            onClick={() => {
              setFilterEra('all')
              setFilterYear('all')
              setFilterProducer('all')
              setSortBy('popular')
              loadCatalog(1)
            }}
          >
            Reset Filters
          </button>
        </div>
      )}

      {activeTab === 'playlists' ? (
        <>
          {/* Made For You */}
          <section className="discover-section">
            <h2>Made For You</h2>
            <div className="playlist-grid-large">
              {playlists.slice(0, 2).map((playlist) => (
                <div 
                  key={playlist.id}
                  className="playlist-card-large"
                  style={{ background: playlist.coverColor }}
                  onClick={() => playlist.songs[0] && onSongSelect(playlist.songs[0])}
                >
                  <span className="playlist-icon-large">{playlist.icon}</span>
                  <h3>{playlist.title}</h3>
                  <p>{playlist.description}</p>
                  <button className="playlist-play-btn">
                    <HiPlay />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Browse All */}
          <section className="discover-section">
            <h2>Browse All</h2>
            <div className="playlist-grid">
              {playlists.map((playlist) => (
                <div 
                  key={playlist.id}
                  className="playlist-card"
                  onClick={() => playlist.songs[0] && onSongSelect(playlist.songs[0])}
                >
                  <div 
                    className="playlist-cover"
                    style={{ background: playlist.coverColor }}
                  >
                    <span>{playlist.icon}</span>
                  </div>
                  <h4>{playlist.title}</h4>
                  <p>{playlist.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Featured Tracks */}
          <section className="discover-section">
            <h2>Featured Tracks</h2>
            <div className="featured-tracks">
              {playlists[0]?.songs.slice(0, 5).map((song, index) => (
                <div 
                  key={song.id}
                  className="featured-track-item"
                  onClick={() => onSongSelect(song)}
                >
                  <span className="track-number">{index + 1}</span>
                  <CoverImage src={song.coverArt} alt={song.title} size="small" />
                  <div className="track-info">
                    <h4>{song.title}</h4>
                    <p>{song.artist}</p>
                  </div>
                  <button className="track-play-btn">
                    <HiPlay />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        /* Catalog View with Infinite Scroll */
        <section className="catalog-section">
          <div className="catalog-header">
            <h2>All Songs</h2>
            <p>Infinite scroll to browse</p>
          </div>
          
          <div className="catalog-list">
            {catalogSongs.map((song, index) => (
              <div 
                key={`${song.id}-${index}`}
                className="catalog-item"
                onClick={() => onSongSelect(song)}
              >
                <span className="catalog-number">{index + 1}</span>
                <CoverImage src={song.coverArt} alt={song.title} size="small" />
                <div className="catalog-info">
                  <h4>{song.title}</h4>
                  <p>{song.artist}</p>
                </div>
                <button className="catalog-play-btn">
                  <HiPlay />
                </button>
              </div>
            ))}
            
            {loadingMore && (
              <div className="loading-more">
                <div className="spinner-small"></div>
                <span>Loading more...</span>
              </div>
            )}
          </div>
        </section>
      )}

      <div className="discover-footer"></div>
    </div>
  )
}

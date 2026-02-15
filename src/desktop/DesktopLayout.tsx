import { useState, useEffect } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle, Heart, ListMusic, Disc, Home, Compass, Library, Radio, Search, Sparkles, ChevronDown, ChevronUp, Mic2, Settings as SettingsIcon } from 'lucide-react'
import { useAudioPlayer } from '../hooks/useAudioPlayer'
import { MilkDropVisualizer } from '../components/MilkDropVisualizer'
import QueuePanel from '../components/QueuePanel'
import { juiceApi } from '../api/juiceApi'
import DesktopDiscover from './DesktopDiscover'
import DesktopHome from './DesktopHome'
import DesktopLibrary from './DesktopLibrary'
import DesktopRadio from './DesktopRadio'
import DesktopSearch from './DesktopSearch'
import Settings from '../pages/Settings'
import { Song, Era, User } from '../types'
import { toggleFavorite, isFavorite } from '../utils/storage'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import './DesktopLayout.css'

export function DesktopLayout() {
  const [activeTab, setActiveTab] = useState('home')
  const [showMilkDrop, setShowMilkDrop] = useState(false)
  const [isQueueOpen, setIsQueueOpen] = useState(false)
  const [loadedSongs, setLoadedSongs] = useState<Song[]>([])
  const [, setCategories] = useState<{value: string; label: string}[]>([])
  const [, setEras] = useState<Era[]>([])
  const [showLyrics, setShowLyrics] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('wrld_user') || localStorage.getItem('juiceUser')
    return saved ? JSON.parse(saved) : null
  })
  const [topbarSearchQuery, setTopbarSearchQuery] = useState('')
  const [isLiked, setIsLiked] = useState(false)
  
  const player = useAudioPlayer()
  const { currentSong, isPlaying, queue, currentIndex, playSong, playSongWithQueue, audioContext, sourceNode, clearQueue, removeFromQueue } = player

  // Update like state when song changes
  useEffect(() => {
    if (currentSong) {
      setIsLiked(isFavorite(currentSong.id))
    }
  }, [currentSong])

  const handleToggleLike = () => {
    if (!currentSong) return
    const newState = toggleFavorite(currentSong)
    setIsLiked(newState)
  }

  // Load categories and eras on mount
  useEffect(() => {
    const loadMetadata = async () => {
      const [cats, ers] = await Promise.all([
        juiceApi.getCategories(),
        juiceApi.getEras()
      ])
      setCategories(cats)
      setEras(ers)
    }
    loadMetadata()
  }, [])

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'library', label: 'Library', icon: Library },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'radio', label: 'Radio', icon: Radio },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ]

  const handleSongSelect = (song: Song, customQueue?: Song[]) => {
    // If custom queue provided (from Radio/Playlist), use it
    if (customQueue && customQueue.length > 0) {
      playSongWithQueue(song, customQueue)
    } else if (loadedSongs.length > 0) {
      playSongWithQueue(song, loadedSongs)
    } else {
      playSong(song)
    }
  }

  const handleSongsLoaded = (songs: Song[]) => {
    setLoadedSongs(songs)
  }

  // Clear loaded songs when changing tabs
  useEffect(() => {
    // Clear loaded songs when switching away from sections that set them
    if (activeTab === 'radio' || activeTab === 'library') {
      setLoadedSongs([])
    }
  }, [activeTab])

  const handleVisualize = () => {
    if (!sourceNode) {
      console.warn('[Desktop] No audio source - play a song first')
      return
    }
    setShowMilkDrop(true)
  }

  // Keyboard shortcuts - defined AFTER handleVisualize
  useKeyboardShortcuts({
    onPlayPause: player.togglePlay,
    onNext: player.playNext,
    onPrevious: player.playPrevious,
    onVolumeUp: () => {},
    onVolumeDown: () => {},
    onMute: () => player.setAudioVolume(player.volume === 0 ? 100 : 0),
    onShuffle: () => player.setIsShuffle(!player.isShuffle),
    onRepeat: () => player.setIsRepeat(!player.isRepeat),
    onToggleFavorite: () => {
      if (currentSong) {
        setIsLiked(isFavorite(currentSong.id))
      }
    },
    onQueue: () => setIsQueueOpen(!isQueueOpen),
    onVisualize: handleVisualize,
    currentSong,
    volume: player.volume,
    setVolume: player.setAudioVolume
  })

  // Handle queue song selection
  const handleQueueSongSelect = (index: number) => {
    if (index >= 0 && index < queue.length) {
      player.playSong(queue[index])
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <DesktopHome 
            onSongSelect={handleSongSelect}
            onRadioPlay={() => setActiveTab('radio')}
            onSongsLoaded={handleSongsLoaded}
            user={null}
          />
        )
      case 'discover':
        return <DesktopDiscover onSongSelect={handleSongSelect} />
      case 'library':
        return <DesktopLibrary onSongSelect={handleSongSelect} />
      case 'search':
        return <DesktopSearch onSongSelect={handleSongSelect} initialQuery={topbarSearchQuery} />
      case 'radio':
        return (
          <DesktopRadio 
            currentSong={currentSong}
            isPlaying={isPlaying}
            onSongSelect={(song, queue) => handleSongSelect(song, queue)}
          />
        )
      case 'settings':
        return (
          <Settings
            user={user}
            onBack={() => setActiveTab('home')}
            onUserChange={setUser}
          />
        )
      default:
        return <DesktopDiscover onSongSelect={handleSongSelect} />
    }
  }

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Get release year from song
  const getReleaseYear = (song: Song): string => {
    if (song.release_year) return String(song.release_year)
    if (song.release_date) return String(new Date(song.release_date).getFullYear())
    if (song.era?.time_frame) {
      const match = song.era.time_frame.match(/\d{4}/)
      if (match) return match[0]
    }
    return 'Unknown'
  }

  return (
    <div className="desktop-layout">
      {/* MilkDrop Visualizer - Fullscreen Overlay */}
      {showMilkDrop && audioContext && sourceNode && (
        <MilkDropVisualizer
          isPlaying={isPlaying}
          audioContext={audioContext}
          sourceNode={sourceNode}
          onClose={() => setShowMilkDrop(false)}
          currentSong={currentSong}
          onPlayPause={player.togglePlay}
          onNext={player.playNext}
          onPrevious={player.playPrevious}
          onToggleFavorite={() => {/* TODO: implement favorite toggle */}}
          volume={player.volume}
          onVolumeChange={player.setAudioVolume}
        />
      )}

      {/* Lyrics Panel */}
      {showLyrics && currentSong && (
        <div className="lyrics-panel" onClick={() => setShowLyrics(false)}>
          <div className="lyrics-content" onClick={e => e.stopPropagation()}>
            <div className="lyrics-header">
              <h3>Lyrics</h3>
              <button className="close-btn" onClick={() => setShowLyrics(false)}>×</button>
            </div>
            <div className="lyrics-body">
              {currentSong.lyrics ? (
                <pre className="lyrics-text">{currentSong.lyrics}</pre>
              ) : (
                <p className="no-lyrics">No lyrics available for this song.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Queue Panel */}
      <QueuePanel
        queue={queue}
        currentIndex={currentIndex}
        isOpen={isQueueOpen}
        onClose={() => setIsQueueOpen(false)}
        onSongSelect={handleQueueSongSelect}
        onClearQueue={clearQueue}
        onRemoveSong={removeFromQueue}
      />

      {/* Sidebar */}
      <aside className="desktop-sidebar">
        <div className="sidebar-header">
          <h1 className="logo-large">WRLD</h1>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section">
            <span className="nav-section-title">Menu</span>
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={22} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="desktop-main">
        <div className="desktop-topbar">
          <div className="topbar-search">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Search songs, albums..."
              value={topbarSearchQuery}
              onChange={(e) => setTopbarSearchQuery(e.target.value)}
              onFocus={() => setActiveTab('search')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setActiveTab('search')
                }
              }}
            />
          </div>
          <div className="topbar-actions">
            <button 
              className="titlebar-btn" 
              title="Minimize"
              onClick={() => window.electronAPI?.minimizeWindow?.()}
            >
              _
            </button>
            <button 
              className="titlebar-btn close" 
              title="Close"
              onClick={() => window.electronAPI?.closeWindow?.()}
            >
              ×
            </button>
          </div>
        </div>
        <div className="desktop-content">
          {renderContent()}
        </div>
      </main>

      {/* Right Sidebar - Now Playing */}
      <aside className="now-playing-sidebar">
        <div className="now-playing-content">
          {currentSong ? (
            <>
              {/* VISUALIZE Button - Desktop */}
              <button 
                className={`visualize-btn-desktop ${showMilkDrop ? 'active' : ''}`}
                onClick={handleVisualize}
                disabled={!sourceNode}
              >
                <Sparkles size={18} />
                <span>{showMilkDrop ? 'STOP VISUALIZER' : 'VISUALIZE'}</span>
              </button>

              <div className="np-cover-large">
                {currentSong.coverArt ? (
                  <img 
                    src={currentSong.coverArt} 
                    alt={currentSong.title}
                    className="np-cover-img-large"
                  />
                ) : (
                  <div className="np-cover-img-large" style={{ 
                    background: 'linear-gradient(135deg, #ff006e 0%, #8338ec 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Disc size={64} style={{ opacity: 0.5 }} />
                  </div>
                )}
              </div>

              {/* Main Song Info */}
              <div className="np-info-large">
                <h3 className="np-title-large" title={currentSong.title}>
                  {currentSong.title}
                </h3>
                <p className="np-artist-large">{currentSong.artist}</p>
                
                {currentSong.album && currentSong.album !== 'Unknown Project' && (
                  <p className="np-album-large">{currentSong.album}</p>
                )}
                
                <div className="np-meta-tags">
                  {currentSong.category && (
                    <span className={`np-category-tag ${currentSong.category}`}>
                      {currentSong.category}
                    </span>
                  )}
                  {currentSong.era && (
                    <span className="np-era-tag">{currentSong.era.name}</span>
                  )}
                  <span className="np-year-tag">{getReleaseYear(currentSong)}</span>
                </div>
              </div>

              {/* Lyrics Button */}
              {currentSong.hasLyrics && (
                <button 
                  className="np-lyrics-btn"
                  onClick={() => setShowLyrics(true)}
                >
                  <Mic2 size={16} />
                  <span>Lyrics</span>
                </button>
              )}

              {/* Expandable Details Section */}
              <div className="np-details-section">
                <button 
                  className="np-details-toggle"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  <span>Details</span>
                  {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                
                {showDetails && (
                  <div className="np-details-content">
                    {currentSong.producers && (
                      <div className="detail-row">
                        <span className="detail-label">Producers</span>
                        <span className="detail-value">{currentSong.producers}</span>
                      </div>
                    )}
                    {currentSong.engineers && (
                      <div className="detail-row">
                        <span className="detail-label">Engineers</span>
                        <span className="detail-value">{currentSong.engineers}</span>
                      </div>
                    )}
                    {currentSong.duration && currentSong.duration > 0 && (
                      <div className="detail-row">
                        <span className="detail-label">Duration</span>
                        <span className="detail-value">{formatTime(currentSong.duration)}</span>
                      </div>
                    )}
                    {currentSong.recording_locations && (
                      <div className="detail-row">
                        <span className="detail-label">Recorded</span>
                        <span className="detail-value">{currentSong.recording_locations}</span>
                      </div>
                    )}
                    {currentSong.additional_information && (
                      <div className="detail-row">
                        <span className="detail-label">Info</span>
                        <span className="detail-value">{currentSong.additional_information}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="np-empty">
              <div className="np-empty-icon">
                <Disc size={48} style={{ opacity: 0.3 }} />
              </div>
              <p>No song playing</p>
              <span className="np-empty-hint">Select a song to start listening</span>
            </div>
          )}
        </div>
      </aside>

      {/* Bottom Player Bar */}
      <footer className="player-bar">
        <div className="player-section track-info">
          {currentSong && (
            <>
              <div className="track-cover">
                {currentSong.coverArt ? (
                  <img 
                    src={currentSong.coverArt} 
                    alt={currentSong.title}
                    className="track-cover-img"
                  />
                ) : (
                  <div className="track-cover-img" style={{ 
                    background: 'linear-gradient(135deg, #ff006e 0%, #8338ec 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Disc size={24} />
                  </div>
                )}
              </div>
              <div className="track-meta">
                <h4 className="track-title" title={currentSong.title}>
                  {currentSong.title}
                </h4>
                <p className="track-artist">{currentSong.artist}</p>
              </div>
              <button 
                className={`control-btn favorite ${isLiked ? 'active' : ''}`}
                onClick={handleToggleLike}
              >
                <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
              </button>
            </>
          )}
        </div>

        <div className="player-section controls">
          <div className="control-buttons">
            <button 
              className={`control-btn secondary ${player.isShuffle ? 'active' : ''}`}
              onClick={() => player.setIsShuffle(!player.isShuffle)}
            >
              <Shuffle size={18} />
            </button>
            <button 
              className="control-btn"
              onClick={player.playPrevious}
              disabled={!currentSong}
            >
              <SkipBack size={22} fill="currentColor" />
            </button>
            <button 
              className="control-btn play"
              onClick={player.togglePlay}
              disabled={!currentSong}
            >
              {isPlaying ? (
                <Pause size={28} fill="currentColor" />
              ) : (
                <Play size={28} fill="currentColor" />
              )}
            </button>
            <button 
              className="control-btn"
              onClick={player.playNext}
              disabled={!currentSong}
            >
              <SkipForward size={22} fill="currentColor" />
            </button>
            <button 
              className={`control-btn secondary ${player.isRepeat ? 'active' : ''}`}
              onClick={() => player.setIsRepeat(!player.isRepeat)}
            >
              <Repeat size={18} />
            </button>
          </div>
          
          <div className="progress-container">
            <span className="time">{formatTime(player.currentTime)}</span>
            <input
              type="range"
              min={0}
              max={player.duration || 1}
              value={player.currentTime}
              onChange={(e) => player.seek(Number(e.target.value))}
              className="progress-bar"
            />
            <span className="time">{formatTime(player.duration)}</span>
          </div>
        </div>

        <div className="player-section extra">
          <button 
            className={`control-btn ${isQueueOpen ? 'active' : ''}`}
            onClick={() => setIsQueueOpen(!isQueueOpen)}
            style={{ position: 'relative' }}
          >
            <ListMusic size={20} />
            {queue.length > 0 && <span className="queue-badge">{queue.length}</span>}
          </button>
          
          <div className="volume-control">
            <button 
              className="control-btn"
              onClick={() => player.setAudioVolume(player.volume === 0 ? 100 : 0)}
            >
              {player.volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={player.volume}
              onChange={(e) => player.setAudioVolume(Number(e.target.value))}
              className="volume-slider"
              style={{ width: 80 }}
            />
          </div>
        </div>
      </footer>
    </div>
  )
}

export default DesktopLayout

import { useState, useEffect, useCallback } from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { HiHome, HiSearch, HiHeart, HiRadio } from 'react-icons/hi'
import { HiSparkles } from 'react-icons/hi2'
import Home from './pages/Home'
import Search from './pages/Search'
import Library from './pages/Library'
import Radio from './pages/Radio'
import Discover from './pages/Discover'
import Player from './pages/Player'
import Auth from './pages/Auth'
import Profile from './pages/Profile'
import MiniPlayer from './components/MiniPlayer'
import QueuePanel from './components/QueuePanel'
import SplashScreen from './components/SplashScreen'
import { useAudioPlayer } from './hooks/useAudioPlayer'
import { useUser } from './hooks/useUser'
import { checkStorageVersion } from './utils/storage'
import { Song } from './types'
import './App.css'

// Check storage version on load
checkStorageVersion()

function App() {
  const [showPlayer, setShowPlayer] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showQueue, setShowQueue] = useState(false)
  const [allSongs, setAllSongs] = useState<Song[]>([])
  const [isStarting, setIsStarting] = useState(true)
  
  const { user, isLoading, isAuthenticated } = useUser()
  const {
    currentSong,
    queue,
    currentIndex,
    isPlaying,
    currentTime,
    duration,
    volume,
    volumeBoost,
    playSongWithQueue,
    togglePlay,
    playNext,
    playPrevious,
    seek,
    setAudioVolume,
    toggleVolumeBoost,
    setQueue,
    removeFromQueue
  } = useAudioPlayer()

  // Splash screen timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsStarting(false)
    }, 3500)
    return () => clearTimeout(timer)
  }, [])

  // Prevent right-click context menu (mobile-like behavior)
  useEffect(() => {
    const handler = (e: MouseEvent) => e.preventDefault()
    document.addEventListener('contextmenu', handler)
    return () => document.removeEventListener('contextmenu', handler)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!currentSong) return
      
      switch (e.key) {
        case 'MediaPlayPause':
        case ' ':
          if (e.target === document.body) {
            e.preventDefault()
            togglePlay()
          }
          break
        case 'MediaTrackNext':
        case 'ArrowRight':
          if (e.ctrlKey || e.metaKey) {
            playNext()
          }
          break
        case 'MediaTrackPrevious':
        case 'ArrowLeft':
          if (e.ctrlKey || e.metaKey) {
            playPrevious()
          }
          break
        case 'm':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            setAudioVolume(volume === 0 ? 80 : 0)
          }
          break
        case 'Escape':
          if (showPlayer) setShowPlayer(false)
          if (showQueue) setShowQueue(false)
          break
      }
    }
    
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [currentSong, togglePlay, playNext, playPrevious, volume, setAudioVolume, showPlayer, showQueue])

  const handleSongSelect = useCallback((song: Song) => {
    playSongWithQueue(song, allSongs.length > 0 ? allSongs : [song])
    setShowPlayer(true)
  }, [allSongs, playSongWithQueue])

  const handleRadioPlay = useCallback(async () => {
    const { juiceApi } = await import('./api/juiceApi')
    const songs = await juiceApi.getRadioSongs(20)
    if (songs.length > 0) {
      setQueue(songs, 0)
      setShowPlayer(true)
    }
  }, [setQueue])

  const handleClosePlayer = () => {
    setShowPlayer(false)
  }

  const handleOpenFullPlayer = () => {
    setShowPlayer(true)
  }

  const handleQueueSongSelect = (index: number) => {
    console.log('Select queue item:', index)
  }

  // Show splash screen
  if (isStarting) {
    return (
      <div className="app">
        <div className="phone-frame">
          <SplashScreen />
        </div>
      </div>
    )
  }

  // Show auth screen if not authenticated
  if (isLoading) {
    return (
      <div className="app">
        <div className="phone-frame">
          <div className="loading-screen">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="app">
        <div className="phone-frame">
          <Auth />
        </div>
      </div>
    )
  }

  const showMiniPlayer = currentSong && !showPlayer

  return (
    <div className="app">
      <div className="phone-frame">
        {/* Draggable title bar */}
        <div className="title-bar">
          <div className="title-bar-text">WRLD</div>
          <div className="window-controls">
            <button className="win-btn minimize" onClick={() => window.electronAPI?.minimize?.()}>−</button>
            <button className="win-btn close" onClick={() => window.electronAPI?.close?.() || window.close()}>×</button>
          </div>
        </div>

        <div className="status-bar">
          <span className="time">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <div className="notch"></div>
          <div className="icons">
            <span>📶</span>
            <span>🔋</span>
          </div>
        </div>
        
        <div className="app-content">
          {showProfile ? (
            <Profile onClose={() => setShowProfile(false)} />
          ) : showPlayer && currentSong ? (
            <Player 
              song={currentSong}
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              volume={volume}
              volumeBoost={volumeBoost}
              queueLength={queue.length}
              hasNext={currentIndex < queue.length - 1}
              hasPrevious={currentIndex > 0}
              onTogglePlay={togglePlay}
              onNext={playNext}
              onPrevious={playPrevious}
              onSeek={seek}
              onVolumeChange={setAudioVolume}
              onToggleVolumeBoost={toggleVolumeBoost}
              onClose={handleClosePlayer}
              onOpenQueue={() => setShowQueue(true)}
            />
          ) : (
            <Router>
              <Routes>
                <Route path="/" element={
                  <Home 
                    onSongSelect={handleSongSelect}
                    onRadioPlay={handleRadioPlay}
                    onProfileClick={() => setShowProfile(true)}
                    onSongsLoaded={setAllSongs}
                    user={user}
                  />
                } />
                <Route path="/radio" element={
                  <Radio onSongSelect={handleSongSelect} />
                } />
                <Route path="/search" element={
                  <Search onSongSelect={handleSongSelect} />
                } />
                <Route path="/library" element={
                  <Library onSongSelect={handleSongSelect} />
                } />
                <Route path="/discover" element={
                  <Discover onSongSelect={handleSongSelect} />
                } />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
              
              <nav className="bottom-nav">
                <NavItem to="/" icon={<HiHome />} label="Home" />
                <NavItem to="/radio" icon={<HiRadio />} label="Radio" />
                <NavItem to="/search" icon={<HiSearch />} label="Search" />
                <NavItem to="/library" icon={<HiHeart />} label="Library" />
                <NavItem to="/discover" icon={<HiSparkles />} label="Discover" />
              </nav>
            </Router>
          )}
        </div>

        {/* Mini Player */}
        {showMiniPlayer && (
          <MiniPlayer
            song={currentSong}
            isPlaying={isPlaying}
            onOpenFull={handleOpenFullPlayer}
            onTogglePlay={togglePlay}
            onNext={playNext}
            onPrevious={playPrevious}
          />
        )}

        {/* Queue Panel */}
        <QueuePanel
          queue={queue}
          currentIndex={currentIndex}
          isOpen={showQueue}
          onClose={() => setShowQueue(false)}
          onSongSelect={handleQueueSongSelect}
          onClearQueue={() => setQueue([], -1)}
          onRemoveSong={removeFromQueue}
        />
      </div>
    </div>
  )
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  const hash = window.location.hash || '#'
  const isActive = hash === `#${to}` || (to === '/' && hash === '#')
  return (
    <a href={`#${to}`} className={`nav-item ${isActive ? 'active' : ''}`}>
      {icon}
      <span>{label}</span>
    </a>
  )
}

export default App

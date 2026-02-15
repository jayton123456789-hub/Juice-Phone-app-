import { useState, useEffect } from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { HiHome, HiSearch, HiHeart } from 'react-icons/hi'
import Home from './pages/Home'
import Search from './pages/Search'
import Library from './pages/Library'
import Player from './pages/Player'
import Auth from './pages/Auth'
import Profile from './pages/Profile'
import { useAudioPlayer } from './hooks/useAudioPlayer'
import { useUser } from './hooks/useUser'
import { Song } from './types'
import './App.css'

function App() {
  const [showPlayer, setShowPlayer] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [allSongs, setAllSongs] = useState<Song[]>([])
  
  const { user, isLoading, isAuthenticated } = useUser()
  const {
    currentSong,
    queue,
    currentIndex,
    isPlaying,
    currentTime,
    duration,
    volume,
    playSongWithQueue,
    togglePlay,
    playNext,
    playPrevious,
    seek,
    setAudioVolume
  } = useAudioPlayer()

  // Prevent right-click context menu (mobile-like behavior)
  useEffect(() => {
    const handler = (e: MouseEvent) => e.preventDefault()
    document.addEventListener('contextmenu', handler)
    return () => document.removeEventListener('contextmenu', handler)
  }, [])

  // Prevent spacebar from scrolling
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleSongSelect = (song: Song) => {
    playSongWithQueue(song, allSongs.length > 0 ? allSongs : [song])
    setShowPlayer(true)
  }

  const handleClosePlayer = () => {
    setShowPlayer(false)
  }

  const handleProfileClick = () => {
    setShowProfile(!showProfile)
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

  return (
    <div className="app">
      <div className="phone-frame">
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
              hasNext={currentIndex < queue.length - 1}
              hasPrevious={currentIndex > 0}
              onTogglePlay={togglePlay}
              onNext={playNext}
              onPrevious={playPrevious}
              onSeek={seek}
              onVolumeChange={setAudioVolume}
              onClose={handleClosePlayer}
            />
          ) : (
            <Router>
              <Routes>
                <Route path="/" element={
                  <Home 
                    onSongSelect={handleSongSelect} 
                    onProfileClick={handleProfileClick}
                    onSongsLoaded={setAllSongs}
                    user={user}
                  />
                } />
                <Route path="/search" element={
                  <Search onSongSelect={handleSongSelect} />
                } />
                <Route path="/library" element={
                  <Library onSongSelect={handleSongSelect} />
                } />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
              
              <nav className="bottom-nav">
                <NavItem to="/" icon={<HiHome />} label="Home" />
                <NavItem to="/search" icon={<HiSearch />} label="Search" />
                <NavItem to="/library" icon={<HiHeart />} label="Library" />
              </nav>
            </Router>
          )}
        </div>

        {/* Window controls for desktop */}
        <div className="window-controls">
          <button className="win-btn minimize" onClick={() => window.electronAPI?.minimize?.()}>−</button>
          <button className="win-btn close" onClick={() => window.electronAPI?.close?.() || window.close()}>×</button>
        </div>
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

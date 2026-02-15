import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { HiHome, HiSearch, HiHeart } from 'react-icons/hi'
import Home from './pages/Home'
import Search from './pages/Search'
import Library from './pages/Library'
import Player from './pages/Player'
import { Song } from './types'
import './App.css'

function App() {
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showPlayer, setShowPlayer] = useState(false)

  // Prevent right-click context menu (mobile-like behavior)
  useEffect(() => {
    document.addEventListener('contextmenu', (e) => e.preventDefault())
    return () => document.removeEventListener('contextmenu', (e) => e.preventDefault())
  }, [])

  const handleSongSelect = (song: Song) => {
    setCurrentSong(song)
    setIsPlaying(true)
    setShowPlayer(true)
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
          {showPlayer && currentSong ? (
            <Player 
              song={currentSong} 
              isPlaying={isPlaying} 
              setIsPlaying={setIsPlaying}
              onClose={() => setShowPlayer(false)}
            />
          ) : (
            <Router>
              <Routes>
                <Route path="/" element={<Home onSongSelect={handleSongSelect} />} />
                <Route path="/search" element={<Search onSongSelect={handleSongSelect} />} />
                <Route path="/library" element={<Library onSongSelect={handleSongSelect} />} />
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
          <button className="win-btn minimize">−</button>
          <button className="win-btn close">×</button>
        </div>
      </div>
    </div>
  )
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  const isActive = window.location.pathname === to
  return (
    <a href={to} className={`nav-item ${isActive ? 'active' : ''}`}>
      {icon}
      <span>{label}</span>
    </a>
  )
}

export default App

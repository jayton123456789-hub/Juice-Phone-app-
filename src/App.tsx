import { useState, useEffect, useCallback } from 'react'
import { useAudioPlayer } from './hooks/useAudioPlayer'
import { MiniPlayer } from './components/MiniPlayer'
import { FullPlayer } from './components/FullPlayer'
import { MilkDropVisualizer } from './components/MilkDropVisualizer'
import { DesktopLayout } from './desktop/DesktopLayout'
import { Song } from './types'
import './App.css'

// Simple song list for testing
const SAMPLE_SONGS: Song[] = [
  {
    id: '1',
    title: 'Lucid Dreams',
    artist: 'Juice WRLD',
    album: 'Goodbye & Good Riddance',
    coverArt: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/86/Goodbye_%26_Good_Riddance_Album_Cover.jpg/220px-Goodbye_%26_Good_Riddance_Album_Cover.jpg',
    audioUrl: '', // Add your audio URL
    category: 'Released'
  },
  {
    id: '2', 
    title: 'All Girls Are The Same',
    artist: 'Juice WRLD',
    album: 'Goodbye & Good Riddance',
    coverArt: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/86/Goodbye_%26_Good_Riddance_Album_Cover.jpg/220px-Goodbye_%26_Good_Riddance_Album_Cover.jpg',
    audioUrl: '',
    category: 'Released'
  },
  {
    id: '3',
    title: 'Robbery',
    artist: 'Juice WRLD', 
    album: 'Death Race for Love',
    coverArt: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8b/Juice_Wrld_-_Death_Race_for_Love.png/220px-Juice_Wrld_-_Death_Race_for_Love.png',
    audioUrl: '',
    category: 'Released'
  }
]

function App() {
  const [isDesktop, setIsDesktop] = useState(false)
  const [showFullPlayer, setShowFullPlayer] = useState(false)
  const [showVisualizer, setShowVisualizer] = useState(false)
  const [songs] = useState<Song[]>(SAMPLE_SONGS)

  const player = useAudioPlayer()

  // Check if desktop mode on mount
  useEffect(() => {
    const checkMode = () => {
      const isDesktopMode = window.innerWidth >= 1024
      setIsDesktop(isDesktopMode)
    }
    
    checkMode()
    window.addEventListener('resize', checkMode)
    return () => window.removeEventListener('resize', checkMode)
  }, [])

  // Handle song selection
  const handleSongSelect = useCallback((song: Song) => {
    player.playSongWithQueue(song, songs)
  }, [player, songs])

  // Handle mini player expand
  const handleExpandPlayer = useCallback(() => {
    setShowFullPlayer(true)
  }, [])

  // Handle visualizer open
  const handleVisualize = useCallback(() => {
    if (!player.sourceNode) {
      console.warn('[App] No audio source available - play a song first')
      return
    }
    setShowVisualizer(true)
  }, [player.sourceNode])

  // Handle visualizer close
  const handleCloseVisualizer = useCallback(() => {
    setShowVisualizer(false)
  }, [])

  // Handle full player close
  const handleCloseFullPlayer = useCallback(() => {
    setShowFullPlayer(false)
  }, [])

  // Desktop mode - use DesktopLayout
  if (isDesktop) {
    return (
      <div className="app">
        <DesktopLayout />
        
        {/* Visualizer Overlay */}
        {showVisualizer && (
          <MilkDropVisualizer
            isPlaying={player.isPlaying}
            audioContext={player.audioContext}
            sourceNode={player.sourceNode}
            onClose={handleCloseVisualizer}
          />
        )}
      </div>
    )
  }

  // Mobile mode - simplified flow
  return (
    <div className="app mobile">
      {/* Main Content - Song List */}
      <main className="mobile-content">
        <h1 className="mobile-title">WRLD</h1>
        
        <div className="song-list">
          <h2>Songs</h2>
          {songs.map(song => (
            <button
              key={song.id}
              className={`song-item ${player.currentSong?.id === song.id ? 'playing' : ''}`}
              onClick={() => handleSongSelect(song)}
            >
              <div className="song-cover">
                {song.coverArt ? (
                  <img src={song.coverArt} alt={song.title} />
                ) : (
                  <div className="song-cover-placeholder">♪</div>
                )}
              </div>
              <div className="song-info">
                <span className="song-title">{song.title}</span>
                <span className="song-artist">{song.artist}</span>
              </div>
              {player.currentSong?.id === song.id && player.isPlaying && (
                <div className="playing-indicator">
                  <span /><span /><span />
                </div>
              )}
            </button>
          ))}
        </div>
      </main>

      {/* Mini Player - Shows when song is selected */}
      {player.currentSong && (
        <MiniPlayer
          currentSong={player.currentSong}
          isPlaying={player.isPlaying}
          onPlayPause={player.togglePlay}
          onNext={player.playNext}
          onExpand={handleExpandPlayer}
        />
      )}

      {/* Full Player - Opens when mini player clicked */}
      {showFullPlayer && (
        <FullPlayer
          currentSong={player.currentSong}
          isPlaying={player.isPlaying}
          currentTime={player.currentTime}
          duration={player.duration}
          volume={player.volume}
          isShuffle={player.isShuffle}
          isRepeat={player.isRepeat}
          queue={player.queue}
          onPlayPause={player.togglePlay}
          onNext={player.playNext}
          onPrevious={player.playPrevious}
          onSeek={player.seek}
          onVolumeChange={player.setAudioVolume}
          onShuffleToggle={() => player.setIsShuffle(!player.isShuffle)}
          onRepeatToggle={() => player.setIsRepeat(!player.isRepeat)}
          onClose={handleCloseFullPlayer}
          onVisualize={handleVisualize}
          isVisualizing={showVisualizer}
        />
      )}

      {/* MilkDrop Visualizer - Opens when VISUALIZE clicked */}
      {showVisualizer && (
        <MilkDropVisualizer
          isPlaying={player.isPlaying}
          audioContext={player.audioContext}
          sourceNode={player.sourceNode}
          onClose={handleCloseVisualizer}
        />
      )}
    </div>
  )
}

export default App

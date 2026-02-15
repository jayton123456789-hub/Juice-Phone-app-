import { useState, useEffect } from 'react'
import { HiPlay, HiPause, HiHeart, HiFire } from 'react-icons/hi'
import { juiceApi } from '../api/juiceApi'
import CoverImage from '../components/CoverImage'
import { Song } from '../types'
import './Radio.css'

interface RadioProps {
  onSongSelect: (song: Song) => void
}

export default function Radio({ onSongSelect }: RadioProps) {
  const [stations, setStations] = useState([
    { id: 'released', name: 'Released Hits', color: '#1db954', icon: '🎵' },
    { id: 'unreleased', name: 'Unreleased Gems', color: '#ff006e', icon: '💎' },
    { id: 'mix', name: 'WRLD Mix', color: '#8338ec', icon: '🌎' },
    { id: 'deep', name: 'Deep Cuts', color: '#ffbe0b', icon: '🔥' }
  ])
  const [currentStation, setCurrentStation] = useState<string | null>(null)
  const [previewSongs, setPreviewSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadPreviewSongs()
  }, [])

  const loadPreviewSongs = async () => {
    try {
      const result = await juiceApi.getRadioSongs(6)
      setPreviewSongs(result)
    } catch (err) {
      console.error('Failed to load radio preview:', err)
    }
  }

  const startRadio = async (stationId: string) => {
    setCurrentStation(stationId)
    setLoading(true)
    
    try {
      let songs: Song[] = []
      
      switch (stationId) {
        case 'released':
          const released = await juiceApi.getSongs(1, 50, 'released')
          songs = released.songs.sort(() => Math.random() - 0.5).slice(0, 20)
          break
        case 'unreleased':
          const unreleased = await juiceApi.getSongs(1, 50, 'unreleased')
          songs = unreleased.songs.sort(() => Math.random() - 0.5).slice(0, 20)
          break
        default:
          songs = await juiceApi.getRadioSongs(20)
      }
      
      if (songs.length > 0) {
        onSongSelect(songs[0])
      }
    } catch (err) {
      console.error('Radio error:', err)
    } finally {
      setLoading(false)
      setCurrentStation(null)
    }
  }

  return (
    <div className="page radio-page">
      <div className="radio-header">
        <h1>Radio</h1>
        <p>Endless music for every mood</p>
      </div>

      {/* Featured Station */}
      <div className="featured-station">
        <div className="featured-art">
          <div className="featured-icon">📻</div>
        </div>
        <div className="featured-info">
          <span className="featured-label">FEATURED STATION</span>
          <h2>WRLD Radio</h2>
          <p>All Juice WRLD, all the time</p>
          <button 
            className="featured-play-btn"
            onClick={() => startRadio('mix')}
            disabled={loading}
          >
            {loading && currentStation === 'mix' ? (
              <span className="loading-dots">Loading</span>
            ) : (
              <><HiPlay /> Play Now</>
            )}
          </button>
        </div>
      </div>

      {/* Stations Grid */}
      <div className="stations-grid">
        {stations.map((station) => (
          <button
            key={station.id}
            className="station-card"
            style={{ background: `linear-gradient(135deg, ${station.color}, ${station.color}88)` }}
            onClick={() => startRadio(station.id)}
            disabled={loading}
          >
            <span className="station-icon">{station.icon}</span>
            <span className="station-name">{station.name}</span>
            {currentStation === station.id && loading && (
              <div className="station-loading">
                <div className="spinner-small"></div>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Coming Up */}
      <div className="coming-up-section">
        <h3>Coming Up</h3>
        <div className="coming-up-list">
          {previewSongs.map((song, index) => (
            <div 
              key={song.id} 
              className="coming-up-item"
              onClick={() => onSongSelect(song)}
            >
              <CoverImage src={song.coverArt} alt={song.title} size="small" />
              <div className="coming-up-info">
                <h4>{song.title}</h4>
                <p>{song.artist}</p>
              </div>
              <button className="coming-up-play">
                <HiPlay />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

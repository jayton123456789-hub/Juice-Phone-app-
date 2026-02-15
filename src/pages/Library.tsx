import { useState, useEffect } from 'react'
import { HiHeart, HiClock, HiFolder, HiPlus, HiTrash, HiPlay, HiX } from 'react-icons/hi'
import { Song } from '../types'
import { getPlaylists, savePlaylist, deletePlaylist, addSongToPlaylist, Playlist } from '../utils/storage'
import './Library.css'

interface LibraryProps {
  onSongSelect: (song: Song) => void
}

export default function Library({ onSongSelect }: LibraryProps) {
  const [favorites, setFavorites] = useState<Song[]>([])
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([])
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [activeTab, setActiveTab] = useState<'favorites' | 'recent' | 'playlists'>('favorites')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    // Load favorites
    const savedFavs = localStorage.getItem('favorites')
    if (savedFavs) {
      try {
        setFavorites(JSON.parse(savedFavs))
      } catch (e) {
        console.error('Failed to parse favorites:', e)
      }
    }

    // Load recently played
    const savedRecent = localStorage.getItem('recentlyPlayed')
    if (savedRecent) {
      try {
        setRecentlyPlayed(JSON.parse(savedRecent))
      } catch (e) {
        console.error('Failed to parse recently played:', e)
      }
    }

    // Load playlists
    setPlaylists(getPlaylists())
  }

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) return
    
    const newPlaylist: Playlist = {
      id: `playlist-${Date.now()}`,
      name: newPlaylistName.trim(),
      description: newPlaylistDesc.trim() || undefined,
      songIds: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    
    savePlaylist(newPlaylist)
    setPlaylists(getPlaylists())
    setShowCreateModal(false)
    setNewPlaylistName('')
    setNewPlaylistDesc('')
  }

  const handleDeletePlaylist = (id: string) => {
    if (confirm('Delete this playlist?')) {
      deletePlaylist(id)
      setPlaylists(getPlaylists())
    }
  }

  return (
    <div className="page library">
      <h1 className="library-title">Your Library</h1>

      <div className="library-tabs">
        <TabButton 
          active={activeTab === 'favorites'} 
          onClick={() => setActiveTab('favorites')}
          icon={<HiHeart />}
          label="Favorites"
        />
        <TabButton 
          active={activeTab === 'recent'} 
          onClick={() => setActiveTab('recent')}
          icon={<HiClock />}
          label="Recent"
        />
        <TabButton 
          active={activeTab === 'playlists'} 
          onClick={() => setActiveTab('playlists')}
          icon={<HiFolder />}
          label="Playlists"
        />
      </div>

      <div className="library-content">
        {activeTab === 'favorites' && (
          <FavoritesList favorites={favorites} onSongSelect={onSongSelect} />
        )}

        {activeTab === 'recent' && (
          <RecentList recentlyPlayed={recentlyPlayed} onSongSelect={onSongSelect} />
        )}

        {activeTab === 'playlists' && (
          <PlaylistsList 
            playlists={playlists}
            onCreate={() => setShowCreateModal(true)}
            onDelete={handleDeletePlaylist}
          />
        )}
      </div>

      {/* Stats */}
      <div className="library-stats">
        <StatCard value={favorites.length} label="Favorites" />
        <StatCard value={recentlyPlayed.length} label="Played" />
        <StatCard value={playlists.length} label="Playlists" />
      </div>

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Playlist</h3>
              <button onClick={() => setShowCreateModal(false)}><HiX /></button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                placeholder="Playlist Name"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                autoFocus
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={newPlaylistDesc}
                onChange={(e) => setNewPlaylistDesc(e.target.value)}
              />
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleCreatePlaylist}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TabButton({ active, onClick, icon, label }: { 
  active: boolean; 
  onClick: () => void; 
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button className={`lib-tab ${active ? 'active' : ''}`} onClick={onClick}>
      {icon}
      <span>{label}</span>
    </button>
  )
}

function FavoritesList({ favorites, onSongSelect }: { favorites: Song[], onSongSelect: (song: Song) => void }) {
  if (favorites.length === 0) {
    return <EmptyState icon={<HiHeart />} title="No favorites yet" subtitle="Songs you favorite will appear here" />
  }

  return (
    <div className="library-list">
      {favorites.map((song) => (
        <div key={song.id} className="library-item" onClick={() => onSongSelect(song)}>
          <div className="lib-cover">
            {song.coverArt ? <img src={song.coverArt} alt={song.title} /> : <div className="lib-cover-placeholder">🎵</div>}
          </div>
          <div className="lib-info">
            <h4>{song.title}</h4>
            <p>{song.artist}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function RecentList({ recentlyPlayed, onSongSelect }: { recentlyPlayed: Song[], onSongSelect: (song: Song) => void }) {
  if (recentlyPlayed.length === 0) {
    return <EmptyState icon={<HiClock />} title="No recent plays" subtitle="Songs you play will appear here" />
  }

  return (
    <div className="library-list">
      {recentlyPlayed.map((song) => (
        <div key={song.id} className="library-item" onClick={() => onSongSelect(song)}>
          <div className="lib-cover">
            {song.coverArt ? <img src={song.coverArt} alt={song.title} /> : <div className="lib-cover-placeholder">🎵</div>}
          </div>
          <div className="lib-info">
            <h4>{song.title}</h4>
            <p>{song.artist}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function PlaylistsList({ 
  playlists, 
  onCreate, 
  onDelete 
}: { 
  playlists: Playlist[], 
  onCreate: () => void,
  onDelete: (id: string) => void
}) {
  return (
    <>
      <button className="create-playlist-btn" onClick={onCreate}>
        <HiPlus />
        <span>Create New Playlist</span>
      </button>
      
      {playlists.length === 0 ? (
        <EmptyState icon={<HiFolder />} title="No playlists" subtitle="Create playlists to organize your songs" />
      ) : (
        <div className="playlist-grid">
          {playlists.map((playlist) => (
            <div key={playlist.id} className="playlist-card">
              <div className="playlist-icon">
                <HiFolder />
              </div>
              <div className="playlist-info">
                <h4>{playlist.name}</h4>
                <p>{playlist.songIds.length} songs</p>
                {playlist.description && <span className="playlist-desc">{playlist.description}</span>}
              </div>
              <button className="playlist-delete" onClick={() => onDelete(playlist.id)}>
                <HiTrash />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

function EmptyState({ icon, title, subtitle }: { icon: React.ReactNode, title: string, subtitle: string }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{subtitle}</p>
    </div>
  )
}

function StatCard({ value, label }: { value: number, label: string }) {
  return (
    <div className="stat-card">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  )
}

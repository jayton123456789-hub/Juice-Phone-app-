<p align="center">
  <img src="public/LOGO_WITH_NO_BACKGROUND.png" alt="WRLD" width="180" />
</p>

<h1 align="center">WRLD</h1>

<p align="center">
  <strong>The Ultimate Juice WRLD Desktop Music Experience</strong><br/>
  <em>2,700+ songs · MilkDrop visualizer · SoundCloud integration · infinite radio</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-2.0.0-blueviolet?style=flat-square" />
  <img src="https://img.shields.io/badge/platform-Windows%20x64-blue?style=flat-square" />
  <img src="https://img.shields.io/badge/electron-28-47848F?style=flat-square&logo=electron&logoColor=white" />
  <img src="https://img.shields.io/badge/react-18-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/license-proprietary-red?style=flat-square" />
</p>

---

## What is WRLD?

WRLD is a full-featured desktop music player built around the Juice WRLD catalog — over **2,700 tracks** spanning released albums, unreleased leaks, recording sessions, and unsurfaced material. It connects to a dedicated API that serves song metadata, cover art, lyrics, producer credits, era timelines, and audio streams.

Beyond the core catalog, WRLD integrates with **SoundCloud** so you can search, stream, and manage your likes and playlists from 340+ million tracks — all inside the same player.

The app is built with Electron, React, TypeScript, and the Web Audio API. It ships as a portable Windows executable with no installation required.

---

## Features

### Audio Engine
- **Web Audio API pipeline** — `AudioContext → MediaElementSource → 5-band EQ filters → GainNode → destination`
- **5-band parametric equalizer** with 9 presets (Flat, Bass Boost, Rock, Hip Hop, Electronic, Acoustic, Live, a custom Juice WRLD preset) and manual per-band control (60Hz / 230Hz / 910Hz / 3.6kHz / 14kHz, ±12dB)
- **Volume boost** mode via gain node for quiet tracks
- **Crossfade** support between tracks with configurable duration
- **Sleep timer** — auto-pause after a set number of minutes
- **Audio output device selection** — switch between speakers, headphones, DACs via `setSinkId`
- **Gapless queue playback** with auto-advance

### MilkDrop Visualizer
- Powered by **Butterchurn** (WebGL MilkDrop port) with **5 preset packs** loaded — hundreds of audio-reactive presets
- **Auto-cycling** with configurable interval (5–300 seconds) and crossfade transition time (0.5–10 seconds)
- **Preset search** across the full library, **favorite presets** with star system, and manual preset picker
- Full **keyboard control** inside the visualizer: play/pause, skip, volume, like, random preset, favorite, fullscreen
- **FPS counter** and **preset name overlay** (both toggleable)
- Auto-hiding glass HUD with song info, album art, and playback controls
- Proper audio graph cleanup on exit — no broken playback after closing

### Player Controls
- **Bottom player bar** with track info, cover art, play/pause, skip, shuffle, repeat, progress scrubbing, volume slider
- **Right sidebar** — now-playing panel with large cover art, song metadata (producers, engineers, recording locations, era, release year), expandable details, and lyrics viewer
- **Pop-out mini player** — separate always-on-top window with IPC state sync back to the main window
- **Draggable queue panel** with position memory, drag-to-reorder, save-queue-as-playlist, and per-song removal
- **Desktop notifications** on song change (toggleable)

### Library
- **Liked Songs** — local favorites list with heart toggle from any view
- **Recently Played** — full listening history
- **Playlists** — create, rename, delete custom playlists; add songs from the player or queue
- **Top Songs** — curated default playlist of 26 hand-picked tracks, loads instantly from cache
- **999 Club** — hidden easter egg playlist unlocked by entering `999` in settings (26 curated deep cuts)

### Radio
- **Three stations**: Random Mix, Official Releases, Unreleased
- **Infinite mode** — auto-fetches more songs when the queue runs low (≤3 songs remaining)
- Fisher-Yates shuffle with multi-page API pulls for maximum variety across 2,700+ tracks
- Toggle auto-load on/off, manual refresh

### Search
- **Juice WRLD mode**: search by title, artist, producer, era, or lyrics across the full catalog with category/era filters
- **SoundCloud mode**: full-text search across 340M+ tracks with genre and duration tags

### Browse & Discover
- **Home** — quick-access cards for recently played, favorites, trending, and radio shortcuts
- **Discover** — featured songs, era spotlights, and category exploration
- **Songs** — full sortable/filterable catalog browser

### Stats & Listening Data
- **Listening time tracking** — actual seconds listened per song (not just play counts), saved every 30 seconds
- **Activity chart** — 14-day bar graph of daily plays
- **Top tracks** by both listening time and play count (separate leaderboards, top 10 each)
- **Era breakdown** — percentage distribution across Juice WRLD eras
- **Streak counter** — consecutive days with at least one play
- Hero stats banner: total plays, listen time, unique tracks, streak

### SoundCloud Integration
- **OAuth PKCE login** — secure browser-based authentication with `wrld://` protocol callback
- **Client credentials flow** — public search and browse works without logging in (cached tokens with auto-refresh)
- **Liked tracks sync** — pull your SoundCloud likes into the library
- **Playlist sync** — your SoundCloud playlists and liked playlists
- **Followed artists** — view, follow/unfollow directly from the app
- **Stream playback** — resolves stream URLs per-track with 1-hour cache, falls back through transcodings
- **Mode toggle** — single-click logo button in the sidebar to swap between WRLD and SoundCloud modes; all views (search, library, home) adapt to the active mode
- **Listening profile** — tracks SoundCloud play history for personalized recommendations

### Customization & Settings
- **Custom keybinds** — rebind every shortcut (play/pause, skip, volume, shuffle, repeat, favorite, queue, visualizer) with duplicate detection and conflict warnings
- **Audio settings** — default volume, crossfade duration, auto-play, audio output device, notification toggle
- **Appearance** — theme options
- **Data management** — clear cache, listening history, favorites; storage version migration

### Quality of Life
- **Splash screen** — animated cyberpunk loading screen with progress bar and particle effects
- **Bug reporter** — built-in modal that captures a screenshot, recent console logs (errors/warnings/info), current song context, and sends directly to Firebase
- **Keyboard shortcuts everywhere** — Space/K for play/pause, arrows for skip/volume, L to like, Q for queue, V for visualizer, S for shuffle, R for repeat, M for mute, F11 for fullscreen
- **Custom window chrome** — draggable title bar with minimize/maximize/close, F11 fullscreen toggle
- **Queue persistence** — queue and current index survive app restarts via localStorage

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Electron 28 |
| Frontend | React 18 + TypeScript 5.3 |
| Bundler | Vite 5 |
| Styling | Pure CSS (no framework) |
| Audio | Web Audio API (AudioContext, BiquadFilter, GainNode, MediaElementSource) |
| Visualizer | Butterchurn 2.6 (WebGL MilkDrop) + 5 preset packs |
| 3D | Three.js r182 (used in auxiliary visualizer) |
| Icons | Lucide React + React Icons |
| Backend API | Custom REST API serving 2,700+ songs with metadata, lyrics, cover art |
| SoundCloud | OAuth 2.0 PKCE + Client Credentials, REST API v2 |
| Bug Reports | Firebase Firestore |
| Packaging | electron-builder (portable .exe) |

---

## Installation

### Download (recommended)
1. Go to [Releases](../../releases)
2. Download the latest `.zip` from Assets
3. Extract anywhere
4. Run `WRLD.exe`

No installer needed. Fully portable — runs from any folder, even a USB drive.

### Build from source
```bash
git clone https://github.com/jayton123456789-hub/WRLD.git
cd WRLD
npm install
npm run dev          # development mode with hot reload
npm run dist:win     # build portable .exe
Requires Node.js 18+ and npm.

Keyboard Shortcuts
All shortcuts are rebindable in Settings → Controls.

Key	Action
Space / K	Play / Pause
← →	Previous / Next track
↑ ↓	Volume up / down
M	Mute / Unmute
S	Toggle shuffle
R	Toggle repeat
L	Like / Unlike current song
Q	Open / Close queue
V	Open visualizer
F11	Toggle fullscreen
Escape	Close visualizer / Exit fullscreen

Inside the visualizer:

Key	Action
P	Random preset
F	Favorite current preset
← →	Skip tracks
↑ ↓	Volume
F11	Fullscreen

Easter Egg
Navigate to Settings and type 999 into the version field. This unlocks SoundCloud mode and reveals the 999 Club hidden playlist — a curated collection of 26 deep cuts.

System Requirements
OS: Windows 10/11 (x64)

RAM: 4 GB minimum (8 GB recommended)

GPU: Any GPU with WebGL support (for MilkDrop visualizer)

Internet: Required for streaming, radio, SoundCloud, and API access

Storage: ~200 MB for the portable app

Project Structure
graphql
Copy code
src/
├── api/                    # API clients
│   ├── juiceApi.ts         # Juice WRLD catalog REST API
│   ├── soundcloudApi.ts    # SoundCloud OAuth + API v2
│   └── musicAdapter.ts     # Unified adapter (mode-aware)
├── components/             # Shared UI components
│   ├── MilkDropVisualizer  # Butterchurn WebGL visualizer
│   ├── Equalizer           # 5-band parametric EQ
│   ├── QueuePanel          # Draggable queue with reorder
│   ├── ModeToggle          # WRLD ↔ SoundCloud logo button
│   ├── SoundCloudLogin     # OAuth modal with diagnostics
│   ├── BugReporter         # Screenshot + console log capture
│   ├── KeybindSettings     # Rebindable shortcuts
│   └── SplashScreen        # Animated loading screen
├── contexts/               # React context providers
│   └── MusicModeContext    # Global music mode state
├── desktop/                # Desktop-specific views
│   ├── DesktopLayout       # Main shell (sidebar, player bar, now-playing)
│   ├── DesktopHome         # Landing page with quick-access cards
│   ├── DesktopDiscover     # Featured songs and era spotlights
│   ├── DesktopSongs        # Full catalog browser
│   ├── DesktopLibrary      # Favorites, recent, playlists (WRLD + SC)
│   ├── DesktopSearch       # Dual-mode search
│   ├── DesktopRadio        # Infinite radio with 3 stations
│   └── DesktopStats        # Listening analytics dashboard
├── hooks/                  # Custom React hooks
│   ├── useAudioPlayer      # Core audio engine + Web Audio pipeline
│   ├── useMusicMode        # Mode switching logic
│   ├── useSoundCloudAuth   # OAuth PKCE flow
│   └── useKeyboardShortcuts# Global hotkeys
├── pages/                  # Page-level components
│   ├── Settings            # Audio, appearance, controls, SC, data
│   └── MiniPlayerWindow    # Pop-out mini player (separate Electron window)
├── types/                  # TypeScript interfaces
├── utils/                  # Storage, sync, recommendations
└── data/                   # Curated playlists (Top Songs, 999 Club)
Feedback & Bug Reports
Use the built-in bug reporter (Settings → Report Bug) — it captures your screen, console logs, and current context automatically.

Or open an issue on GitHub.

<p align="center"> <strong>999 Forever 💜</strong><br/> <em>Built by Jayton</em> </p> ```

# 🧃 Juice Phone App

A desktop app that looks and feels like a mobile music player for Juice WRLD.

## Features

- 🎵 Music player with full controls
- 📱 Mobile-like UI running as desktop EXE
- 🔍 Search songs, albums, artists
- ❤️ Favorites & Recently played
- 🎤 Lyrics display
- 💿 Spinning vinyl animation
- 🌙 Dark theme with neon accents

## Tech Stack

- React + TypeScript
- Vite
- Electron (for EXE)
- Juice WRLD API

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build EXE for Windows
npm run dist:win
```

## Project Structure

```
src/
├── api/        # API calls to Juice WRLD API
├── components/ # Reusable components
├── pages/      # Main pages (Home, Search, Library, Player)
├── types/      # TypeScript types
└── hooks/      # Custom React hooks
```

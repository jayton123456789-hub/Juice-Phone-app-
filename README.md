# WRLD 🎧

> A Juice WRLD-focused desktop music experience built with React + Electron.

WRLD is designed to feel smooth, modern, and immersive while keeping Juice WRLD’s catalog front-and-center. It includes discovery tools, radio-style playback, favorites/history, a fullscreen MilkDrop visualizer, keyboard controls, and a Windows EXE packaging flow.

---

## Why WRLD

- **Juice-first experience** with discovery flows tailored for eras, categories, and releases.
- **Desktop-native packaging** (Electron) so users can run a real `.exe` app.
- **Immersive playback** with queue management, fullscreen player controls, and MilkDrop visuals.
- **Power-user controls** like custom keybinds and EQ presets.

---

## Feature Highlights

### Core Playback
- Play/pause, next/previous, seek, repeat, shuffle, and volume controls.
- Queue-based playback with queue panel, remove song, and clear queue actions.
- Mini player + expanded/full player flow.

### Discovery + Browsing
- Home, Discover, Search, Library, Radio, and Settings sections.
- Discover filtering by era, year, producer, and sorting options.
- Search across songs/albums and jump directly into playback.

### Library + Personalization
- Favorites support (heart tracks you love).
- Recently played history.
- Persistent preferences saved in local storage.

### Radio Modes
- Random mix style listening.
- Released tracks stream.
- Unreleased/leaks-style stream mode.

### Advanced Experience
- MilkDrop visualizer integration (`butterchurn` + presets).
- 5-band equalizer with presets (including Juice WRLD custom preset).
- Rebindable keyboard shortcuts (gaming-style keybind settings).
- Lyrics panel support when lyrics are available.

### UI + Layout
- Desktop-focused layout with sidebar, top search, and persistent bottom player.
- Mobile-style mode is also present in the app logic for smaller viewport behavior.

---

## Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Desktop shell:** Electron
- **Visualizer:** butterchurn + butterchurn-presets
- **Routing/UI:** react-router-dom + custom CSS
- **API layer:** Axios-based Juice API client

---

## Quick Start (Development)

```bash
npm install
npm run dev
```

---

## Build Windows EXE

### Option A (project script)
```bash
npm run dist:win
```

### Option B (full cross-step build)
```bash
npm run dist
```

Current builder config is set to:
- **Windows target:** `portable`
- **Artifact name:** `WRLD.exe`
- **Output directory:** `release/`

So your build should generate a portable executable under the `release` folder.

---

## Public Release Goal: “Download ZIP → Extract → Run EXE”

If you want the smoothest public flow for people on Windows:

1. Build the app using `npm run dist:win`.
2. Confirm `release/WRLD.exe` exists.
3. Put `WRLD.exe` inside a folder named like `WRLD-v0.0.1-win64`.
4. Compress that folder into a ZIP.
5. Publish the ZIP in a GitHub Release (or similar file host).
6. Users download ZIP → extract → run `WRLD.exe`.

### Compatibility Notes
- Best for **Windows 10/11** users.
- Build on Windows for best compatibility with Windows users.
- You should still test the EXE on a clean machine before public launch.

---

## Release Status (Current Repo Snapshot)

- App version in `package.json`: **`0.0.1`**.
- Git tags/releases are not defined in this local repo snapshot yet (no tags found).
- Next recommended public tag: **`v0.0.1`** after validating your EXE build.

---

## Scripts

- `npm run dev` → Build Electron main and run the app.
- `npm run build` → Build React renderer.
- `npm run build:electron` → Compile Electron process.
- `npm run dist` → Build everything and package release.
- `npm run dist:win` → Build + package Windows release.

---

## Project Structure

```text
src/
  api/           # API calls
  components/    # Reusable UI + playback components
  desktop/       # Desktop layout and desktop-specific pages
  hooks/         # Audio player, keyboard shortcuts, user hooks
  pages/         # Main feature pages (Home, Discover, Radio, etc.)
  types/         # Shared TypeScript types
  utils/         # localStorage and helper utilities

electron/
  main.ts        # Electron main process
  preload.ts     # Electron preload bridge
```

---

## Brand + Assets

Logos/backgrounds/icons are included in `assets/`, `ASSEST/`, `public/`, and `desktopASS/` for splash/branding and packaging workflows.

---

## Author

Built by **Jayton**.

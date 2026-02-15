# WRLD 🎧

A Juice WRLD-focused desktop music experience built with **React + Electron**.

> Goal: users should be able to go to **Releases**, download, extract (if needed), and run `WRLD.exe`.

---

## 🚀 Quick Download (for users)

1. Open the repo’s **Releases** page.
2. Download either:
   - `WRLD.exe` (portable single-file app), or
   - `WRLD-<version>-portable.zip` (zipped portable package).
3. If you downloaded ZIP, extract it.
4. Double-click `WRLD.exe`.

That’s the simplest install flow.

---

## 🔥 Features

### Playback
- Play / Pause / Next / Previous
- Seek bar + volume controls
- Shuffle + repeat
- Queue management (view, remove tracks, clear queue)
- Mini player + full player modes

### Discovery & Navigation
- Home, Discover, Search, Library, Radio, Settings tabs
- Desktop sidebar layout + top search
- Discover filtering options (era, year, producer, sort)

### Personalization
- Favorites (heart tracks)
- Recently played history
- localStorage persistence for settings/preferences

### Advanced audio + visuals
- Fullscreen MilkDrop visualizer (`butterchurn`)
- 5-band Equalizer with presets (including Juice WRLD profile)
- Rebindable keyboard shortcuts
- Lyrics panel (when lyrics are available)

### Packaging
- Electron-based desktop app
- Windows portable output with Electron Builder

---

## 🧱 Tech Stack

- React + TypeScript + Vite
- Electron + Electron Builder
- Axios API client
- butterchurn + butterchurn-presets

---

## 🛠️ Development

```bash
npm install
npm run dev
```

Useful scripts:

- `npm run dev` → build Electron main + run app
- `npm run build` → TypeScript + Vite production build
- `npm run build:electron` → Electron process build
- `npm run dist` → package app for configured targets
- `npm run dist:win` → package Windows release

---

## 📦 Release flow (maintainers)

This repo includes automation for release assets:

- Workflow: `.github/workflows/windows-release.yml`
- Trigger: push a tag matching `v*` (example: `v0.0.2`)
- Output assets attached to GitHub Release:
  - `WRLD.exe`
  - `WRLD-<tag>-portable.zip`

### Publish a new release

1. Update version in `package.json`.
2. Commit changes.
3. Create and push tag:

```bash
git tag v0.0.2
git push origin <branch> --tags
```

4. GitHub Action builds and uploads EXE + ZIP to the Release.

For a concise checklist, see `docs/RELEASE_PROCESS.md`.

---

## 🗂️ Project Structure

```text
src/
  api/
  components/
  desktop/
  hooks/
  pages/
  types/
  utils/

electron/
  main.ts
  preload.ts
```

---

## 👤 Author

Built by **Jayton**.

# WRLD 🎧

WRLD is a Juice WRLD desktop music app you can run on Windows.

## What you get

- Juice WRLD-focused music player
- Home, Discover, Search, Library, Radio, Settings
- Favorites + recently played
- Queue controls
- MilkDrop visualizer
- 5-band EQ + presets
- Custom keyboard shortcuts

## Easiest way to download

Go to **GitHub Releases** and download either:
- `WRLD.exe` (portable app)
- `WRLD-<version>-portable.zip` (zip version)

Then:
1. Download
2. Extract if needed
3. Double-click `WRLD.exe`

That’s it.

## Run in development

```bash
npm install
npm run dev
```

## Build Windows EXE locally

```bash
npm run dist:win
```

Output goes to `release/`.

## Scripts

- `npm run dev` - run app in dev mode
- `npm run build` - build renderer
- `npm run build:electron` - build Electron process
- `npm run dist` - full package
- `npm run dist:win` - Windows package

## Version / releases

- Current app version is in `package.json`.
- Create a git tag like `v0.0.1` to publish a release.
- This repo now includes a GitHub Action that builds and attaches `WRLD.exe` and ZIP to the Release automatically when you push a version tag.

## Author

Built by **Jayton**.

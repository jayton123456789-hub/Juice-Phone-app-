# 🔨 Build Scripts for WRLD

## Quick Start

### Option 1: Full Build with Status (RECOMMENDED)
Double-click: **`BUILD_NEW_EXE.bat`**

This will:
1. Build the React app
2. Build the Electron main process
3. Package everything into an EXE
4. Open the folder with your new WRLD.exe
5. Show detailed progress and pause at the end

**Output location:** `C:\Users\jayto\JuicePhoneApp\release\win-unpacked\WRLD.exe`

---

### Option 2: Quick Build (Silent)
Double-click: **`QUICK_BUILD.bat`**

Same as above but faster and with minimal output.

---

## Build Time
- **First build:** ~2-3 minutes (needs to download dependencies)
- **Subsequent builds:** ~30-60 seconds

---

## What Gets Built

```
C:\Users\jayto\JuicePhoneApp\
├── dist/                          # React build output
├── dist-electron/                 # Electron main process
└── release/
    └── win-unpacked/
        └── WRLD.exe              # ← YOUR EXECUTABLE
```

---

## Troubleshooting

### "npm not found"
- Make sure Node.js is installed
- Try opening a new command prompt

### "Build failed"
- Run `npm install` first
- Check for TypeScript errors: `npm run build`

### "EXE doesn't work"
- Make sure the entire `win-unpacked` folder stays together
- Don't move WRLD.exe out of the folder (it needs the other files)

---

## Manual Build Commands

If the batch scripts don't work, run these commands in order:

```bash
cd C:\Users\jayto\JuicePhoneApp
npm run build
npm run build:electron
npx electron-builder --win --dir
```

---

## After Building

Your EXE is ready to run! Just double-click:
`C:\Users\jayto\JuicePhoneApp\release\win-unpacked\WRLD.exe`

**Note:** Keep the entire `win-unpacked` folder together. The EXE needs the resources folder and other files.

---

## Version Info

Current version: **0.0.1**

To change version, edit `package.json`:
```json
"version": "0.0.1"
```

---

## Build Options

### Create Portable EXE (Single File)
Edit `package.json` build config:
```json
"win": {
  "target": "portable"
}
```

Then run: `npx electron-builder --win`
Output: `release\WRLD.exe` (single file, larger size)

### Current Setup (Unpacked)
```json
"win": {
  "target": "dir"
}
```
Output: `release\win-unpacked\WRLD.exe` (smaller, needs folder)

---

## 🎉 Latest Features

This build includes:
- ✅ Visualizer hotkeys (Space, arrows, L, P, M, ESC)
- ✅ Auto-play next song
- ✅ Working queue panel
- ✅ Enhanced metadata display
- ✅ All the fixes from FIXES_SUMMARY.md

---

Generated: February 14, 2026

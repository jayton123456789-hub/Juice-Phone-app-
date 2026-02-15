const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')
const os = require('os')

const isDev = process.env.NODE_ENV === 'development'

// Config file path for storing settings before app is ready
const configPath = path.join(os.homedir(), '.wrld-app-config.json')

// Default config
const defaultConfig = {
  desktopMode: true,
  windowBounds: {
    desktop: { width: 1200, height: 800 }
  }
}

// Read config
function readConfig() {
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf8')
      const config = { ...defaultConfig, ...JSON.parse(data) }
      return { ...config, desktopMode: true }
    }
  } catch (e) {
    console.error('Failed to read config:', e)
  }
  return defaultConfig
}

let mainWindow: typeof BrowserWindow | null = null

function createWindow() {
  const config = readConfig()
  const bounds = config.windowBounds.desktop

  mainWindow = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    minWidth: 900,
    minHeight: 600,
    resizable: true,
    maximizable: true,
    fullscreenable: true,
    frame: false,
    transparent: true,
    roundedCorners: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
      webgl: true,              // Enable WebGL for MilkDrop
      offscreen: false          // Disable offscreen rendering for WebGL
    },
    icon: path.join(__dirname, '../public/EXE ICON.png'),
    titleBarStyle: 'hidden',
    vibrancy: 'under-window',
    backgroundMaterial: 'acrylic'
  })

  // Center the window on screen
  mainWindow.center()

  // Desktop mode is the only supported mode
  mainWindow.maximize()

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
    app.quit()
  })
}

app.whenReady().then(() => {
  createWindow()
  
  // IPC handlers for window controls
  ipcMain.on('window-minimize', () => {
    const win = BrowserWindow.getFocusedWindow()
    if (win) win.minimize()
  })
  
  ipcMain.on('window-close', () => {
    const win = BrowserWindow.getFocusedWindow()
    if (win) win.close()
  })

  ipcMain.handle('get-desktop-mode', () => true)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

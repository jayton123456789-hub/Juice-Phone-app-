const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')
const os = require('os')

const isDev = process.env.NODE_ENV === 'development'

// Config file path for storing settings before app is ready
const configPath = path.join(os.homedir(), '.wrld-app-config.json')

// Default config
const defaultConfig = {
  desktopMode: false,
  windowBounds: {
    phone: { width: 390, height: 844 },
    desktop: { width: 1200, height: 800 }
  }
}

// Read config
function readConfig() {
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf8')
      return { ...defaultConfig, ...JSON.parse(data) }
    }
  } catch (e) {
    console.error('Failed to read config:', e)
  }
  return defaultConfig
}

// Write config
function writeConfig(config: any) {
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
  } catch (e) {
    console.error('Failed to write config:', e)
  }
}

let mainWindow: typeof BrowserWindow | null = null

function createWindow() {
  const config = readConfig()
  const isDesktop = config.desktopMode
  const bounds = isDesktop ? config.windowBounds.desktop : config.windowBounds.phone

  mainWindow = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    minWidth: isDesktop ? 900 : 390,
    minHeight: isDesktop ? 600 : 600,
    resizable: isDesktop, // Only resizable in desktop mode
    maximizable: isDesktop,
    fullscreenable: isDesktop,
    frame: false,
    transparent: true,
    roundedCorners: !isDesktop, // Rounded corners only in phone mode
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

  // In desktop mode, maximize by default
  if (isDesktop) {
    mainWindow.maximize()
  }

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

  // IPC handler for setting desktop mode
  ipcMain.on('set-desktop-mode', (_event: any, enabled: boolean) => {
    const config = readConfig()
    config.desktopMode = enabled
    writeConfig(config)
  })

  // IPC handler to get current mode
  ipcMain.handle('get-desktop-mode', () => {
    const config = readConfig()
    return config.desktopMode
  })

  // IPC handler to resize window for mode switch
  ipcMain.on('resize-for-mode', (_event: any, isDesktop: boolean) => {
    if (!mainWindow) return
    
    const config = readConfig()
    const bounds = isDesktop ? config.windowBounds.desktop : config.windowBounds.phone
    
    if (isDesktop) {
      // Enable resizing and maximize
      mainWindow.setResizable(true)
      mainWindow.setMaximizable(true)
      mainWindow.setFullScreenable(true)
      // setRoundedCorners not available in this Electron version
      mainWindow.maximize()
    } else {
      // Disable resizing and set phone size
      mainWindow.setResizable(false)
      mainWindow.setMaximizable(false)
      mainWindow.setFullScreenable(false)
      // setRoundedCorners not available in this Electron version
      mainWindow.unmaximize()
      mainWindow.setSize(bounds.width, bounds.height)
      mainWindow.center()
    }
  })
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

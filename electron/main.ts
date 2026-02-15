const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')
const os = require('os')

const isDev = process.env.NODE_ENV === 'development'
const RESETTABLE_CONFIG_PATHS = [
  path.join(os.homedir(), '.wrld-app-config.json'),
  path.join(os.homedir(), '.wrld-player-config.json')
]

let mainWindow: typeof BrowserWindow | null = null

function resetAppStateFiles() {
  for (const configPath of RESETTABLE_CONFIG_PATHS) {
    try {
      if (fs.existsSync(configPath)) {
        fs.rmSync(configPath, { force: true })
      }
    } catch (e) {
      console.error('Failed to reset app-state config:', configPath, e)
    }
  }
}

function createWindow() {
  resetAppStateFiles()

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
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
      webgl: true,
      offscreen: false
    },
    icon: path.join(__dirname, '../public/EXE ICON.png'),
    titleBarStyle: 'hidden',
    vibrancy: 'under-window',
    backgroundMaterial: 'acrylic'
  })

  mainWindow.center()
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

  ipcMain.on('window-minimize', () => {
    const win = BrowserWindow.getFocusedWindow()
    if (win) win.minimize()
  })

  ipcMain.on('window-close', () => {
    const win = BrowserWindow.getFocusedWindow()
    if (win) win.close()
  })

  ipcMain.handle('get-desktop-mode', () => true)
  ipcMain.handle('reset-app-state', () => {
    resetAppStateFiles()
    return true
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

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  minimize: () => ipcRenderer.send('window-minimize'),
  close: () => ipcRenderer.send('window-close'),
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  setDesktopMode: (enabled: boolean) => ipcRenderer.send('set-desktop-mode', enabled),
  getDesktopMode: () => ipcRenderer.invoke('get-desktop-mode'),
  resizeForMode: (isDesktop: boolean) => ipcRenderer.send('resize-for-mode', isDesktop)
})

export interface ElectronAPI {
  platform: string
  minimize?: () => void
  close?: () => void
  minimizeWindow?: () => void
  closeWindow?: () => void
  getDesktopMode?: () => Promise<boolean>
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

export {}

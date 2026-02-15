export interface ElectronAPI {
  platform: string
  minimize?: () => void
  close?: () => void
  minimizeWindow?: () => void
  closeWindow?: () => void
  setDesktopMode?: (enabled: boolean) => void
  getDesktopMode?: () => Promise<boolean>
  resizeForMode?: (isDesktop: boolean) => void
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

export {}

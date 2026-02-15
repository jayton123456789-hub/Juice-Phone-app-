export interface ElectronAPI {
  platform: string
  minimize?: () => void
  close?: () => void
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

export {}

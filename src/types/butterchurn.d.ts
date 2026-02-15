// Type definitions for butterchurn
// ACTUAL API: butterchurn.createVisualizer(audioContext, canvas, options)

declare module 'butterchurn' {
  export interface Visualizer {
    loadPreset(preset: unknown, blendTime: number): void
    connectAudio(sourceNode: AudioNode): void
    render(): void
    setRendererSize(width: number, height: number): void
  }
  
  export interface VisualizerOptions {
    width: number
    height: number
    pixelRatio?: number
    meshWidth?: number
    meshHeight?: number
    textureRatio?: number
  }
  
  // butterchurn module has createVisualizer method
  export function createVisualizer(
    audioContext: AudioContext,
    canvas: HTMLCanvasElement,
    options: VisualizerOptions
  ): Visualizer
  
  // Default export also has createVisualizer
  const butterchurn: {
    createVisualizer: typeof createVisualizer
  }
  
  export default butterchurn
}

declare module 'butterchurn-presets' {
  export function getPresets(): Record<string, unknown>
  const presets: { getPresets: typeof getPresets }
  export default presets
}

# Butterchurn Audio Visualizer Integration Guide

This guide explains how to properly integrate `butterchurn` (Milkdrop visualizer) into the WRLD music player app.

## Overview

Butterchurn is a WebGL implementation of Milkdrop, the legendary audio visualization engine from Winamp. It renders stunning psychedelic visualizations synced to music.

- **GitHub**: https://github.com/jberg/butterchurn
- **Presets**: https://github.com/jberg/butterchurn-presets
- **Example**: https://butterchurnviz.com/

## Installation

```bash
npm install butterchurn butterchurn-presets
```

## Key Concepts

### 1. AudioContext Requirement

Butterchurn requires direct access to a Web Audio API `AudioContext`. It **CANNOT** work with just an HTML `<audio>` element - you must create a MediaElementSource.

```typescript
// 1. Get your audio element
const audio = document.querySelector('audio')

// 2. Create AudioContext
const audioContext = new (window.AudioContext || window.webkitAudioContext)()

// 3. Create MediaElementSource - this is the KEY step
const source = audioContext.createMediaElementSource(audio)

// 4. Connect to destination (speakers) so you can hear it
source.connect(audioContext.destination)
```

### 2. The Critical Issue: "Cannot create multiple MediaElementSources"

The most common error when integrating butterchurn:

```
Failed to execute 'createMediaElementSource' on 'AudioContext': 
HTMLMediaElement already connected previously to a different MediaElementSourceNode.
```

**Why this happens:**
- You can only call `createMediaElementSource()` ONCE per audio element
- If your app already has an AudioContext connecting to the audio element, you can't create another one

**Solutions:**

#### Option A: Share AudioContext (Recommended)

Create ONE AudioContext in your app's audio hook and share it with the visualizer:

```typescript
// useAudioPlayer.ts
export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null)
  
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || sourceNodeRef.current) return
    
    // Create AudioContext only once
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    audioContextRef.current = audioContext
    
    // Create source only once
    const source = audioContext.createMediaElementSource(audio)
    sourceNodeRef.current = source
    
    // Connect to destination
    source.connect(audioContext.destination)
    
    return () => {
      audioContext.close()
    }
  }, [])
  
  // Expose the source node for visualizer to use
  return {
    audioRef,
    audioContext: audioContextRef.current,
    sourceNode: sourceNodeRef.current,
  }
}
```

Then in visualizer:

```typescript
// Visualizer.tsx
const visualizer = butterchurn.createVisualizer(audioContext, canvas, {
  width: canvas.width,
  height: canvas.height,
  meshWidth: 128,
  meshHeight: 96,
})

// Connect using the EXISTING source node
visualizer.connectAudio(sourceNode)
```

#### Option B: Visualizer Creates Its Own Context

Let the visualizer create the AudioContext and MediaElementSource, then use that for audio playback:

```typescript
// Visualizer.tsx
const audioContext = new (window.AudioContext || window.webkitAudioContext)()
const source = audioContext.createMediaElementSource(audioElement)

// Create visualizer
const visualizer = butterchurn.createVisualizer(audioContext, canvas, options)
visualizer.connectAudio(source)

// Don't forget to connect to speakers!
source.connect(audioContext.destination)

// Return the audioContext so the rest of the app can use it
return { audioContext, source }
```

### 3. Proper Butterchurn Initialization

```typescript
import butterchurn from 'butterchurn'
import butterchurnPresets from 'butterchurn-presets'

async function initVisualizer(audioContext, canvas, audioSource) {
  // 1. Create visualizer instance
  const visualizer = butterchurn.createVisualizer(audioContext, canvas, {
    width: canvas.width,
    height: canvas.height,
    meshWidth: 128,      // Higher = more detailed but slower
    meshHeight: 96,
    textureRatio: 1,     // Texture quality (1 = full)
  })
  
  // 2. Connect audio
  visualizer.connectAudio(audioSource)
  
  // 3. Load presets
  const presets = butterchurnPresets.getPresets()
  const presetKeys = Object.keys(presets)
  
  // 4. Load a random preset
  const randomPreset = presetKeys[Math.floor(Math.random() * presetKeys.length)]
  visualizer.loadPreset(presets[randomPreset], 0) // 0 = immediate, or use seconds for transition
  
  // 5. Start render loop
  function render() {
    visualizer.render()
    requestAnimationFrame(render)
  }
  render()
  
  return visualizer
}
```

### 4. Preset Management

```typescript
// Get all presets
const presets = butterchurnPresets.getPresets()
const presetKeys = Object.keys(presets)

// Load a preset with smooth transition
function loadPreset(visualizer, presetName, transitionTime = 2.7) {
  visualizer.loadPreset(presets[presetName], transitionTime)
}

// Cycle through presets
let currentPresetIndex = 0
function nextPreset(visualizer) {
  currentPresetIndex = (currentPresetIndex + 1) % presetKeys.length
  const presetName = presetKeys[currentPresetIndex]
  visualizer.loadPreset(presets[presetName], 2.7)
}
```

### 5. Responsive Canvas

```typescript
function resizeCanvas(canvas, visualizer) {
  const dpr = window.devicePixelRatio || 1
  const rect = canvas.getBoundingClientRect()
  
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  
  visualizer.setRendererSize(rect.width, rect.height)
}

// Call on resize
window.addEventListener('resize', () => resizeCanvas(canvas, visualizer))
```

## Full Working Example

```typescript
import { useEffect, useRef, useState } from 'react'
import butterchurn from 'butterchurn'
import butterchurnPresets from 'butterchurn-presets'

export function MilkdropVisualizer({ isPlaying }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const visualizerRef = useRef<any>(null)
  const [currentPreset, setCurrentPreset] = useState('')
  
  useEffect(() => {
    const init = async () => {
      const canvas = canvasRef.current
      if (!canvas) return
      
      // Get audio element
      const audio = document.querySelector('audio')
      if (!audio) return
      
      try {
        // Create AudioContext
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
        const audioContext = new AudioContextClass()
        
        // Create MediaElementSource (ONCE!)
        const source = audioContext.createMediaElementSource(audio)
        
        // Create visualizer
        const visualizer = butterchurn.createVisualizer(audioContext, canvas, {
          width: 1920,
          height: 1080,
          meshWidth: 128,
          meshHeight: 96,
        })
        
        // Connect audio
        visualizer.connectAudio(source)
        source.connect(audioContext.destination) // Important!
        
        // Load preset
        const presets = butterchurnPresets.getPresets()
        const presetKeys = Object.keys(presets)
        const randomKey = presetKeys[Math.floor(Math.random() * presetKeys.length)]
        visualizer.loadPreset(presets[randomKey], 0)
        setCurrentPreset(randomKey)
        
        visualizerRef.current = visualizer
        
        // Render loop
        const render = () => {
          if (isPlaying) {
            visualizer.render()
          }
          requestAnimationFrame(render)
        }
        render()
        
      } catch (error) {
        console.error('Visualizer init failed:', error)
      }
    }
    
    init()
  }, [])
  
  const nextPreset = () => {
    const visualizer = visualizerRef.current
    if (!visualizer) return
    
    const presets = butterchurnPresets.getPresets()
    const presetKeys = Object.keys(presets)
    const randomKey = presetKeys[Math.floor(Math.random() * presetKeys.length)]
    
    visualizer.loadPreset(presets[randomKey], 2.7)
    setCurrentPreset(randomKey)
  }
  
  return (
    <div className="visualizer-container">
      <canvas 
        ref={canvasRef} 
        width={1920} 
        height={1080}
        style={{ width: '100%', height: '100%' }}
      />
      <button onClick={nextPreset}>Next Preset</button>
    </div>
  )
}
```

## TypeScript Types

```typescript
// types/butterchurn.d.ts
declare module 'butterchurn' {
  export interface VisualizerOptions {
    width: number
    height: number
    meshWidth?: number
    meshHeight?: number
    textureRatio?: number
  }
  
  export interface Visualizer {
    render(): void
    loadPreset(preset: object, transitionTime: number): void
    connectAudio(sourceNode: AudioNode): void
    setRendererSize(width: number, height: number): void
  }
  
  export default function createVisualizer(
    audioContext: AudioContext,
    canvas: HTMLCanvasElement,
    options: VisualizerOptions
  ): Visualizer
}

declare module 'butterchurn-presets' {
  export function getPresets(): Record<string, object>
}
```

## Performance Tips

1. **Lower mesh resolution** for better performance on weak GPUs:
   ```typescript
   { meshWidth: 64, meshHeight: 48 } // Low quality
   { meshWidth: 128, meshHeight: 96 } // Medium (default)
   { meshWidth: 256, meshHeight: 192 } // High quality
   ```

2. **Pause rendering** when not playing to save battery:
   ```typescript
   if (isPlaying) visualizer.render()
   ```

3. **Use smaller canvas** and let CSS scale it up:
   ```typescript
   canvas.width = 960  // Internal resolution
   canvas.height = 540
   canvas.style.width = '100%'  // Display size
   canvas.style.height = '100%'
   ```

## Common Issues

### Issue: Visualizer shows black screen
**Causes:**
- AudioContext not resumed (browsers suspend it until user interaction)
- Canvas has no size (width/height = 0)
- Audio not actually playing

**Fix:**
```typescript
// Resume AudioContext on user interaction
audioContext.resume()

// Ensure canvas has size
canvas.width = canvas.offsetWidth
canvas.height = canvas.offsetHeight
```

### Issue: Visualizer renders but no audio
**Cause:** Forgot to connect source to destination

**Fix:**
```typescript
source.connect(audioContext.destination)
```

### Issue: Presets don't change
**Cause:** Wrong preset object structure

**Fix:**
```typescript
// Correct - pass the preset object
visualizer.loadPreset(presets['presetName'], 2.7)

// Wrong - don't pass the name string
visualizer.loadPreset('presetName', 2.7)
```

## Resources

- [Butterchurn GitHub](https://github.com/jberg/butterchurn)
- [Butterchurn Presets](https://github.com/jberg/butterchurn-presets)
- [Butterchurn Example](https://butterchurnviz.com/)
- [Milkdrop Wiki](https://wiki.winamp.com/wiki/MilkDrop_Preset_Authoring)

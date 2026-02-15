# Visualizer Implementation Guide

## Libraries Used
1. **butterchurn** - Milkdrop visualizer (Winamp-style)
2. **butterchurn-presets** - 1000+ presets for butterchurn
3. **three** - 3D graphics library for particle visualizer

## Installation
```bash
npm install butterchurn butterchurn-presets three
npm install -D @types/three
```

## How It Works

### Butterchurn (Milkdrop)
- Uses Web Audio API to analyze frequency data
- Renders preset-based visualizations to canvas
- Supports thousands of community presets
- Most professional looking visualizer

### Custom Visualizers
- **Kaleidoscope**: Canvas 2D with radial symmetry
- **Particles**: Three.js 3D particle system

## Audio Context Setup
The visualizer needs access to the audio element's context:

```typescript
const audio = document.querySelector('audio')
const audioContext = new AudioContext()
const analyser = audioContext.createAnalyser()
const source = audioContext.createMediaElementSource(audio)
source.connect(analyser)
analyser.connect(audioContext.destination)
```

## Butterchurn Usage
```typescript
import butterchurn from 'butterchurn'
import butterchurnPresets from 'butterchurn-presets'

const visualizer = butterchurn.createVisualizer(audioContext, canvas, {
  width: 1920,
  height: 1080
})

// Load preset
const presets = butterchurnPresets.getPresets()
visualizer.loadPreset(presets['preset-name'], blendTime)

// Connect audio
visualizer.connectAudio(audioNode)

// Render loop
visualizer.render()
```

## Current Issues to Fix
1. Album covers not displaying - CSS issue with img vs div selectors
2. Discover cards too large - CSS grid sizing issue  
3. Visualizer not rendering - Audio context connection issue
4. Need proper error handling for missing audio

## Testing Checklist
- [ ] Album covers display in all views
- [ ] Discover grid uses correct image sizes
- [ ] Visualizer switches modes properly
- [ ] Audio analysis works (check browser console)
- [ ] Performance is smooth (60fps)

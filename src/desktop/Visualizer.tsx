import { useEffect, useRef, useState } from 'react'
import './Visualizer.css'

interface VisualizerProps {
  isPlaying: boolean
  mode: 'milkdrop' | 'kaleidoscope' | 'particles' | 'off'
}

// Milkdrop Visualizer using butterchurn
export function MilkdropVisualizer({ isPlaying }: { isPlaying: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const visualizerRef = useRef<any>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const animationRef = useRef<number>(0)
  const [presetName, setPresetName] = useState('')

  useEffect(() => {
    const initVisualizer = async () => {
      const canvas = canvasRef.current
      if (!canvas || visualizerRef.current) return

      try {
        // Dynamically import butterchurn
        const butterchurn = await import('butterchurn')
        const presets = await import('butterchurn-presets')
        
        // Get audio element
        const audio = document.querySelector('audio') as HTMLAudioElement
        if (!audio) return

        // Create new audio context for visualizer
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
        const audioContext = new AudioContextClass()
        audioContextRef.current = audioContext

        // Create visualizer
        const visualizer = (butterchurn as any).default(audioContext, canvas, {
          width: canvas.width,
          height: canvas.height,
          meshWidth: 128,
          meshHeight: 96,
        })
        
        visualizerRef.current = visualizer

        // Connect audio
        const source = audioContext.createMediaElementSource(audio)
        visualizer.connectAudio(source)

        // Load random preset
        const presetKeys = Object.keys(presets.getPresets())
        const randomKey = presetKeys[Math.floor(Math.random() * presetKeys.length)]
        visualizer.loadPreset(presets.getPresets()[randomKey], 0)
        setPresetName(randomKey)
        
      } catch (e) {
        console.error('Visualizer init error:', e)
      }
    }

    initVisualizer()

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [])

  // Render loop
  useEffect(() => {
    const visualizer = visualizerRef.current
    if (!visualizer) return

    const render = () => {
      if (isPlaying) {
        visualizer.render()
      }
      animationRef.current = requestAnimationFrame(render)
    }

    animationRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animationRef.current)
  }, [isPlaying])

  const nextPreset = async () => {
    const visualizer = visualizerRef.current
    if (!visualizer) return
    
    try {
      const presets = await import('butterchurn-presets')
      const presetKeys = Object.keys(presets.getPresets())
      const randomKey = presetKeys[Math.floor(Math.random() * presetKeys.length)]
      visualizer.loadPreset(presets.getPresets()[randomKey], 2.7)
      setPresetName(randomKey)
    } catch (e) {
      console.error('Preset error:', e)
    }
  }

  return (
    <div className="viz-milkdrop">
      <canvas 
        ref={canvasRef} 
        className="viz-canvas" 
        width={1920} 
        height={1080}
      />
      <button className="viz-preset-btn" onClick={nextPreset}>
        NEXT: {presetName.slice(0, 20)}...
      </button>
    </div>
  )
}

// Kaleidoscope Canvas Visualizer
export function KaleidoscopeVisualizer({ isPlaying }: { isPlaying: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const rotationRef = useRef(0)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)

  useEffect(() => {
    const initAudio = async () => {
      const audio = document.querySelector('audio') as HTMLAudioElement
      if (!audio || analyserRef.current) return

      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
        const audioContext = new AudioContextClass()
        const analyser = audioContext.createAnalyser()
        analyser.fftSize = 256
        
        const source = audioContext.createMediaElementSource(audio)
        source.connect(analyser)
        analyser.connect(audioContext.destination)
        
        analyserRef.current = analyser
        dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount)
      } catch (e) {
        console.error('Audio init error:', e)
      }
    }

    initAudio()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const analyser = analyserRef.current
    const dataArray = dataArrayRef.current
    
    if (!ctx || !analyser || !dataArray || !canvas || !dataArrayRef.current) return

    const draw = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      analyser.getByteFrequencyData(dataArray as any)
      
      ctx.fillStyle = 'rgba(5, 5, 10, 0.25)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const segments = 12
      const radius = Math.min(centerX, centerY) * 0.7
      
      let avgFreq = 0
      for (let i = 0; i < dataArray.length; i++) {
        avgFreq += dataArray[i]
      }
      avgFreq /= dataArray.length
      
      const hue = (Date.now() / 50 + avgFreq) % 360
      
      ctx.save()
      ctx.translate(centerX, centerY)
      rotationRef.current += 0.002 + avgFreq / 50000
      ctx.rotate(rotationRef.current)
      
      for (let i = 0; i < segments; i++) {
        ctx.save()
        ctx.rotate((i / segments) * Math.PI * 2)
        
        ctx.beginPath()
        for (let j = 0; j < 64; j++) {
          const dataIdx = Math.floor((j / 64) * dataArray.length)
          const amp = dataArray[dataIdx] / 255
          
          const angle = (j / 64) * (Math.PI / segments)
          const r = radius * 0.3 + radius * 0.7 * amp
          
          const x = Math.cos(angle) * r
          const y = Math.sin(angle) * r
          
          if (j === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        
        ctx.closePath()
        
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius)
        grad.addColorStop(0, `hsla(${hue + i * 30}, 80%, 50%, 0)`)
        grad.addColorStop(0.5, `hsla(${hue + i * 30}, 70%, 45%, ${0.2 + avgFreq / 500})`)
        grad.addColorStop(1, `hsla(${hue + i * 30}, 60%, 40%, 0)`)
        
        ctx.fillStyle = grad
        ctx.fill()
        
        ctx.scale(-1, 1)
        ctx.fill()
        
        ctx.restore()
      }
      
      ctx.restore()
      
      const glowSize = 50 + avgFreq / 2
      const glow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowSize)
      glow.addColorStop(0, `hsla(${hue}, 100%, 60%, ${0.3 + avgFreq / 400})`)
      glow.addColorStop(1, 'transparent')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      animationRef.current = requestAnimationFrame(draw)
    }

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(draw)
    }
    
    return () => cancelAnimationFrame(animationRef.current)
  }, [isPlaying])

  return (
    <canvas 
      ref={canvasRef} 
      className="viz-kaleidoscope"
      width={1920}
      height={1080}
    />
  )
}

// Simple fallback visualizer
export function SimpleVisualizer({ isPlaying }: { isPlaying: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)
  const animationRef = useRef<number>(0)

  useEffect(() => {
    const init = async () => {
      const audio = document.querySelector('audio') as HTMLAudioElement
      if (!audio || analyserRef.current) return

      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
        const audioContext = new AudioContextClass()
        const analyser = audioContext.createAnalyser()
        analyser.fftSize = 64
        
        const source = audioContext.createMediaElementSource(audio)
        source.connect(analyser)
        analyser.connect(audioContext.destination)
        
        analyserRef.current = analyser
        dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount)
      } catch (e) {
        console.error('Audio error:', e)
      }
    }

    init()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const analyser = analyserRef.current
    const dataArray = dataArrayRef.current
    
    if (!ctx || !analyser || !dataArray || !canvas) return

    const draw = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      analyser.getByteFrequencyData(dataArray as any)
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      const barWidth = canvas.width / dataArray.length
      
      for (let i = 0; i < dataArray.length; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.8
        const hue = (i / dataArray.length) * 360
        
        ctx.fillStyle = `hsla(${hue}, 100%, 50%, 0.8)`
        ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 2, barHeight)
      }
      
      animationRef.current = requestAnimationFrame(draw)
    }

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(draw)
    }
    
    return () => cancelAnimationFrame(animationRef.current)
  }, [isPlaying])

  return (
    <canvas 
      ref={canvasRef} 
      className="viz-simple"
      width={1920}
      height={1080}
    />
  )
}

// Main Visualizer Component
export default function Visualizer({ isPlaying, mode }: VisualizerProps) {
  if (mode === 'off') return null
  
  // Use simple fallback for now until butterchurn is properly integrated
  if (mode === 'milkdrop') {
    return <SimpleVisualizer isPlaying={isPlaying} />
  }
  
  if (mode === 'kaleidoscope') return <KaleidoscopeVisualizer isPlaying={isPlaying} />
  if (mode === 'particles') return <SimpleVisualizer isPlaying={isPlaying} />
  
  return null
}

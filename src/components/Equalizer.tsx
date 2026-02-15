import { useState, useEffect } from 'react'
import './Equalizer.css'

interface EqualizerProps {
  onClose: () => void
}

interface EQPreset {
  name: string
  values: number[]
}

const PRESETS: EQPreset[] = [
  { name: 'Flat', values: [0, 0, 0, 0, 0] },
  { name: 'Bass Boost', values: [8, 6, 0, -2, -4] },
  { name: 'Treble Boost', values: [-4, -2, 0, 6, 8] },
  { name: 'Rock', values: [6, 4, -2, 2, 6] },
  { name: 'Hip Hop', values: [8, 6, 0, 2, 4] },
  { name: 'Electronic', values: [6, 4, 2, 4, 6] },
  { name: 'Acoustic', values: [4, 2, 2, 2, 4] },
  { name: 'Live', values: [4, 0, 2, 2, 4] },
  { name: 'Juice WRLD', values: [7, 5, 2, 3, 6] }
]

const FREQUENCIES = ['60Hz', '230Hz', '910Hz', '3.6kHz', '14kHz']

export default function Equalizer({ onClose }: EqualizerProps) {
  const [enabled, setEnabled] = useState(() => {
    return localStorage.getItem('eqEnabled') === 'true'
  })
  const [values, setValues] = useState<number[]>(() => {
    const saved = localStorage.getItem('eqValues')
    return saved ? JSON.parse(saved) : [0, 0, 0, 0, 0]
  })
  const [selectedPreset, setSelectedPreset] = useState<string>('Flat')

  // Save EQ settings
  useEffect(() => {
    localStorage.setItem('eqEnabled', String(enabled))
    localStorage.setItem('eqValues', JSON.stringify(values))
    
    // TODO: Implement audio EQ in backend
    // if (window.electronAPI?.setEQ) {
    //   window.electronAPI.setEQ(enabled, values)
    // }
  }, [enabled, values])

  const handleValueChange = (index: number, value: number) => {
    const newValues = [...values]
    newValues[index] = value
    setValues(newValues)
    setSelectedPreset('Custom')
  }

  const applyPreset = (preset: EQPreset) => {
    setValues(preset.values)
    setSelectedPreset(preset.name)
  }

  return (
    <div className="equalizer-overlay" onClick={onClose}>
      <div className="equalizer-panel" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="eq-header">
          <h2>Equalizer</h2>
          <label className="eq-toggle">
            <input 
              type="checkbox" 
              checked={enabled} 
              onChange={e => setEnabled(e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>

        {/* Presets */}
        <div className="eq-presets">
          {PRESETS.map(preset => (
            <button
              key={preset.name}
              className={selectedPreset === preset.name ? 'active' : ''}
              onClick={() => applyPreset(preset)}
            >
              {preset.name}
            </button>
          ))}
        </div>

        {/* Sliders */}
        <div className="eq-sliders">
          {FREQUENCIES.map((freq, i) => (
            <div key={freq} className="eq-band">
              <input
                type="range"
                min="-12"
                max="12"
                value={values[i]}
                onChange={e => handleValueChange(i, Number(e.target.value))}
                disabled={!enabled}
              />
              <div className="eq-value">{values[i] > 0 ? '+' : ''}{values[i]} dB</div>
              <div className="eq-freq">{freq}</div>
            </div>
          ))}
        </div>

        {/* Reset Button */}
        <button className="eq-reset" onClick={() => applyPreset(PRESETS[0])}>
          Reset to Flat
        </button>
      </div>
    </div>
  )
}

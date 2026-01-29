import React, { useEffect, useRef, useState, useMemo } from 'react'
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, 
  Settings, Subtitles, ChevronRight, Check, Loader2,
  FastForward, Rewind, SkipForward, SkipBack
} from 'lucide-react'
import { BRAND } from '@/brand/brand'
import { Button } from '@/components/ui/Button'

interface CustomPlayerProps {
  src: string
  poster?: string
  title?: string
  autoPlay?: boolean
  onEnded?: () => void
}

type Quality = 'original' | '1080p' | '720p' | '480p' | '360p' | '240p' | '32px'
type SubtitleState = 'off' | 'ai-en' | 'ai-cs' | 'ai-auto'

export function CustomPlayer({ src, poster, title, autoPlay, onEnded }: CustomPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // State
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [buffering, setBuffering] = useState(false)
  
  // Settings State
  const [showSettings, setShowSettings] = useState(false)
  const [settingsView, setSettingsView] = useState<'main' | 'quality' | 'subtitles' | 'speed'>('main')
  const [quality, setQuality] = useState<Quality>('original')
  const [subtitle, setSubtitle] = useState<SubtitleState>('off')
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  
  // Computed Source URL based on Quality
  const currentSrc = useMemo(() => {
    if (!src.includes('cloudinary.com')) return src
    
    // Insert transformation before /v[0-9]/ or /upload/
    const parts = src.split('/upload/')
    if (parts.length !== 2) return src
    
    let transform = ''
    switch (quality) {
      case '1080p': transform = 'c_limit,h_1080,w_1920,q_auto'; break
      case '720p': transform = 'c_limit,h_720,w_1280,q_auto'; break
      case '480p': transform = 'c_limit,h_480,w_854,q_auto'; break
      case '360p': transform = 'c_limit,h_360,w_640,q_auto'; break
      case '240p': transform = 'c_limit,h_240,w_426,q_auto'; break
      case '32px': transform = 'c_limit,h_32,q_auto'; break // "Pixel" mode / Low bandwidth
      default: return src
    }
    
    return `${parts[0]}/upload/${transform}/${parts[1]}`
  }, [src, quality])

  // Effects
  useEffect(() => {
    if (autoPlay && videoRef.current) {
      videoRef.current.play().catch(() => setPlaying(false))
    }
  }, [autoPlay])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return

    // Save current time when switching quality
    const savedTime = currentTime
    const wasPlaying = playing

    // When src changes, React updates the video tag. 
    // We need to restore position if it's a quality switch (handled by Playback logic mostly, but let's be safe)
    // Actually, simple src change resets the player. We need to handle this carefully.
    
    const handleLoadedMetadata = () => {
        setDuration(v.duration)
        if (savedTime > 0 && Math.abs(v.currentTime - savedTime) > 1) {
            v.currentTime = savedTime
        }
        if (wasPlaying) v.play().catch(() => {})
    }

    v.addEventListener('loadedmetadata', handleLoadedMetadata)
    return () => v.removeEventListener('loadedmetadata', handleLoadedMetadata)
  }, [currentSrc]) // Re-run when source changes

  // Handlers
  const togglePlay = () => {
    if (!videoRef.current) return
    if (playing) videoRef.current.pause()
    else videoRef.current.play()
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    if (videoRef.current) {
        videoRef.current.currentTime = time
        setCurrentTime(time)
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setFullscreen(true)
    } else {
      document.exitFullscreen()
      setFullscreen(false)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div 
      ref={containerRef}
      className="group relative aspect-video w-full overflow-hidden bg-black font-sans select-none"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => {
        setHovering(false)
        setShowSettings(false)
      }}
    >
      <video
        ref={videoRef}
        src={currentSrc}
        poster={poster}
        className="h-full w-full object-contain"
        onClick={togglePlay}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onWaiting={() => setBuffering(true)}
        onPlaying={() => setBuffering(false)}
        onEnded={onEnded}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      />

      {/* Brand Logo Overlay */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none opacity-80">
        <img src={BRAND.assets.logoIcon} alt="Logo" className="h-8 w-auto" />
      </div>

      {/* Buffering Indicator */}
      {buffering && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/20">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )}

      {/* Subtitles Overlay (Mock AI) */}
      {subtitle !== 'off' && (
        <div className="absolute bottom-20 left-0 right-0 text-center pointer-events-none px-8">
            <span className="inline-block bg-black/60 text-white text-lg px-4 py-1 rounded">
                {subtitle === 'ai-auto' ? 'AI: Překládám titulky...' : 
                 subtitle === 'ai-cs' ? 'AI: Čeština' :
                 subtitle === 'ai-de' ? 'AI: Deutsch' :
                 subtitle === 'ai-fr' ? 'AI: Français' :
                 subtitle === 'ai-es' ? 'AI: Español' :
                 'AI Titulky (Demo)'}
            </span>
        </div>
      )}

      {/* Controls Overlay */}
      <div 
        className={`absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 ${
          playing && !hovering ? 'opacity-0 cursor-none' : 'opacity-100'
        }`}
      >
        <div className="p-4 space-y-2">
          {/* Progress Bar */}
          <div className="group/slider relative h-1.5 w-full cursor-pointer rounded-full bg-white/20 hover:h-2 transition-all">
            <div 
                className="absolute h-full rounded-full bg-primary" 
                style={{ width: `${(currentTime / duration) * 100}%` }} 
            />
            <input 
                type="range" 
                min={0} 
                max={duration || 100} 
                value={currentTime} 
                onChange={handleSeek}
                className="absolute inset-0 w-full opacity-0 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={togglePlay} className="text-white hover:text-primary transition">
                {playing ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
              </button>
              
              <div className="group/vol flex items-center gap-2">
                <button onClick={() => setMuted(!muted)} className="text-white hover:text-primary transition">
                  {muted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <div className="w-0 overflow-hidden transition-all group-hover/vol:w-20">
                    <input 
                        type="range" 
                        min={0} 
                        max={1} 
                        step={0.1} 
                        value={muted ? 0 : volume} 
                        onChange={(e) => {
                            const v = parseFloat(e.target.value)
                            setVolume(v)
                            setMuted(v === 0)
                            if(videoRef.current) videoRef.current.volume = v
                        }}
                        className="h-1 w-full rounded-full bg-white/30 accent-primary"
                    />
                </div>
              </div>

              <div className="text-xs font-medium text-white/90">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center gap-3 relative">
               {/* Subtitles Button */}
               <button 
                onClick={() => {
                    setShowSettings(true)
                    setSettingsView('subtitles')
                }}
                className={`transition ${subtitle !== 'off' ? 'text-primary' : 'text-white hover:text-white/80'}`}
              >
                <Subtitles size={20} />
              </button>

              {/* Settings Button */}
              <div className="relative">
                  <button 
                    onClick={() => {
                        setShowSettings(!showSettings)
                        setSettingsView('main')
                    }} 
                    className={`transition ${showSettings ? 'rotate-90 text-primary' : 'text-white hover:text-white/80'}`}
                  >
                    <Settings size={20} />
                  </button>

                  {/* Settings Menu Popup */}
                  {showSettings && (
                    <div className="absolute bottom-10 right-0 w-64 rounded-xl bg-black/90 border border-white/10 p-2 shadow-xl backdrop-blur-md animate-fadeUp z-50">
                        {settingsView === 'main' && (
                            <div className="space-y-1">
                                <button 
                                    onClick={() => setSettingsView('quality')}
                                    className="flex w-full items-center justify-between px-3 py-2 text-sm text-white hover:bg-white/10 rounded-lg transition"
                                >
                                    <div className="flex items-center gap-2">
                                        <Settings size={16} />
                                        <span>Kvalita</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-white/60">
                                        <span>{quality === 'original' ? 'Auto (Original)' : quality}</span>
                                        <ChevronRight size={14} />
                                    </div>
                                </button>
                                <button 
                                    onClick={() => setSettingsView('subtitles')}
                                    className="flex w-full items-center justify-between px-3 py-2 text-sm text-white hover:bg-white/10 rounded-lg transition"
                                >
                                    <div className="flex items-center gap-2">
                                        <Subtitles size={16} />
                                        <span>Titulky (AI)</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-white/60">
                                        <span>{subtitle === 'off' ? 'Vypnuto' : 'Zapnuto'}</span>
                                        <ChevronRight size={14} />
                                    </div>
                                </button>
                                <button 
                                    onClick={() => setSettingsView('speed')}
                                    className="flex w-full items-center justify-between px-3 py-2 text-sm text-white hover:bg-white/10 rounded-lg transition"
                                >
                                    <div className="flex items-center gap-2">
                                        <FastForward size={16} />
                                        <span>Rychlost</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-white/60">
                                        <span>{playbackSpeed}x</span>
                                        <ChevronRight size={14} />
                                    </div>
                                </button>
                            </div>
                        )}

                        {settingsView === 'quality' && (
                            <div>
                                <div className="flex items-center gap-2 border-b border-white/10 pb-2 mb-1 px-2">
                                    <button onClick={() => setSettingsView('main')} className="hover:text-primary"><ChevronRight className="rotate-180" size={16}/></button>
                                    <span className="font-semibold text-sm">Kvalita</span>
                                </div>
                                <div className="max-h-60 overflow-y-auto">
                                    {(['original', '1080p', '720p', '480p', '360p', '240p', '32px'] as const).map(q => (
                                        <button
                                            key={q}
                                            onClick={() => {
                                                setQuality(q)
                                                setShowSettings(false)
                                            }}
                                            className="flex w-full items-center justify-between px-3 py-2 text-sm text-white hover:bg-white/10 rounded-lg transition"
                                        >
                                            <span>{q === 'original' ? 'Auto (Original)' : q}</span>
                                            {quality === q && <Check size={14} className="text-primary" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {settingsView === 'subtitles' && (
                             <div>
                                <div className="flex items-center gap-2 border-b border-white/10 pb-2 mb-1 px-2">
                                    <button onClick={() => setSettingsView('main')} className="hover:text-primary"><ChevronRight className="rotate-180" size={16}/></button>
                                    <span className="font-semibold text-sm">AI Titulky</span>
                                </div>
                                <div className="space-y-1">
                                    <button onClick={() => setSubtitle('off')} className="flex w-full justify-between px-3 py-2 text-sm hover:bg-white/10 rounded-lg">
                                        <span>Vypnuto</span>
                                        {subtitle === 'off' && <Check size={14} className="text-primary" />}
                                    </button>
                                    <div className="px-3 py-1 text-xs text-muted font-bold uppercase mt-2">AI Generování</div>
                                    <button onClick={() => setSubtitle('ai-auto')} className="flex w-full justify-between px-3 py-2 text-sm hover:bg-white/10 rounded-lg">
                                        <span>Automatický překlad</span>
                                        {subtitle === 'ai-auto' && <Check size={14} className="text-primary" />}
                                    </button>
                                    <button onClick={() => setSubtitle('ai-cs')} className="flex w-full justify-between px-3 py-2 text-sm hover:bg-white/10 rounded-lg">
                                        <span>Čeština (AI)</span>
                                        {subtitle === 'ai-cs' && <Check size={14} className="text-primary" />}
                                    </button>
                                    <button onClick={() => setSubtitle('ai-en')} className="flex w-full justify-between px-3 py-2 text-sm hover:bg-white/10 rounded-lg">
                                        <span>English (AI)</span>
                                        {subtitle === 'ai-en' && <Check size={14} className="text-primary" />}
                                    </button>
                                    <button onClick={() => setSubtitle('ai-de')} className="flex w-full justify-between px-3 py-2 text-sm hover:bg-white/10 rounded-lg">
                                        <span>Deutsch (AI)</span>
                                        {subtitle === 'ai-de' && <Check size={14} className="text-primary" />}
                                    </button>
                                    <button onClick={() => setSubtitle('ai-fr')} className="flex w-full justify-between px-3 py-2 text-sm hover:bg-white/10 rounded-lg">
                                        <span>Français (AI)</span>
                                        {subtitle === 'ai-fr' && <Check size={14} className="text-primary" />}
                                    </button>
                                    <button onClick={() => setSubtitle('ai-es')} className="flex w-full justify-between px-3 py-2 text-sm hover:bg-white/10 rounded-lg">
                                        <span>Español (AI)</span>
                                        {subtitle === 'ai-es' && <Check size={14} className="text-primary" />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {settingsView === 'speed' && (
                             <div>
                                <div className="flex items-center gap-2 border-b border-white/10 pb-2 mb-1 px-2">
                                    <button onClick={() => setSettingsView('main')} className="hover:text-primary"><ChevronRight className="rotate-180" size={16}/></button>
                                    <span className="font-semibold text-sm">Rychlost přehrávání</span>
                                </div>
                                <div className="space-y-1">
                                    {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(speed => (
                                        <button 
                                            key={speed}
                                            onClick={() => {
                                                setPlaybackSpeed(speed)
                                                if(videoRef.current) videoRef.current.playbackRate = speed
                                                setShowSettings(false)
                                            }} 
                                            className="flex w-full justify-between px-3 py-2 text-sm hover:bg-white/10 rounded-lg"
                                        >
                                            <span>{speed}x</span>
                                            {playbackSpeed === speed && <Check size={14} className="text-primary" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                  )}
              </div>

              <button onClick={toggleFullscreen} className="text-white hover:text-primary transition">
                {fullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

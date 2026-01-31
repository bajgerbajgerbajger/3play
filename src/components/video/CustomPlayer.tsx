import React, { useEffect, useRef, useState, useMemo } from 'react'
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, 
  Settings, Subtitles, ChevronRight, Check, Loader2,
  FastForward, Rewind, SkipForward, SkipBack
} from 'lucide-react'
import { BRAND } from '@/brand/brand'
import { Button } from '@/components/ui/Button'

// --- GENIUS BUTTON COMPONENT ---
// Removed legacy GeniusPlayButton as it is replaced by ThreePlayButton


interface CustomPlayerProps {
  src: string
  poster?: string
  title?: string
  autoPlay?: boolean
  onEnded?: () => void
  className?: string
}

type Quality = 'original' | '1080p' | '720p' | '480p' | '360p' | '240p' | '32px'
type SubtitleState = 'off' | 'ai-en' | 'ai-cs' | 'ai-auto' | 'ai-de' | 'ai-fr' | 'ai-es'

export function CustomPlayer({ src, poster, title, autoPlay, onEnded, className }: CustomPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const bgVideoRef = useRef<HTMLVideoElement>(null)
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
  const [showClickAnim, setShowClickAnim] = useState<'play' | 'pause' | null>(null)
  
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

  // Play Button Interaction & Parallax Logic
  const playBtnRef = useRef<HTMLButtonElement>(null)
  const tiltRef = useRef({ cx: 0, cy: 0, tx: 0, ty: 0, isHover: false })
  const rafRef = useRef<number>()

  useEffect(() => {
    const btn = playBtnRef.current
    if (!btn) return

    const animate = () => {
      // Spring smoothing
      tiltRef.current.cx += (tiltRef.current.tx - tiltRef.current.cx) * 0.08
      tiltRef.current.cy += (tiltRef.current.ty - tiltRef.current.cy) * 0.08

      // Apply tilt via CSS variables to allow composing with other transforms
      btn.style.setProperty('--tilt-x', `${tiltRef.current.cx}deg`)
      btn.style.setProperty('--tilt-y', `${tiltRef.current.cy}deg`)
      
      rafRef.current = requestAnimationFrame(animate)
    }
    animate()

    // Scroll tilt
    const handleScroll = () => {
        const y = window.scrollY
        const t = Math.min(y / 18, 14)
        // If not hovering, tilt based on scroll
        if (!tiltRef.current.isHover) {
            tiltRef.current.tx = t
            tiltRef.current.ty = -t
        }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
        window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const handleBtnMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = playBtnRef.current
    if (!btn) return
    
    const r = btn.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    const dx = (e.clientX - cx) / (r.width / 2)
    const dy = (e.clientY - cy) / (r.height / 2)
    
    // Flag hover state for scroll logic
    tiltRef.current.isHover = true

    // Combine scroll tilt with mouse tilt
    const scrollTilt = Math.min(window.scrollY / 18, 14)
    tiltRef.current.ty = (-scrollTilt) + (dx * 6)
    tiltRef.current.tx = (scrollTilt) + (-dy * 6)
  }

  const handleBtnMouseLeave = () => {
    tiltRef.current.isHover = false
    const t = Math.min(window.scrollY / 18, 14)
    tiltRef.current.tx = t
    tiltRef.current.ty = -t
  }

  const handleBtnClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    const btn = playBtnRef.current
    if (!btn) return

    // Ripple effect
    const r = btn.getBoundingClientRect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    
    const ripple = document.createElement('span')
    ripple.className = 'absolute rounded-full bg-white/60 pointer-events-none animate-ripple'
    ripple.style.left = `${x}px`
    ripple.style.top = `${y}px`
    ripple.style.width = ripple.style.height = `${Math.max(r.width, r.height)}px`
    ripple.style.transform = 'translate(-50%, -50%) scale(0)'
    
    btn.appendChild(ripple)
    ripple.addEventListener('animationend', () => ripple.remove())

    // "Pop" animation
    btn.animate( 
        [ 
          { filter: 'brightness(1) saturate(1)', transform: getComputedStyle(btn).transform }, 
          { filter: 'brightness(1.12) saturate(1.25)', offset: 0.35 }, 
          { filter: 'brightness(1.02) saturate(1.1)' } 
        ], 
        { duration: 320, easing: 'cubic-bezier(.34,1.56,.64,1)' } 
    )

    togglePlay()
  }



  // Sync Background Video
  useEffect(() => {
    const bg = bgVideoRef.current
    if (!bg) return

    if (playing) {
        bg.play().catch(() => {})
    } else {
        bg.pause()
    }
  }, [playing])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return

    // Save current time when switching quality
    const savedTime = currentTime
    const wasPlaying = playing

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

  // Handle Fullscreen Change (Escape key etc.)
  useEffect(() => {
    const handleFullscreenChange = () => {
        setFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Handlers
  const togglePlay = () => {
    if (!videoRef.current) return
    if (playing) {
      videoRef.current.pause()
      setShowClickAnim('pause')
    } else {
      videoRef.current.play()
      setShowClickAnim('play')
    }
    setTimeout(() => setShowClickAnim(null), 600)
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
        setCurrentTime(videoRef.current.currentTime)
        // Sync background video
        if (bgVideoRef.current && Math.abs(bgVideoRef.current.currentTime - videoRef.current.currentTime) > 0.5) {
            bgVideoRef.current.currentTime = videoRef.current.currentTime
        }
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    if (videoRef.current) {
        videoRef.current.currentTime = time
        setCurrentTime(time)
        if (bgVideoRef.current) {
            bgVideoRef.current.currentTime = time
        }
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(console.error)
    } else {
      document.exitFullscreen().catch(console.error)
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
      className={`group relative w-full overflow-hidden bg-black font-sans select-none ${className ?? (fullscreen ? 'h-full w-full' : 'aspect-video')}`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => {
        setHovering(false)
        setShowSettings(false)
      }}
    >
      {/* Background Ambient Video */}
      <div className="absolute inset-0 -z-10 overflow-hidden bg-black">
        <video
            ref={bgVideoRef}
            src={currentSrc}
            className="h-full w-full object-cover blur-3xl opacity-50 scale-150"
            muted
            loop
            playsInline
            aria-hidden="true"
        />
        <div className="absolute inset-0 bg-black/30" /> {/* Dimming overlay */}
      </div>

      <video
        ref={videoRef}
        crossOrigin="anonymous"
        src={currentSrc}
        poster={poster}
        className="h-full w-full object-contain relative z-10"
        onClick={togglePlay}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onWaiting={() => setBuffering(true)}
        onPlaying={() => setBuffering(false)}
        onEnded={onEnded}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      />

      {/* Brand Logo Overlay - MOVED TO CONTROLS */}

      {/* Center Click Animation */}
      {showClickAnim && (
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none animate-in fade-in zoom-in duration-300">
          <div className="bg-black/50 rounded-full p-4 backdrop-blur-sm">
            {showClickAnim === 'play' ? (
              <Play size={48} className="fill-white text-white" />
            ) : (
              <Pause size={48} className="fill-white text-white" />
            )}
          </div>
        </div>
      )}

      {/* Buffering Indicator */}
      {buffering && (
        <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/20">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )}

      {/* Subtitles Overlay (Mock AI) */}
      {subtitle !== 'off' && (
        <div className="absolute bottom-20 left-0 right-0 text-center pointer-events-none px-8 z-20">
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
        className={`absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 z-30 ${
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
              <img src={BRAND.assets.logoIcon} alt="Logo" className="h-6 w-auto object-contain drop-shadow-md select-none pointer-events-none" />
              <button 
                  ref={playBtnRef}
                  onClick={handleBtnClick}
                  className="relative text-white hover:text-primary transition flex items-center drop-shadow-md overflow-hidden rounded-full p-1"
                  onMouseMove={handleBtnMouseMove}
                  onMouseLeave={handleBtnMouseLeave}
              >
                {playing ? (
                  <Pause size={24} fill="currentColor" className="relative z-10" />
                ) : (
                  <Play size={24} fill="currentColor" className="relative z-10" />
                )}
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

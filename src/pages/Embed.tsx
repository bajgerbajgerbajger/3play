import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { apiFetch } from '@/lib/api'
import { CustomPlayer } from '@/components/video/CustomPlayer'
import { SafeEmbed } from '@/components/video/SafeEmbed'

// Helper to detect if a URL is likely an embeddable player URL
function isEmbedUrl(url: string) {
  if (!url) return false
  const u = url.toLowerCase().trim()
  return (
    u.includes('hqq.ac') || 
    u.includes('netu.tv') || 
    u.includes('waaw.to') || 
    u.includes('youtube.com/embed') || 
    u.includes('player') ||
    (!u.match(/\.(mp4|webm|ogg|mov)$/i) && u.startsWith('http'))
  )
}

type VideoDetail = {
  id: string
  title: string
  thumbnailUrl: string
  sourceUrl: string
  embedCode?: string
  durationSeconds: number
  channel?: {
    displayName: string
    avatarUrl: string
  }
}

export default function Embed() {
  const { videoId } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [video, setVideo] = useState<VideoDetail | null>(null)

  useEffect(() => {
    if (!videoId) return
    let alive = true
    setLoading(true)
    setError(null)
    
    apiFetch<{ success: true; video: VideoDetail }>(`/api/videos/${encodeURIComponent(videoId)}`)
      .then((v) => {
        if (!alive) return
        setVideo(v.video)
      })
      .catch((e: unknown) => {
        if (!alive) return
        setError(e instanceof Error ? e.message : 'Failed to load video')
      })
      .finally(() => {
        if (!alive) return
        setLoading(false)
      })
      
    return () => {
      alive = false
    }
  }, [videoId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-black text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    )
  }

  if (error || !video) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-black text-white p-4 text-center">
        <div>
          <h1 className="text-xl font-bold mb-2">Video nedostupné</h1>
          <p className="text-sm text-gray-400">{error || 'Video nebylo nalezeno.'}</p>
        </div>
      </div>
    )
  }

  const isEmbed = isEmbedUrl(video.sourceUrl)

  return (
    <div className="h-screen w-screen bg-black overflow-hidden relative">
      {isEmbed ? (
        <SafeEmbed 
          code={video.sourceUrl} 
          className="h-full w-full" 
        />
      ) : video.embedCode ? (
        <div 
          dangerouslySetInnerHTML={{ __html: video.embedCode }} 
          className="h-full w-full [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0"
        />
      ) : (
        <CustomPlayer 
          src={video.sourceUrl} 
          poster={video.thumbnailUrl}
          autoPlay={false}
          className="h-full w-full"
        />
      )}
      
      {/* Branding Overlay (Optional - removes on hover or interaction could be complex, keeping simple for now) */}
      <a 
        href={`/watch/${video.id}`} 
        target="_blank" 
        rel="noopener noreferrer"
        className="absolute top-4 right-4 z-50 opacity-50 hover:opacity-100 transition-opacity"
      >
        <span className="font-bold text-white text-shadow-md">3Play</span>
      </a>
    </div>
  )
}

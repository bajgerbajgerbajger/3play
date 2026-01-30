import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { apiFetch } from '@/lib/api'
import { Skeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import { VideoCard, type VideoListItem } from '@/components/video/VideoCard'
import { formatCompactNumber } from '@/lib/format'
import { getDominantColor } from '@/lib/colors'
import { useAuthStore } from '@/store/auth'
import { ChannelEditor } from '@/components/channel/ChannelEditor'
import { SubscribeButton } from '@/components/channel/SubscribeButton'
import { Pencil } from 'lucide-react'

type ChannelInfo = {
  id: string
  handle: string
  displayName: string
  avatarUrl: string
  bannerUrl: string
  bio: string
  socialLinks?: { platform: string; url: string }[]
  subscribers: number
  totalViews: number
  videoCount: number
}

export default function Channel() {
  const { handle } = useParams()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [channel, setChannel] = useState<ChannelInfo | null>(null)
  const [videos, setVideos] = useState<VideoListItem[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [avatarShadowColor, setAvatarShadowColor] = useState('rgba(0,0,0,0.2)')

  useEffect(() => {
    if (!handle) return
    let alive = true
    setLoading(true)
    setError(null)
    Promise.all([
      apiFetch<{ success: true; channel: ChannelInfo }>(`/api/channels/${encodeURIComponent(handle)}`),
      apiFetch<{ success: true; items: VideoListItem[] }>(`/api/channels/${encodeURIComponent(handle)}/videos?sort=latest`),
    ])
      .then(([c, v]) => {
        if (!alive) return
        setChannel(c.channel)
        setVideos(v.items)
        if (c.channel.avatarUrl) {
          getDominantColor(c.channel.avatarUrl).then((color) => {
            if (alive) setAvatarShadowColor(color)
          })
        }
      })
      .catch((e: unknown) => {
        if (!alive) return
        setError(e instanceof Error ? e.message : 'Failed')
      })
      .finally(() => {
        if (!alive) return
        setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [handle])

  const isOwner = user && channel && user.handle === channel.handle

  return (
    <div className="space-y-6 animate-fadeUp">
      {channel ? (
        <Helmet>
          <title>{channel.displayName} - 3Play</title>
          <meta name="description" content={channel.bio || `Check out ${channel.displayName} on 3Play.`} />
          <meta property="og:title" content={channel.displayName} />
          <meta property="og:description" content={channel.bio || `Check out ${channel.displayName} on 3Play.`} />
          <meta property="og:image" content={channel.avatarUrl} />
          <meta property="og:type" content="profile" />
        </Helmet>
      ) : null}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-[180px] w-full rounded-2xl" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-2/5" />
            </div>
          </div>
        </div>
      ) : channel ? (
        <>
          <div className="overflow-hidden rounded-2xl border border-border/10 bg-surface">
            <div className="h-[200px] w-full bg-surface2 relative group">
              <img src={channel.bannerUrl} alt="Channel banner" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-surface/80 via-transparent to-transparent opacity-60" />
            </div>
            <div className="px-6 pb-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between relative">
                <div className="flex items-end gap-5 -mt-10 sm:-mt-12 relative z-10">
                  <div className="relative group">
                    <div 
                      className="absolute -inset-0.5 rounded-full opacity-75 blur group-hover:opacity-100 transition duration-500"
                      style={{
                        backgroundColor: avatarShadowColor,
                        boxShadow: `0 0 20px ${avatarShadowColor}`
                      }}
                    />
                    <img src={channel.avatarUrl} alt={channel.displayName} className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-full object-cover border-4 border-surface shadow-2xl" />
                  </div>
                  <div className="mb-2 hidden sm:block">
                    <h1 className="font-heading text-2xl font-bold tracking-tight text-white drop-shadow-md">{channel.displayName}</h1>
                    <div className="flex items-center gap-2 text-sm text-gray-300 font-medium">
                      <span>@{channel.handle}</span>
                      <span>•</span>
                      <span>{formatCompactNumber(channel.subscribers)} odběratelů</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 sm:hidden mt-2">
                   <h1 className="font-heading text-xl font-bold tracking-tight">{channel.displayName}</h1>
                   <div className="text-sm text-muted">@{channel.handle} • {formatCompactNumber(channel.subscribers)} odběratelů</div>
                </div>

                <div className="flex flex-col items-end gap-3 sm:mt-4">
                  {isOwner ? (
                    <Button variant="secondary" onClick={() => setIsEditing(true)}>
                      <Pencil size={16} />
                      Upravit kanál
                    </Button>
                  ) : (
                    <SubscribeButton 
                      channelId={channel.id} 
                      initialCount={channel.subscribers}
                      onToggle={(newCount) => setChannel(prev => prev ? ({ ...prev, subscribers: newCount }) : null)}
                    />
                  )}
                  {channel.socialLinks && channel.socialLinks.length > 0 && (
                      <div className="flex flex-wrap gap-2 justify-end">
                        {channel.socialLinks.map((link, i) => (
                          <a 
                            key={i} 
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-xs font-medium text-text/80 hover:text-brand bg-surface2/50 hover:bg-surface2 px-2.5 py-1.5 rounded-full transition-colors border border-white/5"
                          >
                            {link.platform}
                          </a>
                        ))}
                      </div>
                    )}
                </div>
              </div>
              
              <div className="mt-4 max-w-3xl text-sm text-muted/90 leading-relaxed">
                 {channel.bio}
              </div>
              
              <div className="mt-6 flex items-center gap-6 border-t border-white/5 pt-4 text-sm font-medium text-muted">
                <div className="flex items-center gap-2">
                    <span className="text-text">{channel.videoCount}</span> videí
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-text">{formatCompactNumber(channel.totalViews)}</span> zhlédnutí celkem
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {isEditing && channel ? (
        <ChannelEditor 
          initialData={channel} 
          onClose={() => setIsEditing(false)} 
          onUpdate={(updated) => {
            setChannel({ ...channel, ...updated })
          }}
        />
      ) : null}

      {error ? (
        <div className="rounded-xl border border-border/10 bg-surface p-4 text-sm text-muted">{error}</div>
      ) : null}

      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold">Videa</h2>
        {channel ? <div className="text-xs text-muted">{channel.videoCount} zveřejněno</div> : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <React.Fragment key={i}>
                <Skeleton className="h-[260px] w-full rounded-2xl" />
              </React.Fragment>
            ))
          : videos.map((v) => <VideoCard key={v.id} video={v as VideoListItem} />)}
      </div>
    </div>
  )
}

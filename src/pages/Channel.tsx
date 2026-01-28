import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { apiFetch } from '@/lib/api'
import { Skeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import { VideoCard, type VideoListItem } from '@/components/video/VideoCard'
import { formatCompactNumber } from '@/lib/format'
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
            <div className="h-[180px] w-full bg-surface2">
              <img src={channel.bannerUrl} alt="Channel banner" className="h-full w-full object-cover" />
            </div>
            <div className="p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <img src={channel.avatarUrl} alt={channel.displayName} className="h-16 w-16 rounded-full object-cover" />
                  <div>
                    <h1 className="font-heading text-xl font-bold tracking-tight">{channel.displayName}</h1>
                    <div className="mt-1 text-sm text-muted">
                      {channel.handle} • {formatCompactNumber(channel.subscribers)} odběratelů • {formatCompactNumber(channel.totalViews)} zhlédnutí
                    </div>
                    {channel.bio ? <div className="mt-2 max-w-2xl text-sm text-text">{channel.bio}</div> : null}
                    {channel.socialLinks && channel.socialLinks.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {channel.socialLinks.map((link, i) => (
                          <a 
                            key={i} 
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-xs font-medium text-brand hover:underline bg-brand/10 px-2 py-1 rounded-md"
                          >
                            {link.platform}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
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

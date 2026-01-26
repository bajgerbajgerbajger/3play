import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatCompactNumber, formatTimeAgo } from '@/lib/format'
import { type VideoListItem } from '@/components/video/VideoCard'
import { VideoRow } from '@/components/video/VideoRow'
import { useAuthStore } from '@/store/auth'
import { useModalStore } from '@/store/modal'
import { ThumbsDown, ThumbsUp, Share2, Bell, ChevronDown, RotateCw, ExternalLink } from 'lucide-react'

// Helper to get domain from URL
function getDomain(url: string) {
  try {
    const u = new URL(url.match(/src="([^"]+)"/)?.[1] || url)
    return u.hostname.replace('www.', '')
  } catch {
    return 'Externí zdroj'
  }
}

type VideoDetail = {
  id: string
  ownerId: string
  title: string
  description: string
  visibility: 'draft' | 'unlisted' | 'published'
  status: 'uploading' | 'processing' | 'ready' | 'failed'
  thumbnailUrl: string
  sourceUrl: string
  embedCode?: string
  durationSeconds: number
  views: number
  likes: number
  dislikes: number
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  channel: {
    id: string
    handle: string
    displayName: string
    avatarUrl: string
    bannerUrl: string
    bio: string
    subscribers: number
  } | null
  viewerRating?: 'like' | 'dislike' | 'none'
}

type CommentItem = {
  id: string
  videoId: string
  authorHandle: string
  authorName: string
  authorAvatarUrl: string
  message: string
  createdAt: string
  likes: number
}

export default function Watch() {
  const { videoId } = useParams()
  const { token, user } = useAuthStore()
  const { openChannelCreation } = useModalStore()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [video, setVideo] = useState<VideoDetail | null>(null)
  const [comments, setComments] = useState<CommentItem[]>([])
  const [upNext, setUpNext] = useState<VideoListItem[]>([])
  const [descOpen, setDescOpen] = useState(false)
  const [engaging, setEngaging] = useState<'like' | 'dislike' | null>(null)

  useEffect(() => {
    if (!videoId) return
    let alive = true
    setLoading(true)
    setError(null)
    Promise.all([
      apiFetch<{ success: true; video: VideoDetail }>(`/api/videos/${encodeURIComponent(videoId)}`),
      apiFetch<{ success: true; items: CommentItem[] }>(`/api/videos/${encodeURIComponent(videoId)}/comments`),
      apiFetch<{ success: true; items: VideoListItem[] }>(`/api/videos?sort=popular&limit=12`),
    ])
      .then(([v, c, u]) => {
        if (!alive) return
        setVideo(v.video)
        setComments(c.items)
        setUpNext(u.items.filter((x) => x.id !== videoId).slice(0, 10))
      })
      .catch((e: unknown) => {
        if (!alive) return
        setError(e instanceof Error ? e.message : 'Failed to load')
      })
      .finally(() => {
        if (!alive) return
        setLoading(false)
        // Intro loader removed
      })
    return () => {
      alive = false
    }
  }, [videoId])

  const channel = video?.channel
  const meta = useMemo(() => {
    if (!video) return ''
    const parts = [`${formatCompactNumber(video.views)} views`]
    if (video.publishedAt) parts.push(formatTimeAgo(video.publishedAt))
    return parts.join(' • ')
  }, [video])

  async function engage(action: 'like' | 'dislike') {
    if (!videoId || !video) return
    if (!token || !user) {
      setError('Sign in to engage with videos')
      return
    }
    
    // Require channel to engage
    if (!user.channelId) {
        openChannelCreation('like')
        return
    }

    try {
      setEngaging(action)
      const d = await apiFetch<{ success: true; likes: number; dislikes: number; viewerRating: 'like' | 'dislike' | 'none' }>(
        `/api/videos/${encodeURIComponent(videoId)}/engagement`,
        {
          method: 'POST',
          token,
          body: JSON.stringify({ action }),
        },
      )
      setVideo({ ...video, likes: d.likes, dislikes: d.dislikes, viewerRating: d.viewerRating })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setEngaging(null)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] animate-fadeUp">
      {video ? (
        <Helmet>
          <title>{video.title} - 3Play</title>
          <meta name="description" content={video.description || `Sledujte ${video.title} na 3Play.`} />
          <meta property="og:title" content={video.title} />
          <meta property="og:description" content={video.description || `Sledujte ${video.title} na 3Play.`} />
          <meta property="og:image" content={video.thumbnailUrl} />
          <meta property="og:type" content="video.other" />
        </Helmet>
      ) : null}
      <div className="space-y-4">
        <div className="overflow-hidden rounded-2xl border border-border/10 bg-black">
          {loading ? (
            <Skeleton className="aspect-video w-full rounded-none" />
          ) : video ? (
            video.embedCode || video.sourceUrl.trim().startsWith('<iframe') ? (
              <div className="group relative aspect-video w-full bg-black">
                <div
                  className="h-full w-full [&>iframe]:h-full [&>iframe]:w-full"
                  dangerouslySetInnerHTML={{ __html: video.embedCode || video.sourceUrl }}
                />
                {/* Embed Overlay/Badge */}
                <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm transition-opacity group-hover:opacity-0 pointer-events-none">
                  <ExternalLink size={12} className="text-brand" />
                  <span>Embed z: {getDomain(video.embedCode || video.sourceUrl)}</span>
                </div>
              </div>
            ) : (
              <video
                className="aspect-video w-full"
                controls
                playsInline
                preload="metadata"
                src={video.sourceUrl}
                poster={video.thumbnailUrl}
              />
            )
          ) : (
            <div className="aspect-video grid place-items-center text-sm text-muted">Nedostupné</div>
          )}
        </div>

        {error ? (
          <div className="rounded-xl border border-border/10 bg-surface p-4 text-sm text-muted">{error}</div>
        ) : null}

        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-4/5" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ) : video ? (
          <>
            <h1 className="font-heading text-xl font-bold tracking-tight">{video.title}</h1>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                {channel ? (
                  <Link to={`/channel/${encodeURIComponent(channel.handle)}`} className="flex items-center gap-3">
                    <img src={channel.avatarUrl} alt={channel.displayName} className="h-10 w-10 rounded-full object-cover" />
                    <div>
                      <div className="text-sm font-semibold">{channel.displayName}</div>
                      <div className="text-xs text-muted">{formatCompactNumber(channel.subscribers)} odběratelů</div>
                    </div>
                  </Link>
                ) : null}
                <Button variant="secondary" className="hidden md:inline-flex">
                  <Bell size={16} />
                  Odebírat
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant={video.viewerRating === 'like' ? 'primary' : 'secondary'}
                  loading={engaging === 'like'}
                  onClick={() => engage('like')}
                  className="min-w-[120px]"
                >
                  <ThumbsUp size={16} fill={video.viewerRating === 'like' ? 'currentColor' : 'none'} />
                  {formatCompactNumber(video.likes)}
                </Button>
                <Button
                  variant={video.viewerRating === 'dislike' ? 'primary' : 'secondary'}
                  loading={engaging === 'dislike'}
                  onClick={() => engage('dislike')}
                  className="min-w-[120px]"
                >
                  <ThumbsDown size={16} fill={video.viewerRating === 'dislike' ? 'currentColor' : 'none'} />
                  {formatCompactNumber(video.dislikes)}
                </Button>
                <Button variant="secondary" onClick={() => navigator.clipboard.writeText(window.location.href)}>
                  <Share2 size={16} />
                  Sdílet
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-border/10 bg-surface p-4">
              <div className="text-xs text-muted">{meta}</div>
              <div className={descOpen ? 'mt-2 text-sm text-text whitespace-pre-wrap' : 'mt-2 text-sm text-text whitespace-pre-wrap clamp-4'}>
                {video.description}
              </div>
              <button
                onClick={() => setDescOpen((v) => !v)}
                className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-text"
              >
                {descOpen ? 'Zobrazit méně' : 'Zobrazit více'}
                <ChevronDown size={14} className={descOpen ? 'rotate-180 transition' : 'transition'} />
              </button>
            </div>

            <div className="space-y-3">
              <h3 className="font-heading text-sm font-semibold">Komentáře</h3>
              <div className="space-y-3">
                {comments.map((c) => (
                  <div key={c.id} className="flex gap-3 rounded-2xl border border-border/10 bg-surface p-4">
                    <img src={c.authorAvatarUrl} alt={c.authorName} className="h-9 w-9 rounded-full object-cover" />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-sm font-semibold">{c.authorName}</div>
                        <div className="text-xs text-muted">{c.authorHandle}</div>
                        <div className="text-xs text-muted">• {formatTimeAgo(c.createdAt)}</div>
                      </div>
                      <div className="mt-2 text-sm text-text">{c.message}</div>
                      <div className="mt-2 text-xs text-muted">{formatCompactNumber(c.likes)} likes</div>
                    </div>
                  </div>
                ))}
                {comments.length === 0 ? <div className="text-sm text-muted">Zatím žádné komentáře.</div> : null}
              </div>
            </div>
          </>
        ) : null}
      </div>

      <aside className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-sm font-semibold">Další videa</h3>
          <IconButton aria-label="Refresh" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <RotateCw size={18} />
          </IconButton>
        </div>
        <div className="space-y-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[100px] w-full rounded-2xl" />)
            : upNext.map((v) => <VideoRow key={v.id} video={v} />)}
        </div>
      </aside>
    </div>
  )
}

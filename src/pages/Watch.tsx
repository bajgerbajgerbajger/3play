import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatCompactNumber, formatTimeAgo } from '@/lib/format'
import { type VideoListItem } from '@/components/video/VideoCard'
import { VideoRow } from '@/components/video/VideoRow'
import { SafeEmbed } from '@/components/video/SafeEmbed'
import { useAuthStore } from '@/store/auth'
import { useModalStore } from '@/store/modal'
import { ThumbsDown, ThumbsUp, Share2, Bell, ChevronDown, RotateCw, ExternalLink } from 'lucide-react'

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
    (!u.match(/\.(mp4|webm|ogg|mov)$/i) && u.startsWith('http')) // If it doesn't end in a video extension, treat as potential embed
  )
}

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
    userId: string
  } | null
  viewerRating?: 'like' | 'dislike' | 'none'
}

type CommentItem = {
  id: string
  videoId: string
  parentId?: string | null
  authorHandle: string
  authorName: string
  authorAvatarUrl: string
  message: string
  createdAt: string
  likes: number
  pinned: boolean
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
  const [commentText, setCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [subscribing, setSubscribing] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')

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
        
        // Check subscription status if user is logged in
        if (token && v.video.channel) {
            apiFetch<{ subscribed: boolean }>(`/api/subscriptions/status/${v.video.channel.id}`, { token })
                .then(res => {
                    if (alive) setSubscribed(res.subscribed)
                })
                .catch(() => {})
        }
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

  async function handleSubscribe() {
    if (!video?.channel) return
    if (!token || !user) {
        setError('Pro odběr se musíte přihlásit')
        return
    }
    // Prevent subscribing to own channel
    if (user.channelId === video.channel.id) {
        setError('Nemůžete odebírat svůj vlastní kanál')
        return
    }

    try {
        setSubscribing(true)
        const res = await apiFetch<{ subscribed: boolean; count: number }>('/api/subscriptions/toggle', {
            method: 'POST',
            token,
            body: JSON.stringify({ channelId: video.channel.id }),
        })
        setSubscribed(res.subscribed)
        if (video.channel) {
            setVideo({
                ...video,
                channel: {
                    ...video.channel,
                    subscribers: res.count
                }
            })
        }
    } catch (err) {
        setError('Nepodařilo se změnit stav odběru')
    } finally {
        setSubscribing(false)
    }
  }

  async function handlePin(commentId: string) {
    if (!token || !videoId) return
    try {
      const res = await apiFetch<{ success: true; pinned: boolean }>(`/api/videos/${encodeURIComponent(videoId)}/comments/${commentId}/pin`, {
        method: 'POST',
        token
      })
      setComments(comments.map(c => c.id === commentId ? { ...c, pinned: res.pinned } : c))
    } catch (e) {
      console.error(e)
    }
  }

  async function postComment(e: React.FormEvent, parentId?: string) {
    e.preventDefault()
    const text = parentId ? replyText : commentText
    if (!videoId || !token || !text.trim()) return

    try {
      setSubmittingComment(true)
      const res = await apiFetch<{ success: true; item: CommentItem }>(`/api/videos/${encodeURIComponent(videoId)}/comments`, {
        method: 'POST',
        token,
        body: JSON.stringify({ message: text, parentId }),
      })
      // If it's a reply, find parent and insert after? Or just append and let logic handle it?
      // Simple append works if we filter by parentId in render.
      setComments((prev) => [res.item, ...prev])
      
      if (parentId) {
        setReplyText('')
        setReplyingTo(null)
      } else {
        setCommentText('')
      }
    } catch (err) {
      setError('Nepodařilo se odeslat komentář')
    } finally {
      setSubmittingComment(false)
    }
  }

  const isOwner = user?.id && video?.channel?.userId && user.id === video.channel.userId

  const renderComment = (c: CommentItem, isReply = false) => {
    const replies = comments.filter(r => r.parentId === c.id).sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    
    return (
      <div key={c.id} className={`flex gap-3 rounded-2xl border border-border/10 bg-surface p-4 ${c.pinned ? 'border-l-4 border-l-primary' : ''}`}>
        <img src={c.authorAvatarUrl} alt={c.authorName} className="h-9 w-9 rounded-full object-cover" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-sm font-semibold">{c.authorName}</div>
            {c.pinned && <div className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">Připnuto</div>}
            <div className="text-xs text-muted">{c.authorHandle}</div>
            <div className="text-xs text-muted">• {formatTimeAgo(c.createdAt)}</div>
          </div>
          <div className="mt-2 text-sm text-text">{c.message}</div>
          <div className="mt-2 flex items-center gap-4">
            <div className="text-xs text-muted">{formatCompactNumber(c.likes)} likes</div>
            {user && (
                <button onClick={() => setReplyingTo(replyingTo === c.id ? null : c.id)} className="text-xs font-semibold text-muted hover:text-text transition-colors">
                    Odpovědět
                </button>
            )}
            {isOwner && !isReply && (
                <button onClick={() => handlePin(c.id)} className="text-xs font-semibold text-muted hover:text-text transition-colors">
                    {c.pinned ? 'Odepnout' : 'Připnout'}
                </button>
            )}
          </div>

          {replyingTo === c.id && (
            <form onSubmit={(e) => postComment(e, c.id)} className="mt-3 flex gap-2">
              <input 
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Vaše odpověď..."
                className="flex-1 rounded-lg border border-border/10 bg-surface2 px-3 py-2 text-sm text-text focus:outline-none focus:border-primary"
                autoFocus
              />
              <Button variant="primary" size="sm" type="submit" disabled={!replyText.trim() || submittingComment}>
                Odeslat
              </Button>
            </form>
          )}

          {replies.length > 0 && (
            <div className="mt-3 space-y-3 pl-4 border-l-2 border-border/10">
              {replies.map(r => renderComment(r, true))}
            </div>
          )}
        </div>
      </div>
    )
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
            video.embedCode || video.sourceUrl.trim().startsWith('<') || isEmbedUrl(video.sourceUrl) ? (
              <div className="group relative aspect-video w-full bg-black shadow-2xl">
                <SafeEmbed code={video.embedCode || video.sourceUrl} className="w-full h-full" />
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
                <Button 
                    variant={subscribed ? 'secondary' : 'primary'} 
                    className="hidden md:inline-flex"
                    onClick={handleSubscribe}
                    loading={subscribing}
                >
                  <Bell size={16} className={subscribed ? "fill-current" : ""} />
                  {subscribed ? 'Odebíráno' : 'Odebírat'}
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
              <h3 className="font-heading text-sm font-semibold">Komentáře ({comments.length})</h3>
              
              {user ? (
                <form onSubmit={postComment} className="flex gap-3 mb-6">
                   <img 
                     src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.handle}`} 
                     alt="Já" 
                     className="h-9 w-9 rounded-full object-cover" 
                   />
                   <div className="flex-1 space-y-2">
                     <textarea
                       value={commentText}
                       onChange={(e) => setCommentText(e.target.value)}
                       placeholder="Přidejte komentář..."
                       className="w-full rounded-xl border border-border/10 bg-surface px-3 py-2 text-sm text-text placeholder:text-muted focus:border-primary focus:outline-none min-h-[80px] resize-y"
                     />
                     <div className="flex justify-end">
                       <Button 
                         variant="primary" 
                         type="submit" 
                         disabled={!commentText.trim() || submittingComment}
                         loading={submittingComment}
                       >
                         Komentovat
                       </Button>
                     </div>
                   </div>
                </form>
              ) : (
                <div className="rounded-xl border border-border/10 bg-surface p-4 text-center text-sm text-muted mb-6">
                  Pro přidání komentáře se <Link to="/login" className="text-primary hover:underline">přihlaste</Link>.
                </div>
              )}

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
            ? Array.from({ length: 6 }).map((_, i) => (
                <React.Fragment key={i}>
                  <Skeleton className="h-[100px] w-full rounded-2xl" />
                </React.Fragment>
              ))
            : upNext.map((v) => <VideoRow key={v.id} video={v as VideoListItem} />)}
        </div>
      </aside>
    </div>
  )
}

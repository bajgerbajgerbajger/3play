import React from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { formatCompactNumber, formatDuration, formatTimeAgo } from '@/lib/format'

export type VideoListItem = {
  id: string
  title: string
  thumbnailUrl: string
  durationSeconds: number
  views: number
  publishedAt: string | null
  embedCode?: string
  sourceUrl?: string
  channel: {
    id: string
    handle: string
    displayName: string
    avatarUrl: string
  } | null
}

export const VideoCard: React.FC<{ video: VideoListItem; className?: string }> = ({ video, className }) => {
  return (
    <div
      className={cn(
        'group rounded-xl border border-border/10 bg-surface overflow-hidden transition',
        'hover:bg-surface2 hover:-translate-y-[2px] hover:shadow-soft',
        className,
      )}
    >
      <Link
        to={`/watch/${video.id}`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
      >
        <div className="relative aspect-video w-full overflow-hidden bg-surface2">
          <img
            src={video.thumbnailUrl || '/placeholder.jpg'}
            alt={video.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              if (video.embedCode) {
                 // For embeds, we might not have a thumbnail yet, so we show a better placeholder
                 target.src = 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop'
              } else {
                 target.src = '/placeholder.jpg'
              }
            }}
          />
          <div className="absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-1 text-[11px] font-semibold text-white">
            {formatDuration(video.durationSeconds)}
          </div>
          {(video.sourceUrl?.includes('1080p') || video.sourceUrl?.includes('720p') || video.durationSeconds > 0 || video.embedCode) && (
            <div className="absolute top-2 right-2 rounded bg-brand/90 px-1.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider shadow-sm">
              HD
            </div>
          )}
        </div>
      </Link>
      <div className="p-3">
        <div className="flex gap-3">
          {video.channel ? (
            <img src={video.channel.avatarUrl} alt={video.channel.displayName} className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <div className="h-9 w-9 rounded-full bg-white/5" />
          )}
          <div className="min-w-0">
            <Link
              to={`/watch/${video.id}`}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="clamp-2 text-sm font-semibold leading-snug text-text hover:underline"
            >
              {video.title}
            </Link>
            {video.channel ? (
              <Link to={`/channel/${encodeURIComponent(video.channel.handle)}`} className="mt-1 block text-xs text-muted hover:text-text">
                {video.channel.displayName}
              </Link>
            ) : null}
            <div className="mt-1 text-xs text-muted">
              {formatCompactNumber(video.views)} views{video.publishedAt ? ` • ${formatTimeAgo(video.publishedAt)}` : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

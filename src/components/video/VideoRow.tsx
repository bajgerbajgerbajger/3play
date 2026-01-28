import React from 'react'
import { Link } from 'react-router-dom'
import { formatCompactNumber, formatDuration, formatTimeAgo } from '@/lib/format'
import type { VideoListItem } from './VideoCard'

export function VideoRow({ video }: { video: VideoListItem }) {
  return (
    <Link
      to={`/watch/${video.id}`}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="group flex gap-3 rounded-2xl border border-border/10 bg-surface p-3 transition hover:bg-surface2 hover:-translate-y-[1px]"
    >
      <div className="relative h-[74px] w-[132px] shrink-0 overflow-hidden rounded-xl bg-surface2">
        <img src={video.thumbnailUrl} alt={video.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]" />
        <div className="absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-1 text-[11px] font-semibold text-white">
          {formatDuration(video.durationSeconds)}
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="clamp-2 text-sm font-semibold leading-snug">{video.title}</div>
        {video.channel ? <div className="mt-1 text-xs text-muted">{video.channel.displayName}</div> : null}
        <div className="mt-1 text-xs text-muted">
          {formatCompactNumber(video.views)} views{video.publishedAt ? ` • ${formatTimeAgo(video.publishedAt)}` : ''}
        </div>
      </div>
    </Link>
  )
}


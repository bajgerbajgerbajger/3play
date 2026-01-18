import { cn } from '@/lib/utils'
import { formatCompactNumber, formatTimeAgo } from '@/lib/format'
import { Pencil } from 'lucide-react'
import type { StudioVideo } from './types'
import { Skeleton } from '@/components/ui/Skeleton'

export function VideosPanel({
  loading,
  items,
  selectedId,
  onSelect,
}: {
  loading: boolean
  items: StudioVideo[]
  selectedId: string | null
  onSelect: (v: StudioVideo) => void
}) {
  return (
    <div className="rounded-2xl border border-border/10 bg-surface">
      <div className="border-b border-border/10 p-4">
        <h3 className="font-heading text-sm font-semibold">Your videos</h3>
        <div className="text-xs text-muted">Statuses update automatically.</div>
      </div>
      <div className="divide-y divide-border/10">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-4">
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            ))
          : items.map((v) => (
              <button
                key={v.id}
                onClick={() => onSelect(v)}
                className={cn('w-full p-4 text-left transition hover:bg-white/5', selectedId === v.id ? 'bg-white/5' : 'bg-transparent')}
              >
                <div className="flex items-center gap-4">
                  <img src={v.thumbnailUrl} alt={v.title} className="h-16 w-28 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{v.title}</div>
                    <div className="mt-1 text-xs text-muted">
                      {v.visibility.toUpperCase()} • {v.status.toUpperCase()} • Updated {formatTimeAgo(v.updatedAt)}
                    </div>
                  </div>
                  <div className="hidden sm:block text-xs text-muted">{formatCompactNumber(v.views)} views</div>
                  <div
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(`/watch/${encodeURIComponent(v.id)}`, '_blank')
                    }}
                    className="grid h-9 w-9 place-items-center rounded-xl border border-border/10 bg-surface2 hover:bg-white/10 hover:text-white cursor-pointer transition"
                    title="Watch video"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-play"
                    >
                      <polygon points="6 3 20 12 6 21 6 3" />
                    </svg>
                  </div>
                  <div className="grid h-9 w-9 place-items-center rounded-xl border border-border/10 bg-surface2">
                    <Pencil size={16} />
                  </div>
                </div>
              </button>
            ))}
      </div>
    </div>
  )
}


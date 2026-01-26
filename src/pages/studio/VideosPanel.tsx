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
  const handleVisibilityChange = async (video: StudioVideo, visibility: StudioVideo['visibility']) => {
    try {
      const { useAuthStore } = await import('@/store/auth')
      const { apiFetch } = await import('@/lib/api')
      const token = useAuthStore.getState().token
      if (!token) return
      
      await apiFetch(`/api/studio/videos/${encodeURIComponent(video.id)}`, {
        method: 'PATCH',
        token,
        body: JSON.stringify({ visibility }),
      })
      // Local update is handled by the 3s polling in Studio.tsx
    } catch (err) {
      console.error('Failed to change visibility', err)
    }
  }

  return (
    <div className="rounded-2xl border border-border/10 bg-surface">
      <div className="border-b border-border/10 p-4">
        <h3 className="font-heading text-sm font-semibold">Vaše videa</h3>
        <div className="text-xs text-muted">Stavy se aktualizují automaticky.</div>
      </div>
      <div className="divide-y divide-border/10">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-4">
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            ))
          : items.map((v) => (
              <div
                key={v.id}
                className={cn('group relative w-full p-4 transition hover:bg-white/5', selectedId === v.id ? 'bg-white/5' : 'bg-transparent')}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="relative flex-shrink-0 cursor-pointer" onClick={() => onSelect(v)}>
                    <img src={v.thumbnailUrl} alt={v.title} className="h-20 w-36 rounded-xl object-cover bg-surface2 shadow-md" />
                    <div className="absolute bottom-1 right-1 rounded bg-black/70 px-1 py-0.5 text-[10px] text-white">
                      {formatTimeAgo(v.updatedAt)}
                    </div>
                  </div>
                  
                  <div className="min-w-0 flex-1 cursor-pointer" onClick={() => onSelect(v)}>
                    <div className="truncate text-sm font-semibold">{v.title}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                       <select 
                         value={v.visibility}
                         onChange={(e) => {
                           e.stopPropagation()
                           handleVisibilityChange(v, e.target.value as StudioVideo['visibility'])
                         }}
                         className="text-[10px] font-bold uppercase tracking-wider bg-surface2 border border-border/10 rounded px-1 py-0.5 cursor-pointer outline-none focus:border-brand/50"
                       >
                         <option value="draft">DRAFT</option>
                         <option value="unlisted">UNLISTED</option>
                         <option value="published">PUBLISHED</option>
                       </select>
                       <span className={cn(
                         "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shadow-sm",
                         v.status === 'ready' ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400 animate-pulse"
                       )}>
                         {v.status}
                       </span>
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-[11px] text-muted">
                      <span>{formatCompactNumber(v.views)} zhlédnutí</span>
                      <span>•</span>
                      <span>{v.likes} To se mi líbí</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(`/watch/${encodeURIComponent(v.id)}`, '_blank')
                      }}
                      className="grid h-9 w-9 place-items-center rounded-xl border border-border/10 bg-surface2 hover:bg-white/10 hover:text-white transition shadow-sm"
                      title="Sledovat video"
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
                      >
                        <polygon points="6 3 20 12 6 21 6 3" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => onSelect(v)}
                      className="grid h-9 w-9 place-items-center rounded-xl border border-border/10 bg-surface2 hover:bg-white/10 hover:text-white transition shadow-sm"
                    >
                      <Pencil size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
      </div>
    </div>
  )
}


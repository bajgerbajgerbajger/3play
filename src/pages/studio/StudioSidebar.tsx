import { cn } from '@/lib/utils'
import type { Tab } from './types'
import { FileVideo, Settings, Sparkles, Upload } from 'lucide-react'

export function StudioSidebar({
  tab,
  readyCount,
  onTab,
}: {
  tab: Tab
  readyCount: number
  onTab: (next: Tab) => void
}) {
  return (
    <aside className="rounded-2xl border border-border/10 bg-surface p-4">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/5">
          <Sparkles size={18} className="text-brand" />
        </div>
        <div>
          <div className="text-sm font-semibold">Studio</div>
          <div className="text-xs text-muted">{readyCount} ready</div>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        <button
          onClick={() => onTab('upload')}
          className={cn(
            'w-full rounded-xl border border-border/10 px-4 py-4 text-left text-base font-semibold transition shadow-md',
            tab === 'upload' ? 'bg-brand/10 text-brand border-brand/20 shadow-lg' : 'bg-surface text-muted hover:bg-surface2 hover:text-text hover:shadow-lg',
          )}
        >
          <div className="flex items-center gap-3">
            <Upload size={20} />
            Nahrát
          </div>
        </button>
        <button
          onClick={() => onTab('videos')}
          className={cn(
            'w-full rounded-xl border border-border/10 px-4 py-4 text-left text-base font-semibold transition shadow-md',
            tab === 'videos' ? 'bg-brand/10 text-brand border-brand/20 shadow-lg' : 'bg-surface text-muted hover:bg-surface2 hover:text-text hover:shadow-lg',
          )}
        >
          <div className="flex items-center gap-3">
            <FileVideo size={20} />
            Videa
          </div>
        </button>
        <button
          onClick={() => onTab('settings')}
          className={cn(
            'w-full rounded-xl border border-border/10 px-4 py-4 text-left text-base font-semibold transition shadow-md',
            tab === 'settings' ? 'bg-brand/10 text-brand border-brand/20 shadow-lg' : 'bg-surface text-muted hover:bg-surface2 hover:text-text hover:shadow-lg',
          )}
        >
          <div className="flex items-center gap-3">
            <Settings size={20} />
            Nastavení
          </div>
        </button>
      </div>
    </aside>
  )
}


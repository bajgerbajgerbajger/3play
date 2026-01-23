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
      <div className="mt-4 space-y-2">
        <button
          onClick={() => onTab('upload')}
          className={cn(
            'w-full rounded-xl border border-border/10 px-3 py-2 text-left text-sm font-semibold transition',
            tab === 'upload' ? 'bg-white/5 text-text' : 'bg-surface text-muted hover:bg-surface2 hover:text-text',
          )}
        >
          <div className="flex items-center gap-2">
            <Upload size={16} />
            Upload
          </div>
        </button>
        <button
          onClick={() => onTab('videos')}
          className={cn(
            'w-full rounded-xl border border-border/10 px-3 py-2 text-left text-sm font-semibold transition',
            tab === 'videos' ? 'bg-white/5 text-text' : 'bg-surface text-muted hover:bg-surface2 hover:text-text',
          )}
        >
          <div className="flex items-center gap-2">
            <FileVideo size={16} />
            Videos
          </div>
        </button>
        <button
          onClick={() => onTab('settings')}
          className={cn(
            'w-full rounded-xl border border-border/10 px-3 py-2 text-left text-sm font-semibold transition',
            tab === 'settings' ? 'bg-white/5 text-text' : 'bg-surface text-muted hover:bg-surface2 hover:text-text',
          )}
        >
          <div className="flex items-center gap-2">
            <Settings size={16} />
            Settings
          </div>
        </button>
      </div>
    </aside>
  )
}


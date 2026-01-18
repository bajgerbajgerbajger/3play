import { useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CloudUpload, Loader2, Upload, FileVideo } from 'lucide-react'
import { sampleSources } from './types'

export function UploadPanel({
  title,
  description,
  sourceUrl,
  file,
  creating,
  progress,
  onTitle,
  onDescription,
  onSourceUrl,
  onFileSelect,
  onCreate,
}: {
  title: string
  description: string
  sourceUrl: string
  file?: File | null
  creating: boolean
  progress: number
  onTitle: (v: string) => void
  onDescription: (v: string) => void
  onSourceUrl: (v: string) => void
  onFileSelect: (v: File | null) => void
  onCreate: () => void
}) {
  const progressText = useMemo(() => `${Math.round(progress)}%`, [progress])
  return (
    <div className="rounded-2xl border border-border/10 bg-surface p-5">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand/10">
          <CloudUpload size={18} className="text-brand" />
        </div>
        <div>
          <h3 className="font-heading text-sm font-semibold">Upload a new video</h3>
          <div className="text-xs text-muted">Upload file from device or use a remote URL.</div>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        <div>
          <div className="mb-1 text-xs font-semibold text-muted">Title</div>
          <Input value={title} onChange={(e) => onTitle(e.target.value)} placeholder="Enter a clean, readable title" />
        </div>
        <div>
          <div className="mb-1 text-xs font-semibold text-muted">Description</div>
          <textarea
            value={description}
            onChange={(e) => onDescription(e.target.value)}
            placeholder="Keep it creator-first: what’s in the video?"
            className="min-h-[110px] w-full rounded-[12px] border border-border/10 bg-surface px-3 py-2 text-sm text-text placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          />
        </div>
        
        <div className="grid gap-3 sm:grid-cols-2">
            <div>
                <div className="mb-1 text-xs font-semibold text-muted">Video File</div>
                <div className="relative">
                    <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => onFileSelect(e.target.files?.[0] || null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex items-center gap-2 h-10 w-full rounded-[10px] border border-border/10 bg-surface px-3 text-sm text-text">
                         <FileVideo size={16} className="text-muted" />
                         <span className="truncate">{file ? file.name : "Choose file..."}</span>
                    </div>
                </div>
            </div>
            
            <div>
              <div className="mb-1 text-xs font-semibold text-muted">Or Source URL</div>
              <Input
                value={sourceUrl}
                disabled={!!file}
                onChange={(e) => onSourceUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
        </div>
        
        {file ? <div className="text-xs text-brand">File selected. URL input disabled.</div> : <div className="text-xs text-muted">Supports direct URLs or iframe embed codes.</div>}

        {progress > 0 ? (
          <div className="rounded-xl border border-border/10 bg-surface2 p-3">
            <div className="flex items-center justify-between text-xs">
              <div className="text-muted">Uploading</div>
              <div className="text-text font-semibold">{progressText}</div>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/5">
              <div className="h-2 rounded-full bg-brand transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Button onClick={onCreate} loading={creating} className="sm:min-w-[160px]">
            {creating ? <Loader2 size={16} /> : <Upload size={16} />}
            Start upload
          </Button>
          <div className="text-xs text-muted">Processing auto-completes in a few seconds.</div>
        </div>
      </div>
    </div>
  )
}

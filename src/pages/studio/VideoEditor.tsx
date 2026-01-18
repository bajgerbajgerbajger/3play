import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { StudioVideo } from './types'
import { CheckCircle2, Loader2, X } from 'lucide-react'

export function VideoEditor({
  video,
  onClose,
  onChange,
  onSave,
  onPublish,
  onThumbnailUpload,
}: {
  video: StudioVideo
  onClose: () => void
  onChange: (next: StudioVideo) => void
  onSave: () => void
  onPublish: () => void
  onThumbnailUpload: (file: File) => Promise<string>
}) {
  const [uploadingThumb, setUploadingThumb] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setUploadingThumb(true)
    try {
      const url = await onThumbnailUpload(file)
      onChange({ ...video, thumbnailUrl: url })
    } catch (err) {
      console.error(err)
    } finally {
      setUploadingThumb(false)
    }
  }

  return (
    <div className="rounded-2xl border border-border/10 bg-surface p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-heading text-sm font-semibold">Edit video</h3>
          <div className="text-xs text-muted">{video.id}</div>
        </div>
        <button
          aria-label="Close"
          onClick={onClose}
          className="grid h-9 w-9 place-items-center rounded-xl border border-border/10 bg-surface2 hover:bg-white/5"
        >
          <X size={16} />
        </button>
      </div>

      <div className="mt-4 grid gap-3">
        <div>
          <div className="mb-1 text-xs font-semibold text-muted">Thumbnail</div>
          <div className="flex gap-4 items-start">
            <img src={video.thumbnailUrl} alt="Thumbnail" className="h-20 w-36 rounded-lg object-cover bg-surface2" />
            <div className="flex-1">
              <Input
                value={video.thumbnailUrl}
                onChange={(e) => onChange({ ...video, thumbnailUrl: e.target.value })}
                placeholder="https://..."
              />
              <div className="mt-1 text-xs text-muted">Enter a direct URL to an image.</div>
              <div className="mt-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="thumb-upload"
                  disabled={uploadingThumb}
                />
                <label
                  htmlFor="thumb-upload"
                  className={`inline-flex h-8 items-center justify-center rounded-lg border border-border/10 bg-surface2 px-3 text-xs font-medium transition-colors hover:bg-white/5 cursor-pointer ${uploadingThumb ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  {uploadingThumb ? 'Uploading...' : 'Upload Image'}
                </label>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="mb-1 text-xs font-semibold text-muted">Title</div>
          <Input value={video.title} onChange={(e) => onChange({ ...video, title: e.target.value })} />
        </div>
        <div>
          <div className="mb-1 text-xs font-semibold text-muted">Description</div>
          <textarea
            value={video.description}
            onChange={(e) => onChange({ ...video, description: e.target.value })}
            className="min-h-[110px] w-full rounded-[12px] border border-border/10 bg-surface px-3 py-2 text-sm text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <div className="mb-1 text-xs font-semibold text-muted">Visibility</div>
            <select
              value={video.visibility}
              onChange={(e) => onChange({ ...video, visibility: e.target.value as StudioVideo['visibility'] })}
              className="h-11 w-full rounded-[10px] border border-border/10 bg-surface px-3 text-sm text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              <option value="draft">Draft</option>
              <option value="unlisted">Unlisted</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div>
            <div className="mb-1 text-xs font-semibold text-muted">Status</div>
            <div className="h-11 w-full rounded-[10px] border border-border/10 bg-surface2 px-3 text-sm flex items-center gap-2 pointer-events-none">
              {video.status === 'ready' ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Loader2 size={16} className="animate-spin text-muted" />}
              <span className="font-semibold">{video.status.toUpperCase()}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={onSave}>
              Save changes
            </Button>
            <Button onClick={onPublish} disabled={video.status !== 'ready' || video.visibility === 'published'}>
              Publish
            </Button>
          </div>
          <div className="text-xs text-muted">Published videos appear on Home + Channel pages.</div>
        </div>
      </div>
    </div>
  )
}


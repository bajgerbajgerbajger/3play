import { useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CloudUpload, Loader2, Upload, FileVideo, Image as ImageIcon, Code, Link } from 'lucide-react'

export function UploadPanel({
  title,
  description,
  type,
  sourceUrl,
  file,
  creating,
  progress,
  onTitle,
  onDescription,
  onType,
  onSourceUrl,
  onFileSelect,
  onCreate,
  
  uploadMode,
  onUploadMode,
  embedCode,
  onEmbedCode,
  thumbnailFile,
  onThumbnailSelect,
}: {
  title: string
  description: string
  type: 'video' | 'movie' | 'episode'
  sourceUrl: string
  file?: File | null
  creating: boolean
  progress: number
  onTitle: (v: string) => void
  onDescription: (v: string) => void
  onType: (v: 'video' | 'movie' | 'episode') => void
  onSourceUrl: (v: string) => void
  onFileSelect: (v: File | null) => void
  onCreate: () => void
  
  uploadMode: 'file' | 'embed'
  onUploadMode: (v: 'file' | 'embed') => void
  embedCode: string
  onEmbedCode: (v: string) => void
  thumbnailFile?: File | null
  onThumbnailSelect: (v: File | null) => void
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
          <div className="text-xs text-muted">Upload file from device or use an embed code.</div>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        <div>
          <div className="mb-1 text-xs font-semibold text-muted">Title</div>
          <Input value={title} onChange={(e) => onTitle(e.target.value)} placeholder="Enter a clean, readable title" />
        </div>
        
        <div>
          <div className="mb-1 text-xs font-semibold text-muted">Content Type</div>
          <div className="flex gap-2">
            {(['video', 'movie', 'episode'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  type === t
                    ? 'bg-brand/10 border-brand text-brand'
                    : 'bg-surface border-border/10 text-muted hover:border-border/30 hover:text-text'
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
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
        
        {/* Upload Mode Switcher */}
        <div>
            <div className="mb-1 text-xs font-semibold text-muted">Source</div>
            <div className="flex gap-2 mb-3">
                <button
                    type="button"
                    onClick={() => onUploadMode('file')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                        uploadMode === 'file'
                            ? 'bg-brand/10 border-brand text-brand'
                            : 'bg-surface border-border/10 text-muted hover:border-border/30 hover:text-text'
                    }`}
                >
                    <FileVideo size={14} />
                    File Upload
                </button>
                <button
                    type="button"
                    onClick={() => onUploadMode('embed')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                        uploadMode === 'embed'
                            ? 'bg-brand/10 border-brand text-brand'
                            : 'bg-surface border-border/10 text-muted hover:border-border/30 hover:text-text'
                    }`}
                >
                    <Code size={14} />
                    Embed Code
                </button>
            </div>
            
            {uploadMode === 'file' ? (
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
                            <div className="flex items-center gap-2 h-10 w-full rounded-[10px] border border-border/10 bg-surface px-3 text-sm text-text overflow-hidden">
                                <FileVideo size={16} className="text-muted flex-shrink-0" />
                                <span className="truncate">{file ? file.name : "Choose video file..."}</span>
                            </div>
                        </div>
                    </div>
                    <div>
                         <div className="mb-1 text-xs font-semibold text-muted">Source URL (Optional)</div>
                         <div className="relative">
                             <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                                 <Link size={14} />
                             </div>
                             <Input 
                                 value={sourceUrl} 
                                 onChange={(e) => onSourceUrl(e.target.value)} 
                                 placeholder="Or paste direct URL" 
                                 className="pl-9"
                             />
                         </div>
                    </div>
                </div>
            ) : (
                <div>
                     <div className="mb-1 text-xs font-semibold text-muted">Embed Code</div>
                     <textarea
                        value={embedCode}
                        onChange={(e) => onEmbedCode(e.target.value)}
                        placeholder={'<iframe src="..." ...></iframe>'}
                        className="min-h-[80px] w-full rounded-[12px] border border-border/10 bg-surface px-3 py-2 text-sm text-text placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg font-mono text-xs"
                      />
                </div>
            )}
        </div>
        
        {/* Thumbnail Upload - Always available */}
        <div>
            <div className="mb-1 text-xs font-semibold text-muted">Custom Thumbnail (Optional)</div>
            <div className="relative">
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onThumbnailSelect(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex items-center gap-2 h-10 w-full rounded-[10px] border border-border/10 bg-surface px-3 text-sm text-text overflow-hidden">
                    <ImageIcon size={16} className="text-muted flex-shrink-0" />
                    <span className="truncate">{thumbnailFile ? thumbnailFile.name : "Choose custom thumbnail image..."}</span>
                </div>
            </div>
            <div className="mt-1 text-[10px] text-muted">
                If not provided, a thumbnail will be auto-generated from the video (for file uploads).
            </div>
        </div>

        <div className="mt-2 flex justify-end">
          <Button onClick={onCreate} disabled={creating || (!title) || (uploadMode === 'file' && !file && !sourceUrl) || (uploadMode === 'embed' && !embedCode)}>
             {creating ? (
                 <>
                   <Loader2 size={16} className="animate-spin mr-2" />
                   Uploading {progressText}
                 </>
             ) : (
                 <>
                   <Upload size={16} className="mr-2" />
                   Publish Video
                 </>
             )}
          </Button>
        </div>
      </div>
    </div>
  )
}

import { useMemo } from 'react'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CloudUpload, Loader2, Upload, FileVideo, Image as ImageIcon, Code, Link, Sparkles } from 'lucide-react'
import { SafeEmbed } from '@/components/video/SafeEmbed'

export function UploadPanel({
  title,
  description,
  type,
  sourceUrl,
  file,
  creating,
  progress,
  uploadSpeed,
  timeRemaining,
  onTitle,
  onDescription,
  onType,
  onSourceUrl,
  onFilesSelect,
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
  uploadSpeed?: string
  timeRemaining?: string
  onTitle: (v: string) => void
  onDescription: (v: string) => void
  onType: (v: 'video' | 'movie' | 'episode') => void
  onSourceUrl: (v: string) => void
  onFilesSelect: (v: FileList | null) => void
  onCreate: () => void
  
  uploadMode: 'file' | 'embed'
  onUploadMode: (v: 'file' | 'embed') => void
  embedCode: string
  onEmbedCode: (v: string) => void
  thumbnailFile?: File | null
  onThumbnailSelect: (v: File | null) => void
}) {
  const { user } = useAuthStore()
  
  const canUpload = useMemo(() => {
    if (!user) return false
    if (user.role === 'admin') return true
    // Allow if status is active or trial
    if (user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trial') {
        // Double check trial expiration if strictly needed, but status should be source of truth
        if (user.subscriptionStatus === 'trial' && user.trialEndsAt && new Date(user.trialEndsAt) < new Date()) {
            return false // Trial expired
        }
        return true
    }
    return false
  }, [user])

  const progressText = useMemo(() => `${Math.round(progress)}%`, [progress])
  const previewCode = useMemo(() => {
    const raw = (embedCode || '').trim()
    if (!raw) return null
    return raw
  }, [embedCode])

  if (!canUpload) {
    return (
        <div className="rounded-2xl border border-border/10 bg-surface p-10 text-center shadow-lg">
            <div className="mx-auto h-16 w-16 rounded-full bg-brand/10 grid place-items-center mb-6">
                <CloudUpload size={32} className="text-brand" />
            </div>
            <h2 className="text-2xl font-bold mb-3 font-heading">Tvůrčí Studio</h2>
            <p className="text-muted mb-8 max-w-md mx-auto">
                Pro nahrávání neomezeného množství videí a přístup k monetizaci je potřeba aktivní předplatné.
            </p>
            
            <div className="grid gap-6 max-w-lg mx-auto mb-8">
                <div className="p-6 bg-surface2 rounded-xl border border-border/10 flex items-center justify-between shadow-sm">
                    <div className="text-left">
                        <div className="font-bold text-lg">Creator Plan</div>
                        <div className="text-sm text-muted">Neomezený upload, 4K kvalita, Monetizace</div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-brand">44 Kč</div>
                        <div className="text-xs text-muted">měsíčně</div>
                    </div>
                </div>
            </div>

            <Button size="lg" onClick={() => window.open('https://stripe.com', '_blank')} className="px-8 shadow-lg shadow-brand/20">
                Aktivovat předplatné
            </Button>
            <p className="mt-4 text-xs text-muted">
                Noví uživatelé mají 3 dny zkušební verzi zdarma automaticky po registraci.
            </p>
        </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border/10 bg-surface p-5">
      {user?.subscriptionStatus === 'trial' && user.trialEndsAt && (
        <div className="mb-6 p-4 bg-brand/10 border border-brand/20 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Sparkles className="text-brand" size={20} />
                <div>
                    <div className="font-bold text-brand text-sm">Zkušební verze aktivní</div>
                    <div className="text-xs text-muted">
                         Zbývá {Math.max(0, Math.ceil((new Date(user.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} dní. Užijte si naplno!
                    </div>
                </div>
            </div>
            <Button size="sm" variant="secondary" onClick={() => window.open('https://stripe.com', '_blank')}>
                Předplatit
            </Button>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand/10">
          <CloudUpload size={18} className="text-brand" />
        </div>
        <div>
          <h3 className="font-heading text-sm font-semibold">Nahrát nové video</h3>
          <div className="text-xs text-muted">Nahrajte soubor ze zařízení nebo použijte embed kód.</div>
        </div>
      </div>

      <div className="mt-8 grid gap-6">
        <div>
          <div className="mb-2 text-sm font-semibold text-muted">Název</div>
          <Input 
            value={title} 
            onChange={(e) => onTitle(e.target.value)} 
            placeholder="Zadejte jasný a čitelný název" 
            className="p-6 text-lg shadow-md"
          />
        </div>
        
        <div>
          <div className="mb-2 text-sm font-semibold text-muted">Typ obsahu</div>
          <div className="flex gap-4">
            {(['video', 'movie', 'episode'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onType(t)}
                className={`px-6 py-3 rounded-xl text-sm font-medium border transition-all shadow-sm ${
                  type === t
                    ? 'bg-brand/10 border-brand text-brand shadow-md transform scale-105'
                    : 'bg-surface border-border/10 text-muted hover:border-border/30 hover:text-text hover:shadow-md'
                }`}
              >
                {t === 'video' ? 'Video' : t === 'movie' ? 'Film' : 'Epizoda'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 text-sm font-semibold text-muted">Popis</div>
          <textarea
            value={description}
            onChange={(e) => onDescription(e.target.value)}
            className="h-24 w-full rounded-[10px] border border-border/10 bg-surface px-3 py-2 text-sm text-text placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/70 shadow-md hover:shadow-lg transition-shadow"
            placeholder="O čem je toto video?"
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <div className="mb-2 text-sm font-semibold text-muted">Zdroj videa</div>
            <div className="flex gap-4 mb-3">
              <button
                type="button"
                onClick={() => onUploadMode('file')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all shadow-sm ${
                  uploadMode === 'file'
                    ? 'bg-brand/10 border-brand text-brand shadow-md'
                    : 'bg-surface border-border/10 text-muted hover:border-border/30 hover:text-text hover:shadow-md'
                }`}
              >
                <FileVideo size={18} />
                Soubor
              </button>
              <button
                type="button"
                onClick={() => onUploadMode('embed')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all shadow-sm ${
                  uploadMode === 'embed'
                    ? 'bg-brand/10 border-brand text-brand shadow-md'
                    : 'bg-surface border-border/10 text-muted hover:border-border/30 hover:text-text hover:shadow-md'
                }`}
              >
                <Code size={18} />
                Embed Kód
              </button>
            </div>
            
            {uploadMode === 'file' ? (
                <div className="grid gap-6">
                    <div>
                        <div className="mb-2 text-sm font-semibold text-muted">Video Soubor</div>
                        <div className="relative group">
                            <input
                                type="file"
                                accept="video/*"
                                multiple
                                onChange={(e) => onFilesSelect(e.target.files)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="flex items-center gap-3 h-14 w-full rounded-xl border border-border/10 bg-surface px-4 text-base text-text overflow-hidden transition-all shadow-md group-hover:shadow-lg group-hover:border-brand/30">
                                <div className="h-8 w-8 rounded-lg bg-brand/10 grid place-items-center">
                                    <FileVideo size={18} className="text-brand" />
                                </div>
                                <span className="truncate">{file ? file.name : "Vybrat video soubor(y)..."}</span>
                            </div>
                        </div>
                    </div>
                    <div>
                         <div className="mb-2 text-sm font-semibold text-muted">Zdrojová URL (Volitelné)</div>
                         <div className="relative">
                             <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
                                 <Link size={18} />
                             </div>
                             <Input 
                                 value={sourceUrl} 
                                 onChange={(e) => onSourceUrl(e.target.value)} 
                                 placeholder="Nebo vložte přímou URL" 
                                 className="pl-11 h-14 text-base shadow-md"
                             />
                         </div>
                    </div>
                </div>
            ) : (
                <div className="grid gap-6">
                     <div>
                        <div className="mb-2 text-sm font-semibold text-muted">Embed Kód</div>
                        <textarea
                            value={embedCode}
                            onChange={(e) => onEmbedCode(e.target.value)}
                            placeholder={'<iframe src="..." ...></iframe>'}
                            className="h-32 w-full rounded-xl border border-border/10 bg-surface px-4 py-3 text-sm text-text placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/70 shadow-md hover:shadow-lg transition-shadow font-mono"
                        />
                     </div>
                      <div>
                        <div className="text-sm font-semibold text-muted mb-2 flex items-center justify-between">
                          <span>Náhled</span>
                          {embedCode.includes('<script') && (
                            <span className="text-[10px] bg-brand/20 text-brand px-1.5 py-0.5 rounded font-bold uppercase">Chráněný Embed</span>
                          )}
                        </div>
                        {!previewCode ? (
                          <div className="aspect-video w-full rounded-xl border border-dashed border-border/20 grid place-items-center text-sm text-muted italic bg-surface/50">
                            Zadejte embed kód pro náhled
                          </div>
                        ) : (
                          <div className="aspect-video w-full rounded-xl border border-border/10 overflow-hidden bg-black shadow-xl ring-1 ring-white/10">
                            <SafeEmbed code={previewCode} className="w-full h-full" />
                          </div>
                        )}
                      </div>
                </div>
            )}
        </div>
        
        {/* Thumbnail Upload - Always available */}
        <div>
            <div className="mb-1 text-xs font-semibold text-muted">Vlastní náhledovka (Volitelné)</div>
            <div className="relative">
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onThumbnailSelect(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex items-center gap-2 h-10 w-full rounded-[10px] border border-border/10 bg-surface px-3 text-sm text-text overflow-hidden">
                    <ImageIcon size={16} className="text-muted flex-shrink-0" />
                    <span className="truncate">{thumbnailFile ? thumbnailFile.name : "Vybrat obrázek náhledu..."}</span>
                </div>
            </div>
            <div className="mt-1 text-[10px] text-muted">
                Pokud není nahrána, bude vygenerována automaticky z videa.
            </div>
        </div>

        <div className="mt-2 flex justify-end">
          <Button onClick={onCreate} disabled={creating || (!title) || (uploadMode === 'file' && !file && !sourceUrl) || (uploadMode === 'embed' && !embedCode)}>
             {creating ? (
                 <div className="flex flex-col items-end gap-1">
                   <div className="flex items-center">
                     <Loader2 size={16} className="animate-spin mr-2" />
                     Nahrávání {progressText}
                   </div>
                   {uploadSpeed && (
                     <div className="text-[10px] text-white/60 font-mono">
                       {uploadSpeed} • zbývá {timeRemaining || '...'}
                     </div>
                   )}
                 </div>
             ) : (
                 <>
                   <Upload size={16} className="mr-2" />
                   Zveřejnit video
                 </>
             )}
          </Button>
        </div>
      </div>
    </div>
  )
}

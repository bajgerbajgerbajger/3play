import { X, Loader2, CheckCircle2, AlertCircle, Upload } from 'lucide-react'
import { useUploadModal } from '@/store/uploadModal'
import { cn } from '@/lib/utils'

export function UploadProgressModal() {
  const { isOpen, close, progress, speed, timeRemaining, status, error } = useUploadModal()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-border/10 bg-surface p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-heading text-lg font-semibold">
            {status === 'uploading' && 'Nahrávání videa...'}
            {status === 'processing' && 'Zpracování...'}
            {status === 'complete' && 'Hotovo!'}
            {status === 'error' && 'Chyba nahrávání'}
            {status === 'idle' && 'Příprava...'}
          </h3>
          {status !== 'uploading' && status !== 'processing' && (
             <button onClick={close} className="rounded-full p-1 hover:bg-white/10 transition">
               <X size={20} className="text-muted hover:text-white" />
             </button>
          )}
        </div>

        {/* Content */}
        <div className="space-y-6">
          
          {/* Status Icon/Visual */}
          <div className="flex justify-center py-4">
             {status === 'uploading' && (
               <div className="relative">
                 <div className="absolute inset-0 animate-ping rounded-full bg-brand/20"></div>
                 <div className="relative grid h-16 w-16 place-items-center rounded-full bg-brand/10 text-brand">
                   <Upload size={32} className="animate-bounce" />
                 </div>
               </div>
             )}
             {status === 'processing' && (
               <div className="grid h-16 w-16 place-items-center rounded-full bg-blue-500/10 text-blue-500">
                 <Loader2 size={32} className="animate-spin" />
               </div>
             )}
             {status === 'complete' && (
               <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-500/10 text-emerald-500 animate-in zoom-in duration-300">
                 <CheckCircle2 size={32} />
               </div>
             )}
             {status === 'error' && (
               <div className="grid h-16 w-16 place-items-center rounded-full bg-red-500/10 text-red-500">
                 <AlertCircle size={32} />
               </div>
             )}
          </div>

          {/* Progress Bar */}
          {(status === 'uploading' || status === 'processing') && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-text">
                  {status === 'uploading' ? `Nahráno ${Math.round(progress)}%` : 'Dokončování...'}
                </span>
                <span className="text-muted">
                  {status === 'uploading' ? timeRemaining : ''}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface2">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-300 ease-out",
                    status === 'uploading' ? "bg-brand" : "bg-blue-500 animate-pulse"
                  )}
                  style={{ width: `${Math.max(5, progress)}%` }}
                />
              </div>
              {status === 'uploading' && speed && (
                <div className="text-center text-[10px] text-muted font-mono">
                  Rychlost: {speed}
                </div>
              )}
            </div>
          )}

          {/* Messages */}
          <div className="text-center">
            {status === 'complete' && (
               <p className="text-sm text-muted">Video bylo úspěšně nahráno a zpracováno.</p>
            )}
            {status === 'error' && (
               <p className="text-sm text-red-400">{error || 'Něco se pokazilo.'}</p>
            )}
            {status === 'processing' && (
               <p className="text-xs text-muted animate-pulse">Čekáme na potvrzení serveru...</p>
            )}
          </div>

          {/* Actions */}
          {status === 'complete' && (
            <button 
              onClick={close}
              className="w-full rounded-xl bg-brand py-3 text-sm font-bold text-white transition hover:bg-brand-hover active:scale-[0.98]"
            >
              Zavřít a přejít na video
            </button>
          )}
          
          {status === 'error' && (
            <button 
              onClick={close}
              className="w-full rounded-xl bg-surface2 py-3 text-sm font-bold text-text transition hover:bg-white/10"
            >
              Zavřít
            </button>
          )}

        </div>
      </div>
    </div>
  )
}

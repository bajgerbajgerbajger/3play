import React, { useState } from 'react'
import { X, Copy, Check, Code } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'

type ShareModalProps = {
  isOpen: boolean
  onClose: () => void
  videoId: string
  title: string
}

export function ShareModal({ isOpen, onClose, videoId, title }: ShareModalProps) {
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedEmbed, setCopiedEmbed] = useState(false)
  const [showEmbed, setShowEmbed] = useState(false)

  if (!isOpen) return null

  const shareUrl = `${window.location.origin}/watch/${videoId}`
  const embedCode = `<iframe src="${window.location.origin}/embed/${videoId}" width="640" height="360" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`

  const copyToClipboard = (text: string, type: 'link' | 'embed') => {
    navigator.clipboard.writeText(text)
    if (type === 'link') {
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    } else {
      setCopiedEmbed(true)
      setTimeout(() => setCopiedEmbed(false), 2000)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-border/10 bg-surface shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-border/10 p-4">
          <h3 className="font-heading text-lg font-semibold">Sdílet video</h3>
          <IconButton onClick={onClose} aria-label="Close">
            <X size={20} />
          </IconButton>
        </div>
        
        <div className="p-4 space-y-6">
          {/* Direct Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted">Odkaz na video</label>
            <div className="flex gap-2">
              <div className="flex-1 rounded-lg border border-border/10 bg-surface2 px-3 py-2 text-sm text-text truncate font-mono">
                {shareUrl}
              </div>
              <Button 
                variant="secondary" 
                onClick={() => copyToClipboard(shareUrl, 'link')}
                className="shrink-0"
              >
                {copiedLink ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
              </Button>
            </div>
          </div>

          {/* Embed Option */}
          <div className="space-y-2">
            <button 
              onClick={() => setShowEmbed(!showEmbed)}
              className="flex items-center gap-2 text-sm font-medium text-brand hover:text-brand-hover transition-colors"
            >
              <Code size={16} />
              {showEmbed ? 'Skrýt kód pro vložení' : 'Zobrazit kód pro vložení (Embed)'}
            </button>
            
            {showEmbed && (
              <div className="animate-in slide-in-from-top-2 duration-200 space-y-2">
                <div className="relative">
                  <textarea 
                    readOnly
                    value={embedCode}
                    className="w-full h-24 rounded-lg border border-border/10 bg-surface2 px-3 py-2 text-xs text-text font-mono resize-none focus:outline-none focus:ring-1 focus:ring-brand/50"
                  />
                  <div className="absolute top-2 right-2">
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => copyToClipboard(embedCode, 'embed')}
                    >
                      {copiedEmbed ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                      <span className="ml-2 text-xs">Kopírovat</span>
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted">
                  Vložením tohoto kódu na váš web souhlasíte s našimi podmínkami služby.
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="border-t border-border/10 bg-surface2/30 p-4 flex justify-end">
          <Button variant="primary" onClick={onClose}>
            Hotovo
          </Button>
        </div>
      </div>
    </div>
  )
}

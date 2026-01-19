import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { apiFetch } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { X, Upload, Loader2 } from 'lucide-react'

type ChannelEditorProps = {
  initialData: {
    displayName: string
    bio: string
    avatarUrl: string
    bannerUrl: string
  }
  onClose: () => void
  onUpdate: (data: any) => void
}

export function ChannelEditor({ initialData, onClose, onUpdate }: ChannelEditorProps) {
  const { token } = useAuthStore()
  const [displayName, setDisplayName] = useState(initialData.displayName)
  const [bio, setBio] = useState(initialData.bio)
  const [avatarUrl, setAvatarUrl] = useState(initialData.avatarUrl)
  const [bannerUrl, setBannerUrl] = useState(initialData.bannerUrl)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpload = async (file: File, type: 'avatar' | 'banner') => {
    if (!token) return
    const setUploading = type === 'avatar' ? setUploadingAvatar : setUploadingBanner
    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const res = await fetch('/api/studio/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Upload failed')
      
      if (type === 'avatar') {
        setAvatarUrl(data.url)
      } else {
        setBannerUrl(data.url)
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!token) return
    setSaving(true)
    setError(null)
    try {
      const d = await apiFetch<{ success: true; channel: any }>('/api/studio/channel', {
        method: 'PATCH',
        token,
        body: JSON.stringify({ displayName, bio, avatarUrl, bannerUrl }),
      })
      onUpdate(d.channel)
      onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border/10 bg-surface p-6 shadow-2xl animate-fadeUp">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold font-heading">Edit Channel</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        {error ? (
          <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        ) : null}

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {/* Banner */}
          <div>
            <label className="text-xs font-semibold text-muted mb-2 block">Banner Image</label>
            <div className="relative h-32 rounded-xl overflow-hidden bg-surface2 group">
              <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <label className="cursor-pointer flex flex-col items-center gap-1 text-white hover:text-brand transition">
                  {uploadingBanner ? <Loader2 className="animate-spin" /> : <Upload size={24} />}
                  <span className="text-xs font-medium">Change Banner</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'banner')}
                    disabled={uploadingBanner}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 rounded-full overflow-hidden bg-surface2 shrink-0 group">
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <label className="cursor-pointer text-white hover:text-brand transition">
                  {uploadingAvatar ? <Loader2 className="animate-spin" /> : <Upload size={20} />}
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'avatar')}
                    disabled={uploadingAvatar}
                  />
                </label>
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">Profile Picture</div>
              <div className="text-xs text-muted">Recommended: 800x800px or larger</div>
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-3">
            <div>
              <div className="mb-1 text-xs font-semibold text-muted">Display Name</div>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>
            <div>
              <div className="mb-1 text-xs font-semibold text-muted">Bio</div>
              <textarea 
                value={bio} 
                onChange={(e) => setBio(e.target.value)}
                className="w-full h-24 rounded-xl border border-border/10 bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 resize-none"
                placeholder="Tell viewers about your channel..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border/10">
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} loading={saving}>Save Changes</Button>
        </div>
      </div>
    </div>
  )
}

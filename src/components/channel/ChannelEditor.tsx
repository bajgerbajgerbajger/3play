import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { apiFetch } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { X, Upload, Loader2, Plus, Trash2 } from 'lucide-react'

type SocialLink = {
  platform: string
  url: string
}

type ChannelProfile = {
  displayName: string
  bio: string
  avatarUrl: string
  bannerUrl: string
  socialLinks?: SocialLink[]
  phone?: string
}

type ChannelEditorProps = {
  initialData: ChannelProfile
  onClose: () => void
  onUpdate: (data: ChannelProfile) => void
}

export function ChannelEditor({ initialData, onClose, onUpdate }: ChannelEditorProps) {
  const { token } = useAuthStore()
  const [displayName, setDisplayName] = useState(initialData.displayName)
  const [bio, setBio] = useState(initialData.bio || '')
  const [avatarUrl, setAvatarUrl] = useState(initialData.avatarUrl)
  const [bannerUrl, setBannerUrl] = useState(initialData.bannerUrl)
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(initialData.socialLinks || [])
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
      
      const data = await apiFetch<{ success: true; url: string }>('/api/studio/upload', {
        method: 'POST',
        token,
        body: formData
      })
      
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
      const d = await apiFetch<{ success: true; channel: ChannelProfile }>('/api/channels', {
        method: 'PATCH',
        token,
        body: JSON.stringify({ displayName, description: bio, avatarUrl, bannerUrl, socialLinks }),
      })
      onUpdate(d.channel)
      onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: 'Website', url: '' }])
  }

  const updateSocialLink = (index: number, field: keyof SocialLink, value: string) => {
    const newLinks = [...socialLinks]
    newLinks[index] = { ...newLinks[index], [field]: value }
    setSocialLinks(newLinks)
  }

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-border/10 bg-surface p-6 shadow-2xl animate-fadeUp flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between mb-6 shrink-0">
          <h2 className="text-lg font-bold font-heading">Upravit kanál</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        {error ? (
          <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400 shrink-0">
            {error}
          </div>
        ) : null}

        <div className="space-y-6 overflow-y-auto pr-2 flex-1">
          {/* Banner */}
          <div>
            <label className="text-xs font-semibold text-muted mb-2 block">Banner kanálu</label>
            <div className="relative h-32 rounded-xl overflow-hidden bg-surface2 group border border-border/10">
              <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <label className="cursor-pointer flex flex-col items-center gap-1 text-white hover:text-brand transition">
                  {uploadingBanner ? <Loader2 className="animate-spin" /> : <Upload size={24} />}
                  <span className="text-xs font-medium">Změnit banner</span>
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
            <div className="relative h-20 w-20 rounded-full overflow-hidden bg-surface2 shrink-0 group border border-border/10">
              <Avatar 
                src={avatarUrl} 
                alt="Avatar" 
                gender={initialData.gender}
                className="w-full h-full"
                size="custom"
              />
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
              <div className="text-sm font-semibold">Profilová fotka</div>
              <div className="text-xs text-muted">Doporučeno: 800x800px nebo větší.</div>
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-4">
            <div>
              <div className="mb-1 text-xs font-semibold text-muted">Název kanálu</div>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>
            <div>
              <div className="mb-1 text-xs font-semibold text-muted">Bio (Popis kanálu)</div>
              <textarea 
                value={bio} 
                onChange={(e) => setBio(e.target.value)}
                className="w-full h-24 rounded-xl border border-border/10 bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 resize-none text-text"
                placeholder="Řekněte divákům o čem je váš kanál..."
              />
            </div>
          </div>

          {/* Social Links */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-muted">Sociální sítě</div>
              <Button size="sm" variant="secondary" onClick={addSocialLink} className="h-7 text-xs">
                <Plus size={14} className="mr-1" /> Přidat
              </Button>
            </div>
            <div className="space-y-2">
              {socialLinks.map((link, i) => (
                <div key={i} className="flex gap-2">
                  <select
                    value={link.platform}
                    onChange={(e) => updateSocialLink(i, 'platform', e.target.value)}
                    className="h-10 w-32 rounded-lg border border-border/10 bg-surface px-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand/50"
                  >
                    <option value="Website">Web</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Twitter">Twitter</option>
                    <option value="Facebook">Facebook</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Twitch">Twitch</option>
                    <option value="Discord">Discord</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Other">Jiné</option>
                  </select>
                  <Input 
                    value={link.url} 
                    onChange={(e) => updateSocialLink(i, 'url', e.target.value)} 
                    placeholder="https://..."
                    className="flex-1"
                  />
                  <button 
                    onClick={() => removeSocialLink(i)}
                    className="h-10 w-10 flex items-center justify-center rounded-lg border border-border/10 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {socialLinks.length === 0 && (
                <div className="text-sm text-muted italic text-center py-4 border border-dashed border-border/10 rounded-xl">
                  Žádné odkazy. Přidejte nějaké pro vaše fanoušky!
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border/10 shrink-0">
          <Button variant="secondary" onClick={onClose} disabled={saving}>Zrušit</Button>
          <Button onClick={handleSave} loading={saving}>Uložit změny</Button>
        </div>
      </div>
    </div>
  )
}

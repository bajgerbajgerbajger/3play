import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Upload, Camera, Loader2, ArrowRight } from 'lucide-react'

export default function ChannelSetup() {
  const navigate = useNavigate()
  const { user, token, hydrated } = useAuthStore()
  
  const [displayName, setDisplayName] = useState('')
  const [handle, setHandle] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [bannerUrl, setBannerUrl] = useState('')
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (hydrated && !user) {
      navigate('/auth')
      return
    }
    if (user && token) {
        // Pre-fill from user object if available, or fetch profile
        setDisplayName(user.displayName)
        setHandle(user.handle.replace('@', ''))
        setAvatarUrl(user.avatarUrl)
        
        // Fetch full profile details
        apiFetch<any>(`/api/channels/${encodeURIComponent(user.handle)}`)
            .then(data => {
                if (data.channel) {
                    setBio(data.channel.bio || '')
                    setBannerUrl(data.channel.bannerUrl || '')
                    if (data.channel.avatarUrl) setAvatarUrl(data.channel.avatarUrl)
                }
            })
            .catch(() => {}) // Ignore error, maybe profile doesn't exist yet fully or network error
            .finally(() => setLoading(false))
    }
  }, [hydrated, user, token, navigate])

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
      await apiFetch('/api/channels', {
        method: 'PATCH',
        token,
        body: JSON.stringify({ 
            displayName, 
            description: bio, 
            avatarUrl, 
            bannerUrl,
            // We don't change handle here easily as it requires uniqueness check, keeping it simple for now
            // handle: `@${handle}` 
        }),
      })
      navigate('/studio')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-surface rounded-2xl shadow-xl border border-border/10 overflow-hidden">
        <div className="p-8 border-b border-border/10">
          <h1 className="text-3xl font-bold font-heading text-center">Nastavení Vašeho Kanálu</h1>
          <p className="text-muted text-center mt-2">Přizpůsobte si svůj profil, aby diváci věděli, kdo jste.</p>
        </div>
        
        <div className="p-8 space-y-8">
            {/* Banner & Avatar Section */}
            <div className="relative group">
                <div className="h-40 w-full bg-surface2 rounded-xl overflow-hidden relative border border-border/10">
                    {bannerUrl ? (
                        <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted">
                            Nahrajte banner (16:9)
                        </div>
                    )}
                    <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Upload className="w-8 h-8 text-white" />
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'banner')} />
                    </label>
                    {uploadingBanner && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>}
                </div>

                <div className="absolute -bottom-10 left-8">
                    <div className="relative h-24 w-24 rounded-full border-4 border-surface bg-surface2 overflow-hidden group/avatar">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-brand/10 text-brand font-bold text-2xl">
                                {displayName.charAt(0)}
                            </div>
                        )}
                        <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer rounded-full">
                            <Camera className="w-6 h-6 text-white" />
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'avatar')} />
                        </label>
                        {uploadingAvatar && <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full"><Loader2 className="animate-spin text-white" /></div>}
                    </div>
                </div>
            </div>

            <div className="mt-12 space-y-6">
                <div className="grid gap-2">
                    <label className="font-semibold ml-1">Název kanálu</label>
                    <Input 
                        value={displayName} 
                        onChange={(e) => setDisplayName(e.target.value)} 
                        placeholder="Jak se jmenuje váš kanál?"
                        className="text-lg p-6 shadow-md"
                    />
                </div>

                <div className="grid gap-2">
                    <label className="font-semibold ml-1">Popis (Bio)</label>
                    <textarea 
                        value={bio} 
                        onChange={(e) => setBio(e.target.value)} 
                        placeholder="O čem je váš kanál?"
                        className="w-full rounded-[10px] border border-border/10 bg-surface p-4 text-sm text-text placeholder:text-muted shadow-md hover:shadow-lg transition-shadow duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/70 min-h-[100px]"
                    />
                </div>
            </div>

            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        </div>

        <div className="p-8 border-t border-border/10 flex justify-end">
            <Button 
                onClick={handleSave} 
                disabled={saving}
                className="w-full sm:w-auto text-lg px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-all"
                variant="primary"
            >
                {saving ? <Loader2 className="animate-spin mr-2" /> : null}
                Dokončit a přejít do Studia <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
        </div>
      </div>
    </div>
  )
}

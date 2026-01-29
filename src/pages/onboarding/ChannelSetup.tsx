import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Upload, Camera, Loader2, ArrowRight, Instagram, Twitter, Youtube, Globe, Facebook, Link as LinkIcon } from 'lucide-react'

export default function ChannelSetup() {
  const navigate = useNavigate()
  const { user, token, hydrated } = useAuthStore()
  
  const [displayName, setDisplayName] = useState('')
  const [handle, setHandle] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [bannerUrl, setBannerUrl] = useState('')
  
  // Social Links State
  const [socials, setSocials] = useState({
    instagram: '',
    twitter: '',
    youtube: '',
    facebook: '',
    website: ''
  })
  
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
                    
                    // Parse social links
                    if (Array.isArray(data.channel.socialLinks)) {
                        const newSocials = { ...socials }
                        data.channel.socialLinks.forEach((link: any) => {
                            if (link.platform === 'instagram') newSocials.instagram = link.url
                            if (link.platform === 'twitter') newSocials.twitter = link.url
                            if (link.platform === 'youtube') newSocials.youtube = link.url
                            if (link.platform === 'facebook') newSocials.facebook = link.url
                            if (link.platform === 'website') newSocials.website = link.url
                        })
                        setSocials(newSocials)
                    }
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
    
    // Convert socials object to array format
    const socialLinks = Object.entries(socials)
        .filter(([_, url]) => url.trim() !== '')
        .map(([platform, url]) => ({ platform, url: url.trim() }))

    try {
      await apiFetch('/api/channels', {
        method: 'PATCH',
        token,
        body: JSON.stringify({ 
            displayName, 
            description: bio, 
            avatarUrl, 
            bannerUrl,
            socialLinks
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
    <div className="min-h-screen bg-bg flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-3xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold font-heading bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            Uživatelské Centrum
          </h1>
          <p className="text-muted text-lg">Profesionální nástroje pro správu vaší digitální identity.</p>
        </div>

        <div className="bg-surface rounded-2xl shadow-2xl border border-border/10 overflow-hidden backdrop-blur-sm">
            {/* Banner & Avatar Section - Visual Preview */}
            <div className="relative group">
                <div className="h-48 md:h-64 w-full bg-surface2 relative overflow-hidden">
                    {bannerUrl ? (
                        <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-muted gap-2 bg-gradient-to-br from-surface2 to-bg">
                            <Upload className="w-8 h-8 opacity-50" />
                            <span className="text-sm font-medium">Nahrát Banner (16:9)</span>
                        </div>
                    )}
                    <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-[2px]">
                        <Upload className="w-10 h-10 text-white mb-2" />
                        <span className="text-white font-semibold">Změnit Banner</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'banner')} />
                    </label>
                    {uploadingBanner && <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>}
                </div>

                <div className="absolute -bottom-16 left-8 md:left-12">
                    <div className="relative h-32 w-32 md:h-40 md:w-40 rounded-full border-[6px] border-surface bg-surface2 overflow-hidden group/avatar shadow-lg">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-brand/10 text-brand font-bold text-4xl">
                                {displayName.charAt(0)}
                            </div>
                        )}
                        <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-all cursor-pointer backdrop-blur-[2px]">
                            <Camera className="w-8 h-8 text-white" />
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'avatar')} />
                        </label>
                        {uploadingAvatar && <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>}
                    </div>
                </div>
            </div>

            <div className="pt-20 px-8 pb-8 space-y-8">
                {/* Basic Info */}
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-muted uppercase tracking-wider">Název kanálu</label>
                        <Input 
                            value={displayName} 
                            onChange={(e) => setDisplayName(e.target.value)} 
                            placeholder="Váš název"
                            className="bg-surface2/50 border-border/20 focus:border-primary/50 text-lg"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-muted uppercase tracking-wider">Handle (ID)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted font-bold">@</span>
                            <Input 
                                value={handle} 
                                disabled
                                className="pl-8 bg-surface2/30 border-border/10 text-muted cursor-not-allowed"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-muted uppercase tracking-wider">O kanálu (Bio)</label>
                    <textarea 
                        value={bio} 
                        onChange={(e) => setBio(e.target.value)} 
                        placeholder="Napište něco o sobě a vašem obsahu..."
                        className="w-full rounded-xl border border-border/20 bg-surface2/50 p-4 text-sm text-text placeholder:text-muted/50 shadow-inner focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[120px] resize-y transition-all"
                    />
                </div>

                {/* Social Links */}
                <div className="space-y-4 pt-4 border-t border-border/10">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <LinkIcon size={20} className="text-primary" />
                        Sociální Sítě
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="relative">
                            <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-500 w-5 h-5" />
                            <Input 
                                placeholder="Instagram URL" 
                                className="pl-10"
                                value={socials.instagram}
                                onChange={(e) => setSocials({...socials, instagram: e.target.value})}
                            />
                        </div>
                        <div className="relative">
                            <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 w-5 h-5" />
                            <Input 
                                placeholder="Twitter / X URL" 
                                className="pl-10"
                                value={socials.twitter}
                                onChange={(e) => setSocials({...socials, twitter: e.target.value})}
                            />
                        </div>
                        <div className="relative">
                            <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500 w-5 h-5" />
                            <Input 
                                placeholder="YouTube URL" 
                                className="pl-10"
                                value={socials.youtube}
                                onChange={(e) => setSocials({...socials, youtube: e.target.value})}
                            />
                        </div>
                        <div className="relative">
                            <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 w-5 h-5" />
                            <Input 
                                placeholder="Facebook URL" 
                                className="pl-10"
                                value={socials.facebook}
                                onChange={(e) => setSocials({...socials, facebook: e.target.value})}
                            />
                        </div>
                        <div className="relative md:col-span-2">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 w-5 h-5" />
                            <Input 
                                placeholder="Váš web (https://...)" 
                                className="pl-10"
                                value={socials.website}
                                onChange={(e) => setSocials({...socials, website: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center font-medium animate-in fade-in slide-in-from-top-2">
                        {error}
                    </div>
                )}

                <div className="pt-4 flex justify-end">
                    <Button 
                        onClick={handleSave} 
                        disabled={saving}
                        className="w-full md:w-auto px-8 py-6 text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
                        variant="primary"
                    >
                        {saving ? <Loader2 className="animate-spin mr-2" /> : null}
                        Uložit a Pokračovat <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}

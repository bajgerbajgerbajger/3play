import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Loader2, Save, User, Phone, AlignLeft } from 'lucide-react'

export function SettingsPanel() {
  const { token, init } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    phone: '',
    avatarUrl: '',
    bannerUrl: '',
    gender: 'other' as 'male' | 'female' | 'other'
  })

  useEffect(() => {
    if (!token) return
    loadProfile()
  }, [token])

  type ChannelProfile = {
    displayName: string
    bio: string
    phone: string
    avatarUrl: string
    bannerUrl: string
    gender?: 'male' | 'female' | 'other'
  }

  async function loadProfile() {
    try {
      setLoading(true)
      // Use existing endpoint that returns channel profile
      const data = await apiFetch<{ success: boolean; channel: ChannelProfile | null }>('/api/studio/me', { token })
      if (data.channel) {
        setFormData({
          displayName: data.channel.displayName || '',
          bio: data.channel.bio || '',
          phone: data.channel.phone || '',
          avatarUrl: data.channel.avatarUrl || '',
          bannerUrl: data.channel.bannerUrl || ''
        })
      }
    } catch {
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    try {
      setSaving(true)
      setError(null)
      setSuccess(false)
      
      await apiFetch('/api/studio/channel', {
        method: 'PATCH',
        token,
        body: JSON.stringify(formData)
      })
      
      // Refresh auth user global state to update header if name changed
      await init()
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="animate-spin text-muted" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Channel Settings</h1>
        <p className="text-muted">Manage your channel profile and personal details.</p>
      </div>
      
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-200">
          Settings saved successfully!
        </div>
      )}

      <div className="space-y-6 rounded-2xl border border-border/10 bg-surface2/50 p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-muted">
              <User size={14} />
              Display Name
            </label>
            <Input 
              value={formData.displayName} 
              onChange={e => setFormData({...formData, displayName: e.target.value})} 
              placeholder="Your channel name"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-muted">
              <User size={14} />
              Gender
            </label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={formData.gender === 'male' ? 'primary' : 'secondary'}
                size="sm"
                className="flex-1"
                onClick={() => setFormData({...formData, gender: 'male'})}
              >
                Male
              </Button>
              <Button
                type="button"
                variant={formData.gender === 'female' ? 'primary' : 'secondary'}
                size="sm"
                className="flex-1"
                onClick={() => setFormData({...formData, gender: 'female'})}
              >
                Female
              </Button>
              <Button
                type="button"
                variant={formData.gender === 'other' ? 'primary' : 'secondary'}
                size="sm"
                className="flex-1"
                onClick={() => setFormData({...formData, gender: 'other'})}
              >
                Other
              </Button>
            </div>
            <p className="text-xs text-muted/60">Changing gender will reset your avatar to default.</p>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-muted">
              <Phone size={14} />
              Phone Number
            </label>
            <Input 
              value={formData.phone} 
              onChange={e => setFormData({...formData, phone: e.target.value})} 
              placeholder="+123456789"
            />
            <p className="text-xs text-muted/60">Used for account security and notifications.</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-muted">
            <AlignLeft size={14} />
            Bio / Description
          </label>
          <Textarea 
            value={formData.bio} 
            onChange={e => setFormData({...formData, bio: e.target.value})} 
            placeholder="Tell viewers about your channel..."
            rows={5}
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto">
          {saving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
          Save Changes
        </Button>
      </div>
    </div>
  )
}

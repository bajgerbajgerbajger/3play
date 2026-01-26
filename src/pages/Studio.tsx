import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import type { StudioVideo, Tab } from '@/pages/studio/types'
import { sampleSources } from '@/pages/studio/types'
import { StudioSidebar } from '@/pages/studio/StudioSidebar'
import { UploadPanel } from '@/pages/studio/UploadPanel'
import { VideosPanel } from '@/pages/studio/VideosPanel'
import { VideoEditor } from '@/pages/studio/VideoEditor'

export default function Studio() {
  const nav = useNavigate()
  const { user, token, hydrated } = useAuthStore()
  const [tab, setTab] = useState<Tab>('upload')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<StudioVideo[]>([])

  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadDesc, setUploadDesc] = useState('')
  const [uploadType, setUploadType] = useState<'video' | 'movie' | 'episode'>('video')
  const [uploadSource, setUploadSource] = useState<string>('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadMode, setUploadMode] = useState<'file' | 'embed'>('file')
  const [embedCode, setEmbedCode] = useState<string>('')
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadSpeed, setUploadSpeed] = useState('')
  const [uploadTimeRemaining, setUploadTimeRemaining] = useState('')
  const [creating, setCreating] = useState(false)
  const [selected, setSelected] = useState<StudioVideo | null>(null)

  // Scroll to editor when selected
  useEffect(() => {
    if (selected) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    }
  }, [selected])

  const readyCount = useMemo(() => items.filter((v) => v.status === 'ready').length, [items])

  useEffect(() => {
    if (!hydrated) return
    if (!user || !token) {
      nav(`/auth?returnTo=${encodeURIComponent('/studio')}`)
      return
    }
    setLoading(true)
    setError(null)
    apiFetch<{ success: true; items: StudioVideo[] }>('/api/studio/videos', { token })
      .then((d) => setItems(d.items))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false))
  }, [hydrated, user, token, nav])

  useEffect(() => {
    if (!token) return
    const t = window.setInterval(() => {
      apiFetch<{ success: true; items: StudioVideo[] }>('/api/studio/videos', { token })
        .then((d) => setItems(d.items))
        .catch(() => null)
    }, 3000)
    return () => window.clearInterval(t)
  }, [token])

  async function createUpload() {
    if (!token) return
    if (uploadTitle.trim().length < 3) {
      setError('Title must be at least 3 characters')
      return
    }
    if (uploadMode === 'file') {
      if (!uploadFile && !uploadSource.trim()) {
        setError('Please select a file or enter a source URL')
        return
      }
    } else {
      if (!embedCode.trim()) {
        setError('Please provide a valid embed code')
        return
      }
    }

    setError(null)
    setCreating(true)
    setUploadProgress(0)
    setUploadSpeed('')
    setUploadTimeRemaining('')

    try {
      let finalSourceUrl = uploadSource
      let finalThumbnailUrl = undefined
      let finalDuration = 0

      if (uploadMode === 'file') {
        if (uploadFile || thumbnailFile) {
          const formData = new FormData()
          if (uploadFile) formData.append('file', uploadFile)
          if (thumbnailFile) formData.append('thumbnail', thumbnailFile)
          
          const startTime = Date.now()
          
          const res = await new Promise<any>((resolve, reject) => {
            const xhr = new XMLHttpRequest()
            xhr.open('POST', '/api/studio/upload')
            xhr.setRequestHeader('Authorization', `Bearer ${token}`)
            
            xhr.upload.onprogress = (e) => {
              if (e.lengthComputable) {
                const percentComplete = (e.loaded / e.total) * 100
                setUploadProgress(percentComplete)
                
                // Calculate speed and remaining time
                const elapsedTime = (Date.now() - startTime) / 1000 // seconds
                if (elapsedTime > 0.5) { // Only calculate after a bit of time
                   const speedBytesPerSec = e.loaded / elapsedTime
                   const remainingBytes = e.total - e.loaded
                   const remainingSeconds = remainingBytes / speedBytesPerSec
                   
                   // Format speed
                   let speedText = ''
                   if (speedBytesPerSec > 1024 * 1024) {
                     speedText = `${(speedBytesPerSec / (1024 * 1024)).toFixed(1)} MB/s`
                   } else {
                     speedText = `${(speedBytesPerSec / 1024).toFixed(0)} KB/s`
                   }
                   setUploadSpeed(speedText)
                   
                   // Format time
                   if (remainingSeconds < 60) {
                     setUploadTimeRemaining(`${Math.ceil(remainingSeconds)}s`)
                   } else {
                     const mins = Math.floor(remainingSeconds / 60)
                     const secs = Math.ceil(remainingSeconds % 60)
                     setUploadTimeRemaining(`${mins}m ${secs}s`)
                   }
                }
              }
            }
            
            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                try {
                   const data = JSON.parse(xhr.responseText)
                   resolve(data)
                } catch (err) {
                   reject(new Error('Invalid response from server'))
                }
              } else {
                reject(new Error(`Upload failed: ${xhr.statusText}`))
              }
            }
            
            xhr.onerror = () => reject(new Error('Network error during upload'))
            
            xhr.send(formData)
          })

          if (!res.success) throw new Error(res.error || 'Upload failed')
          if (res.url) finalSourceUrl = res.url
          if (res.thumbnailUrl) finalThumbnailUrl = res.thumbnailUrl
          finalDuration = res.duration || 0
        }
      } else {
        finalSourceUrl = ''
      }

      const d = await apiFetch<{ success: true; video: StudioVideo }>('/api/studio/videos', {
        method: 'POST',
        token,
        body: JSON.stringify({ 
          title: uploadTitle.trim(), 
          description: uploadDesc,
          type: uploadType,
          sourceUrl: finalSourceUrl,
          thumbnailUrl: finalThumbnailUrl,
          duration: finalDuration,
          embedCode: uploadMode === 'embed' ? embedCode : undefined
        }),
      })
      setUploadProgress(100)
      setItems((prev) => [d.video, ...prev])
      setTab('videos')
      setSelected(d.video)
      setUploadTitle('')
      setUploadDesc('')
      setUploadType('video')
      setUploadFile(null)
      setUploadSource('')
      setEmbedCode('')
      setThumbnailFile(null)
      setUploadMode('file')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setCreating(false)
      window.setTimeout(() => setUploadProgress(0), 800)
    }
  }

  async function saveSelected() {
    if (!token || !selected) return
    setError(null)
    try {
      const d = await apiFetch<{ success: true; video: StudioVideo }>(`/api/studio/videos/${encodeURIComponent(selected.id)}`, {
        method: 'PATCH',
        token,
        body: JSON.stringify({ title: selected.title, description: selected.description, visibility: selected.visibility }),
      })
      setSelected(d.video)
      setItems((prev) => prev.map((v) => (v.id === d.video.id ? d.video : v)))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed')
    }
  }

  async function publishSelected() {
    if (!token || !selected) return
    setError(null)
    try {
      const d = await apiFetch<{ success: true; video: StudioVideo }>(
        `/api/studio/videos/${encodeURIComponent(selected.id)}/publish`,
        { method: 'POST', token },
      )
      setSelected(d.video)
      setItems((prev) => prev.map((v) => (v.id === d.video.id ? d.video : v)))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed')
    }
  }

  async function handleThumbnailUpload(file: File): Promise<string> {
    if (!token) {
      throw new Error('Not authenticated')
    }
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/studio/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
    const data = (await res.json()) as { success?: boolean; thumbnailUrl?: string; error?: string }
    if (!data.success || !data.thumbnailUrl) {
      throw new Error(data.error || 'Thumbnail upload failed')
    }
    return data.thumbnailUrl
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] animate-fadeUp">
      <StudioSidebar tab={tab} readyCount={readyCount} onTab={setTab} />

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-heading text-xl font-bold tracking-tight">Creator Dashboard</h1>
            <div className="text-sm text-muted">Upload, process, and publish with confidence.</div>
          </div>
          {user ? (
            <div className="flex items-center gap-2">
              <img src={user.avatarUrl} alt={user.displayName} className="h-9 w-9 rounded-full object-cover" />
              <div>
                <div className="text-sm font-semibold leading-tight">{user.displayName}</div>
                <div className="text-xs text-muted leading-tight">{user.handle}</div>
              </div>
            </div>
          ) : null}
        </div>

        {error ? <div className="rounded-xl border border-border/10 bg-surface p-4 text-sm text-muted">{error}</div> : null}

        {tab === 'upload' ? (
          <UploadPanel
            title={uploadTitle}
            description={uploadDesc}
            type={uploadType}
            sourceUrl={uploadSource}
            file={uploadFile}
            creating={creating}
            progress={uploadProgress}
            onTitle={setUploadTitle}
            onDescription={setUploadDesc}
            onType={setUploadType}
            onSourceUrl={setUploadSource}
            onFilesSelect={(files) => setUploadFile(files?.[0] || null)}
            onCreate={createUpload}
            uploadMode={uploadMode}
            onUploadMode={setUploadMode}
            embedCode={embedCode}
            onEmbedCode={setEmbedCode}
            thumbnailFile={thumbnailFile}
            onThumbnailSelect={(f) => setThumbnailFile(f)}
          />
        ) : (
          <VideosPanel loading={loading} items={items} selectedId={selected?.id || null} onSelect={(v) => setSelected(v)} />
        )}

        {selected ? (
          <VideoEditor
            video={selected}
            onClose={() => setSelected(null)}
            onChange={setSelected}
            onSave={saveSelected}
            onPublish={publishSelected}
            onThumbnailUpload={handleThumbnailUpload}
          />
        ) : null}
      </section>
    </div>
  )
}


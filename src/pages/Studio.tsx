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
  const [uploadMode, setUploadMode] = useState<'file' | 'embed'>('file')
  const [uploadSource, setUploadSource] = useState<string>('')
  const [uploadEmbedCode, setUploadEmbedCode] = useState<string>('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadThumbnail, setUploadThumbnail] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
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

  // Helper to generate thumbnail from video file
  const generateThumbnail = async (videoFile: File): Promise<File> => {
      return new Promise((resolve, reject) => {
          const video = document.createElement('video')
          video.preload = 'metadata'
          video.src = URL.createObjectURL(videoFile)
          video.muted = true
          
          video.onloadedmetadata = () => {
              // Seek to 1s or middle if short
              video.currentTime = Math.min(1, video.duration / 2)
          }
          
          video.onseeked = () => {
              const canvas = document.createElement('canvas')
              canvas.width = video.videoWidth
              canvas.height = video.videoHeight
              const ctx = canvas.getContext('2d')
              if (!ctx) {
                  reject(new Error('Could not get canvas context'))
                  return
              }
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
              canvas.toBlob((blob) => {
                  if (blob) {
                      const file = new File([blob], "thumbnail.jpg", { type: "image/jpeg" })
                      resolve(file)
                  } else {
                      reject(new Error('Thumbnail generation failed'))
                  }
                  URL.revokeObjectURL(video.src)
              }, 'image/jpeg', 0.8)
          }
          
          video.onerror = () => {
              URL.revokeObjectURL(video.src)
              reject(new Error('Video load error'))
          }
      })
  }

  async function createUpload() {
    if (!token) return
    if (uploadTitle.trim().length < 3) {
      setError('Title must be at least 3 characters')
      return
    }
    
    if (uploadMode === 'file' && !uploadFile && !uploadSource.trim()) {
      setError('Please select a file or enter a source URL')
      return
    }

    if (uploadMode === 'embed' && !uploadEmbedCode.trim()) {
        setError('Please enter the embed code')
        return
    }

    setError(null)
    setCreating(true)
    setUploadProgress(0)

    try {
      let finalSourceUrl = uploadSource
      let finalThumbnailUrl = undefined
      let finalDuration = 0
      let finalEmbedCode = uploadMode === 'embed' ? uploadEmbedCode : undefined
      
      let thumbnailToUpload = uploadThumbnail
      
      // Auto-generate thumbnail if missing and we have a video file
      if (uploadMode === 'file' && uploadFile && !thumbnailToUpload) {
          try {
              thumbnailToUpload = await generateThumbnail(uploadFile)
          } catch (err) {
              console.warn('Failed to generate thumbnail:', err)
              // Continue without thumbnail
          }
      }

      // Helper to upload a single file to Cloudinary
      const uploadToCloudinary = async (file: File, folder: string, apiKey: string, timestamp: number, signature: string, cloudName: string) => {
         const CHUNK_SIZE = 6 * 1024 * 1024 // 6MB
         const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`

         // Standard upload for small files
         if (file.size <= CHUNK_SIZE) {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('api_key', apiKey)
            formData.append('timestamp', String(timestamp))
            formData.append('signature', signature)
            formData.append('folder', folder)

            return new Promise<any>((resolve, reject) => {
                const xhr = new XMLHttpRequest()
                xhr.open('POST', url)
                
                if (file === uploadFile) {
                   xhr.upload.onprogress = (e) => {
                       if (e.lengthComputable) {
                           setUploadProgress(Math.round((e.loaded / e.total) * 100))
                       }
                   }
                }

                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(JSON.parse(xhr.responseText))
                    } else {
                        reject(new Error(`Cloudinary upload failed: ${xhr.responseText}`))
                    }
                }
                xhr.onerror = () => reject(new Error('Network error during upload'))
                xhr.send(formData)
            })
         }

         // Chunked upload for large files
         const uniqueUploadId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
         const total = file.size
         let start = 0
         let result: any

         while (start < total) {
             const end = Math.min(start + CHUNK_SIZE, total)
             const chunk = file.slice(start, end)
             
             const formData = new FormData()
             formData.append('file', chunk)
             formData.append('api_key', apiKey)
             formData.append('timestamp', String(timestamp))
             formData.append('signature', signature)
             formData.append('folder', folder)
             
             await new Promise((resolve, reject) => {
                 const xhr = new XMLHttpRequest()
                 xhr.open('POST', url)
                 
                 // Content-Range: bytes start-end/total
                 // end is inclusive index (byte pos), so end-1
                 const rangeEnd = end - 1
                 xhr.setRequestHeader('X-Unique-Upload-Id', uniqueUploadId)
                 xhr.setRequestHeader('Content-Range', `bytes ${start}-${rangeEnd}/${total}`)
                 
                 xhr.onload = () => {
                     if (xhr.status >= 200 && xhr.status < 300) {
                         // Cloudinary returns the full response on the last chunk
                         const response = JSON.parse(xhr.responseText)
                         if (end >= total) {
                             result = response
                         }
                         resolve(response)
                     } else {
                         reject(new Error(`Chunk upload failed: ${xhr.responseText}`))
                     }
                 }
                 
                 xhr.onerror = () => reject(new Error('Network error during chunk upload'))
                 
                 if (file === uploadFile) {
                    xhr.upload.onprogress = (e) => {
                        if (e.lengthComputable) {
                            // e.loaded is bytes loaded for *this chunk*
                            // Total loaded = start + e.loaded
                            const totalLoaded = start + e.loaded
                            setUploadProgress(Math.round((totalLoaded / total) * 100))
                        }
                    }
                 }
                 
                 xhr.send(formData)
             })
             
             start = end
         }
         
         return result
      }

      const sigRes = await fetch('/api/studio/upload-signature', {
         headers: { 'Authorization': `Bearer ${token}` }
      })
      const sigData = await sigRes.json()

      if (sigData.mode === 'cloud') {
           // Cloudinary Mode
           
           // 1. Upload Thumbnail if exists
           if (thumbnailToUpload) {
               // We need a separate signature for thumbnail if we want to be strict, but usually same works if logic allows.
               // Actually, the signature is bound to timestamp and folder.
               // We can reuse if we don't change parameters too much, but ideally we should get fresh signature or just reuse parameters.
               // Our backend signs { timestamp, folder }.
               // So we can reuse.
               const thumbResp = await uploadToCloudinary(thumbnailToUpload, sigData.folder, sigData.apiKey, sigData.timestamp, sigData.signature, sigData.cloudName)
               finalThumbnailUrl = thumbResp.secure_url
           }

           // 2. Upload Video if exists
          if (uploadMode === 'file' && uploadFile) {
              const vidResp = await uploadToCloudinary(uploadFile, sigData.folder, sigData.apiKey, sigData.timestamp, sigData.signature, sigData.cloudName)
              finalSourceUrl = vidResp.secure_url
              finalDuration = vidResp.duration || 0
              
              // If no custom thumbnail, try to use video thumbnail
              if (!finalThumbnailUrl) {
                  if (vidResp.resource_type === 'video' || finalSourceUrl.match(/\.(mp4|mov|avi|webm|mkv)$/i)) {
                      finalThumbnailUrl = finalSourceUrl.replace(/\.[^/.]+$/, ".jpg")
                  } else {
                      finalThumbnailUrl = finalSourceUrl
                  }
              }
          }
      } else {
          // Local Mode
          // We use the single endpoint for both now (multipart)
          const t = window.setInterval(() => {
              setUploadProgress((p) => Math.min(95, p + Math.random() * 14))
          }, 180)
          
          try {
               const formData = new FormData()
               if (uploadMode === 'file' && uploadFile) {
                   formData.append('file', uploadFile)
               }
               if (thumbnailToUpload) {
                   formData.append('thumbnail', thumbnailToUpload)
               }
               
               const res = await fetch('/api/studio/upload', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`
                },
                body: formData
              })
              const data = await res.json()
              if (!data.success) throw new Error(data.error || 'Upload failed')
              
              if (uploadMode === 'file' && uploadFile) {
                  finalSourceUrl = data.url
                  finalDuration = data.duration || 0
              }
              if (data.thumbnailUrl) {
                  finalThumbnailUrl = data.thumbnailUrl
              }
          } finally {
              window.clearInterval(t)
          }
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
          embedCode: finalEmbedCode
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
      setUploadThumbnail(null)
      setUploadEmbedCode('')
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
            onFileSelect={setUploadFile}
            onCreate={createUpload}
            
            // New Props
            uploadMode={uploadMode}
            onUploadMode={setUploadMode}
            embedCode={uploadEmbedCode}
            onEmbedCode={setUploadEmbedCode}
            thumbnailFile={uploadThumbnail}
            onThumbnailSelect={setUploadThumbnail}
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


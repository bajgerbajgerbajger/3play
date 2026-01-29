import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import { Trash2, ExternalLink, ChevronLeft, ChevronRight, Video as VideoIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Link } from 'react-router-dom'

type Video = {
  id: string
  title: string
  userId: string
  views: number
  likes: number
  createdAt: string
  thumbnailUrl?: string
}

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchVideos = async () => {
    setLoading(true)
    try {
      const data = await apiFetch<{ 
        success: true; 
        videos: Video[]; 
        pagination: { total: number; pages: number } 
      }>(`/api/admin/videos?page=${page}`)
      setVideos(data.videos)
      setTotalPages(data.pagination.pages)
    } catch (error) {
      console.error('Failed to fetch videos', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVideos()
  }, [page])

  const deleteVideo = async (video: Video) => {
    if (!confirm(`Are you sure you want to PERMANENTLY delete "${video.title}"? This cannot be undone.`)) return
    
    try {
      await apiFetch(`/api/admin/videos/${video.id}`, { method: 'DELETE' })
      setVideos(videos.filter(v => v.id !== video.id))
    } catch (error) {
      console.error('Failed to delete video', error)
      alert('Delete failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Video Management</h1>
      </div>

      <div className="bg-[#0f0f11] border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-gray-400 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Video</th>
                <th className="px-6 py-4">Views</th>
                <th className="px-6 py-4">Likes</th>
                <th className="px-6 py-4">Uploaded</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading videos...</td></tr>
              ) : videos.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No videos found.</td></tr>
              ) : (
                videos.map(video => (
                  <tr key={video.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-24 aspect-video bg-gray-800 rounded-md overflow-hidden flex-shrink-0 relative">
                          {video.thumbnailUrl ? (
                            <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-600">
                              <VideoIcon size={20} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-white truncate max-w-[200px]">{video.title}</div>
                          <div className="text-xs text-gray-500 font-mono">ID: {video.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {video.views.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {video.likes.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {new Date(video.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a 
                          href={`/watch/${video.id}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-md"
                          title="View on site"
                        >
                          <ExternalLink size={16} />
                        </a>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="text-red-500 hover:bg-red-500/10 hover:text-red-400"
                          onClick={() => deleteVideo(video)}
                          title="Delete Video"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-white/5 flex items-center justify-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              <ChevronLeft size={16} />
            </Button>
            <span className="text-sm text-gray-400">Page {page} of {totalPages}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

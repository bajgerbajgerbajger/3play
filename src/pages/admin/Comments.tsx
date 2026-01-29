import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import { Trash2, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'

type Comment = {
  id: string
  content: string
  userId: string
  videoId: string
  createdAt: string
}

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchComments = async () => {
    setLoading(true)
    try {
      const data = await apiFetch<{ 
        success: true; 
        comments: Comment[]; 
        pagination: { total: number; pages: number } 
      }>(`/api/admin/comments?page=${page}`)
      setComments(data.comments)
      setTotalPages(data.pagination.pages)
    } catch (error) {
      console.error('Failed to fetch comments', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [page])

  const deleteComment = async (comment: Comment) => {
    if (!confirm('Are you sure you want to delete this comment?')) return
    
    try {
      await apiFetch(`/api/admin/comments/${comment.id}`, { method: 'DELETE' })
      setComments(comments.filter(c => c.id !== comment.id))
    } catch (error) {
      console.error('Failed to delete comment', error)
      alert('Delete failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Comment Management</h1>
      </div>

      <div className="bg-[#0f0f11] border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-gray-400 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Content</th>
                <th className="px-6 py-4">Context</th>
                <th className="px-6 py-4">Posted</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Loading comments...</td></tr>
              ) : comments.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No comments found.</td></tr>
              ) : (
                comments.map(comment => (
                  <tr key={comment.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 max-w-md">
                      <div className="flex items-start gap-3">
                        <MessageSquare size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
                        <span className="text-white line-clamp-2">{comment.content}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                      <div>User: {comment.userId}</div>
                      <div>Video: {comment.videoId}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="text-red-500 hover:bg-red-500/10 hover:text-red-400"
                        onClick={() => deleteComment(comment)}
                      >
                        <Trash2 size={16} />
                      </Button>
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

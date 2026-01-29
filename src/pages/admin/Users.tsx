import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import { Search, Ban, CheckCircle, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'

type User = {
  id: string
  displayName: string
  email: string
  handle: string
  role: 'user' | 'admin'
  isBlocked: boolean
  createdAt: string
  avatarUrl?: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const data = await apiFetch<{ 
        success: true; 
        users: User[]; 
        pagination: { total: number; pages: number } 
      }>(`/api/admin/users?page=${page}&q=${encodeURIComponent(search)}`)
      setUsers(data.users)
      setTotalPages(data.pagination.pages)
    } catch (error) {
      console.error('Failed to fetch users', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers()
    }, 500)
    return () => clearTimeout(timer)
  }, [page, search])

  const toggleBlock = async (user: User) => {
    if (!confirm(`Are you sure you want to ${user.isBlocked ? 'unblock' : 'block'} ${user.displayName}?`)) return
    
    try {
      await apiFetch(`/api/admin/users/${user.id}/${user.isBlocked ? 'unblock' : 'block'}`, {
        method: 'POST'
      })
      // Optimistic update
      setUsers(users.map(u => u.id === user.id ? { ...u, isBlocked: !u.isBlocked } : u))
    } catch (error) {
      console.error('Failed to toggle block status', error)
      alert('Action failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">User Management</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#0f0f11] border border-white/5 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-white/20 w-full md:w-64"
          />
        </div>
      </div>

      <div className="bg-[#0f0f11] border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-gray-400 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading users...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No users found.</td></tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden flex-shrink-0">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xs">
                              {user.displayName[0]}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-white">{user.displayName}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-red-500/20 text-red-500' 
                          : 'bg-blue-500/20 text-blue-500'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.isBlocked ? (
                        <span className="flex items-center gap-1.5 text-red-500 text-xs font-medium">
                          <Ban size={14} /> Blocked
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-green-500 text-xs font-medium">
                          <CheckCircle size={14} /> Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.role !== 'admin' && (
                        <Button 
                          size="sm" 
                          variant={user.isBlocked ? "default" : "secondary"}
                          className={user.isBlocked ? "bg-green-600 hover:bg-green-700" : "bg-red-500/10 text-red-500 hover:bg-red-500/20"}
                          onClick={() => toggleBlock(user)}
                        >
                          {user.isBlocked ? 'Unblock' : 'Block'}
                        </Button>
                      )}
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

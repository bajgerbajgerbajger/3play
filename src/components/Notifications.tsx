import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { Link } from 'react-router-dom'
import { apiFetch } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { IconButton } from '@/components/ui/IconButton'
import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'

type Notification = {
  id: string
  actorName?: string
  actorAvatarUrl?: string
  actorGender?: 'male' | 'female' | 'other'
  type: 'comment' | 'reply' | 'like' | 'subscribe' | 'system'
  title: string
  message?: string
  link?: string
  isRead: boolean
  createdAt: string
}

type NotificationsResponse = {
  items: Notification[]
  unreadCount: number
}

export function Notifications() {
  const { token, user } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const [items, setItems] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchNotifications = async () => {
    if (!token) return
    try {
      const res = await apiFetch<NotificationsResponse>('/api/notifications', { token, skipLoadingBar: true })
      if (res) {
        setItems(res.items)
        setUnreadCount(res.unreadCount || 0)
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if (user) {
        fetchNotifications()
        const interval = setInterval(fetchNotifications, 30000)
        return () => clearInterval(interval)
    }
  }, [user, token])

  const markAllRead = async () => {
    if (!token) return
    try {
      await apiFetch('/api/notifications/mark-all-read', { 
        method: 'POST',
        token,
        skipLoadingBar: true
      })
      setItems(items.map(i => ({ ...i, isRead: true })))
      setUnreadCount(0)
    } catch (e) {
      console.error(e)
    }
  }

  const handleOpen = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
        fetchNotifications()
    }
  }

  if (!user) return null

  return (
    <div className="relative">
      <IconButton aria-label="Notifications" onClick={handleOpen} className="relative">
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
        )}
      </IconButton>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 rounded-xl border border-border/10 bg-surface shadow-soft z-50 max-h-[400px] overflow-y-auto flex flex-col">
            <div className="p-3 border-b border-border/10 flex justify-between items-center sticky top-0 bg-surface z-10">
              <h3 className="font-semibold text-sm">Notifikace</h3>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-primary hover:underline">
                  Označit vše jako přečtené
                </button>
              )}
            </div>
            
            <div className="flex flex-col">
              {items.length === 0 ? (
                <div className="p-4 text-center text-muted text-sm">
                  Žádné notifikace
                </div>
              ) : (
                items.map(item => (
                  <Link 
                    key={item.id} 
                    to={item.link || '#'} 
                    onClick={() => {
                        setIsOpen(false);
                        if (!item.isRead && token) {
                            apiFetch(`/api/notifications/${item.id}/read`, { method: 'PATCH', token, skipLoadingBar: true }).catch(console.error)
                            setUnreadCount(Math.max(0, unreadCount - 1))
                            setItems(prev => prev.map(i => i.id === item.id ? { ...i, isRead: true } : i))
                        }
                    }}
                    className={cn(
                        "p-3 hover:bg-white/5 transition-colors border-b border-border/5 last:border-0 flex gap-3",
                        !item.isRead && "bg-primary/5"
                    )}
                  >
                    <Avatar 
                      src={item.actorAvatarUrl} 
                      alt={item.actorName || ''} 
                      gender={item.actorGender}
                      className="w-8 h-8 mt-1"
                      size="custom"
                    />
                    <div className="flex-1">
                        <div className="text-sm font-medium leading-none mb-1">{item.title}</div>
                        <div className="text-xs text-muted line-clamp-2">{item.message}</div>
                        <div className="text-[10px] text-muted mt-1 opacity-70">
                            {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                    {!item.isRead && (
                        <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    )}
                  </Link>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

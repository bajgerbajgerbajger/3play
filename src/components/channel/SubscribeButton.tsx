import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/auth'
import { useModalStore } from '@/store/modal'
import { apiFetch } from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import { BellRing } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SubscribeButtonProps {
  channelId: string
  initialCount: number
  onToggle?: (newCount: number, subscribed: boolean) => void
  className?: string
  showCount?: boolean
}

export function SubscribeButton({ 
  channelId, 
  initialCount, 
  onToggle, 
  className,
  showCount = true 
}: SubscribeButtonProps) {
  const { user, token } = useAuthStore()
  const { openChannelCreation } = useModalStore()
  const [subscribed, setSubscribed] = useState(false)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  // Sync internal count with prop if it changes drastically (revalidation)
  // But usually we trust our local state after interaction
  useEffect(() => {
    setCount(initialCount)
  }, [initialCount])

  useEffect(() => {
    if (user && channelId && token) {
      apiFetch<{ subscribed: boolean }>(`/api/subscriptions/status/${channelId}`, { token })
        .then(res => setSubscribed(res.subscribed))
        .catch(console.error)
    }
  }, [user, channelId, token])

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation if inside a link
    e.stopPropagation()

    if (!user || !token) {
      window.location.href = '/auth'
      return
    }

    // Require channel to subscribe
    if (!user.channelId) {
      openChannelCreation('subscribe')
      return
    }

    if (user.id === channelId) return // Cannot subscribe to self (backend also checks)

    setLoading(true)
    try {
      const res = await apiFetch<{ subscribed: boolean, count: number }>('/api/subscriptions/toggle', {
        method: 'POST',
        token,
        body: JSON.stringify({ channelId })
      })
      setSubscribed(res.subscribed)
      setCount(res.count)
      onToggle?.(res.count, res.subscribed)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Don't show button for own channel
  if (user?.id === channelId) return null

  return (
    <div className={cn("flex items-center gap-4", className)}>
       {showCount && (
         <div className="flex flex-col items-end hidden sm:flex">
            <AnimatedCounter value={count} />
            <span className="text-xs text-muted">odběratelů</span>
         </div>
       )}
       <Button 
         variant={subscribed ? "secondary" : "primary"}
         onClick={handleToggle}
         disabled={loading}
         className={cn(
           "min-w-[100px] transition-all duration-300",
           subscribed && "bg-surface border-border/10 hover:bg-white/10"
         )}
       >
         {subscribed ? (
           <>
             <BellRing size={16} className="mr-2 animate-pulse text-primary" />
             <span>Odebíráno</span>
           </>
         ) : (
           "Odebírat"
         )}
       </Button>
    </div>
  )
}

function AnimatedCounter({ value }: { value: number }) {
  return (
    <div className="relative h-6 min-w-[20px] overflow-hidden text-lg font-bold flex justify-end">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={value}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {new Intl.NumberFormat('cs-CZ', { notation: "compact", maximumFractionDigits: 1 }).format(value)}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

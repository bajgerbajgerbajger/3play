import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { VideoCard, type VideoListItem } from '@/components/video/VideoCard'
import { Skeleton } from '@/components/ui/Skeleton'
import { Input } from '@/components/ui/Input'
import { apiFetch } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Search, Video } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { useModalStore } from '@/store/modal'

type Sort = 'latest' | 'popular' | 'subscriptions'

export default function Home() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') || ''
  const sort = (params.get('sort') as Sort) || 'latest'
  const isWelcome = params.get('welcome') === 'true'

  const { user, token } = useAuthStore()
  const { openChannelCreation } = useModalStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<VideoListItem[]>([])

  // Check for channel on welcome
  useEffect(() => {
    if (!isWelcome || !user || !token) return

    apiFetch('/api/channels/me/channel', { token })
      .then(() => {
        setParams((prev) => {
          const next = new URLSearchParams(prev)
          next.delete('welcome')
          return next
        })
      })
      .catch(() => {
        openChannelCreation('welcome')
      })
  }, [isWelcome, user, token, setParams, openChannelCreation])

  const title = useMemo(() => {
    if (q.trim()) return `Results for “${q.trim()}”`
    return sort === 'popular' ? 'Trending now' : 'Recommended'
  }, [q, sort])

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)
    apiFetch<{ success: true; items: VideoListItem[] }>(`/api/videos?q=${encodeURIComponent(q)}&sort=${encodeURIComponent(sort)}&limit=24`)
      .then((d) => {
        if (!alive) return
        setItems(d.items)
      })
      .catch((e: unknown) => {
        if (!alive) return
        setError(e instanceof Error ? e.message : 'Failed to load')
      })
      .finally(() => {
        if (!alive) return
        setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [q, sort])

  return (
    <div className="space-y-6 animate-fadeUp">
      <Helmet>
        <title>{q.trim() ? `${q.trim()} - 3Play` : '3Play - Creator-first Video Platform'}</title>
        <meta name="description" content="3Play is a creator-first, high-performance video platform. Watch, share, and upload videos with ease." />
      </Helmet>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-heading text-xl font-bold tracking-tight">{title}</h1>
          <div className="text-sm text-muted">Rychlá, čistá, tvůrčí video platforma.</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className={cn(
              'h-9 rounded-[10px] border border-border/10 px-3 text-sm font-semibold transition',
              sort === 'latest' ? 'bg-white/5 text-text' : 'bg-surface text-muted hover:text-text hover:bg-surface2',
            )}
            onClick={() => {
              params.set('sort', 'latest')
              setParams(params)
            }}
          >
            Nejnovější
          </button>
          <button
            className={cn(
              'h-9 rounded-[10px] border border-border/10 px-3 text-sm font-semibold transition',
              sort === 'popular' ? 'bg-white/5 text-text' : 'bg-surface text-muted hover:text-text hover:bg-surface2',
            )}
            onClick={() => {
              params.set('sort', 'popular')
              setParams(params)
            }}
          >
            Populární
          </button>
          <button
            className={cn(
              'h-9 rounded-[10px] border border-border/10 px-3 text-sm font-semibold transition',
              sort === 'subscriptions' ? 'bg-white/5 text-text' : 'bg-surface text-muted hover:text-text hover:bg-surface2',
            )}
            onClick={() => {
              params.set('sort', 'subscriptions')
              setParams(params)
            }}
          >
            Odebírané
          </button>
        </div>
      </div>

      <div className="md:hidden">
        <div className="relative">
          <Input
            aria-label="Search"
            placeholder="Hledat videa a kanály"
            className="pl-9"
            defaultValue={q}
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return
              const next = (e.currentTarget.value || '').trim()
              if (next) {
                params.set('q', next)
              } else {
                params.delete('q')
              }
              setParams(params)
            }}
          />
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-border/10 bg-surface p-4">
          <div className="text-sm font-semibold">Nelze načíst videa</div>
          <div className="mt-1 text-sm text-muted">{error}</div>
        </div>
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <div className="col-span-full py-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface2 text-muted">
            <Video size={32} />
          </div>
          {sort === 'subscriptions' && !user ? (
             <>
                <h3 className="text-lg font-semibold">Přihlaste se</h3>
                <p className="text-muted">Pro zobrazení odebíraných videí se musíte přihlásit.</p>
             </>
          ) : sort === 'subscriptions' ? (
             <>
                <h3 className="text-lg font-semibold">Žádná videa</h3>
                <p className="text-muted">Zatím neodebíráte žádné kanály s videi.</p>
             </>
          ) : (
            <>
               <h3 className="text-lg font-semibold">Žádná videa</h3>
               <p className="text-muted">Zatím tu nic není. Buď první a nahraj video!</p>
            </>
          )}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border/10 bg-surface overflow-hidden">
                <Skeleton className="aspect-video w-full rounded-none" />
                <div className="p-3">
                  <div className="flex gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-4/5" />
                      <Skeleton className="h-3 w-2/5" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          : items.map((v, i) => <VideoCard key={`${v.id}-${i}`} video={v} />)}
      </div>
    </div>
  )
}

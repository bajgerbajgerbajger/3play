import React, { useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { VideoCard, type VideoListItem } from '@/components/video/VideoCard'
import { Skeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import { apiFetch } from '@/lib/api'
import { useAuthStore } from '@/store/auth'

export default function Subscriptions() {
  const { user, token } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<VideoListItem[]>([])
  const [limit, setLimit] = useState(24)

  const title = useMemo(() => {
    return 'Odebírané'
  }, [])

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)
    apiFetch<{ success: true; items: VideoListItem[] }>(`/api/videos?sort=subscriptions&limit=${limit}`, token ? { token } : undefined)
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
  }, [limit, token])

  return (
    <div className="space-y-6 animate-fadeUp">
      <Helmet>
        <title>Odebírané - 3Play</title>
        <meta name="description" content="Videa z kanálů, které odebíráte." />
      </Helmet>

      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-heading text-xl font-bold tracking-tight">{title}</h1>
          <div className="text-sm text-muted">Osobní feed z vašich odběrů.</div>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-border/10 bg-surface p-4">
          <div className="text-sm font-semibold">Nelze načíst videa</div>
          <div className="mt-1 text-sm text-muted">{error}</div>
        </div>
      ) : null}

      {!user ? (
        <div className="col-span-full py-12 text-center">
          <h3 className="text-lg font-semibold">Přihlaste se</h3>
          <p className="text-muted">Pro zobrazení odebíraných videí se musíte přihlásit.</p>
        </div>
      ) : !loading && !error && items.length === 0 ? (
        <div className="col-span-full py-12 text-center">
          <h3 className="text-lg font-semibold">Žádná videa</h3>
          <p className="text-muted">Zatím neodebíráte žádné kanály s videi.</p>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 12 }).map((_, i) => (
              <React.Fragment key={i}>
                <div className="rounded-xl border border-border/10 bg-surface overflow-hidden">
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
              </React.Fragment>
            ))
          : items.map((v, i) => <VideoCard key={`${v.id}-${i}`} video={v as VideoListItem} />)}
      </div>

      {user && !loading && items.length > 0 ? (
        <div className="flex justify-center">
          <Button variant="secondary" onClick={() => setLimit((l) => l + 24)}>
            Načíst více
          </Button>
        </div>
      ) : null}
    </div>
  )
}

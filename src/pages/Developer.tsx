import { useState, useEffect } from 'react'
import { Terminal, Code, Cpu, Shield, Database, Activity, Lock, Globe } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { apiFetch } from '@/lib/api'

export default function Developer() {
  const [status, setStatus] = useState<'online' | 'offline' | 'maintenance'>('online')
  const [latency, setLatency] = useState(0)

  useEffect(() => {
    const start = Date.now()
    fetch('/api/health')
      .then(() => setLatency(Date.now() - start))
      .catch(() => setStatus('offline'))
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-green-500 font-mono selection:bg-green-500/30">
      {/* Top Bar */}
      <div className="border-b border-green-500/20 bg-black/50 p-4 flex justify-between items-center backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Terminal size={20} />
          <span className="font-bold tracking-wider">3PLAY_DEV_PORTAL_V1.0</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            SYSTEM_{status.toUpperCase()}
          </div>
          <div>LATENCY: {latency}ms</div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8 grid gap-8 md:grid-cols-12">
        {/* Sidebar */}
        <div className="md:col-span-3 space-y-4">
          <div className="border border-green-500/20 bg-black/40 p-4 rounded-lg">
            <h3 className="text-sm font-bold mb-4 border-b border-green-500/20 pb-2 flex items-center gap-2">
              <Activity size={16} /> SYSTEM_METRICS
            </h3>
            <div className="space-y-2 text-xs opacity-80">
              <div className="flex justify-between">
                <span>UPTIME</span>
                <span>99.99%</span>
              </div>
              <div className="flex justify-between">
                <span>REQ/SEC</span>
                <span>1,240</span>
              </div>
              <div className="flex justify-between">
                <span>MEMORY</span>
                <span>42%</span>
              </div>
            </div>
          </div>

          <div className="border border-green-500/20 bg-black/40 p-4 rounded-lg">
            <h3 className="text-sm font-bold mb-4 border-b border-green-500/20 pb-2 flex items-center gap-2">
              <Shield size={16} /> SECURITY_LEVEL
            </h3>
            <div className="text-center py-4">
              <div className="text-4xl font-bold mb-2">A+</div>
              <div className="text-xs opacity-60">ALL SYSTEMS SECURE</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-9 space-y-8">
          {/* Hero Section */}
          <div className="border border-green-500/20 bg-black/40 p-8 rounded-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Code size={120} />
            </div>
            <h1 className="text-4xl font-bold mb-4">DEVELOPER RESOURCES</h1>
            <p className="text-green-500/60 max-w-2xl mb-6">
              Access the core architecture, API documentation, and system tools for the 3Play platform.
              Authorized personnel only.
            </p>
            <div className="flex gap-4">
              <Button variant="ghost" className="border border-green-500 text-green-500 hover:bg-green-500 hover:text-black">
                VIEW API DOCS
              </Button>
              <Button variant="ghost" className="text-green-500 hover:bg-green-500/10">
                SYSTEM STATUS
              </Button>
            </div>
          </div>

          {/* Tools Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-green-500/20 bg-black/40 p-6 rounded-lg hover:bg-green-500/5 transition-colors cursor-pointer">
              <Database className="mb-4 text-green-500" size={32} />
              <h3 className="text-xl font-bold mb-2">Database Schema</h3>
              <p className="text-sm text-green-500/60">
                Inspect MongoDB collections, indexes, and aggregation pipelines.
              </p>
            </div>

            <div className="border border-green-500/20 bg-black/40 p-6 rounded-lg hover:bg-green-500/5 transition-colors cursor-pointer">
              <Cpu className="mb-4 text-green-500" size={32} />
              <h3 className="text-xl font-bold mb-2">Render Engine</h3>
              <p className="text-sm text-green-500/60">
                Monitor video transcoding jobs and CDN distribution nodes.
              </p>
            </div>

            <div className="border border-green-500/20 bg-black/40 p-6 rounded-lg hover:bg-green-500/5 transition-colors cursor-pointer">
              <Lock className="mb-4 text-green-500" size={32} />
              <h3 className="text-xl font-bold mb-2">Auth & Tokens</h3>
              <p className="text-sm text-green-500/60">
                Debug JWT claims, session validity, and OAuth2 integrations.
              </p>
            </div>

            <div className="border border-green-500/20 bg-black/40 p-6 rounded-lg hover:bg-green-500/5 transition-colors cursor-pointer">
              <Globe className="mb-4 text-green-500" size={32} />
              <h3 className="text-xl font-bold mb-2">Webhooks</h3>
              <p className="text-sm text-green-500/60">
                Configure event listeners and outbound webhooks for third-party integrations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

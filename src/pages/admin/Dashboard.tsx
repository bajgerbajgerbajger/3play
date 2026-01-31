import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import { Users, Video, MessageSquare, TrendingUp, UserPlus } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'

type Stats = {
  totalUsers: number
  totalVideos: number
  totalComments: number
}

type RecentUser = {
  id: string
  displayName: string
  email: string
  createdAt: string
  avatarUrl?: string
  gender?: 'male' | 'female' | 'other'
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiFetch<{ 
          success: true; 
          stats: Stats; 
          recentUsers: RecentUser[] 
        }>('/api/admin/stats')
        setStats(data.stats)
        setRecentUsers(data.recentUsers)
      } catch (error) {
        console.error('Failed to fetch stats', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return <div className="text-gray-400">Loading dashboard data...</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">System Overview</h1>
        <p className="text-gray-400">Real-time platform metrics and activity.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Users" 
          value={stats?.totalUsers || 0} 
          icon={Users} 
          color="text-blue-500" 
          bg="bg-blue-500/10" 
        />
        <StatCard 
          title="Total Videos" 
          value={stats?.totalVideos || 0} 
          icon={Video} 
          color="text-purple-500" 
          bg="bg-purple-500/10" 
        />
        <StatCard 
          title="Total Comments" 
          value={stats?.totalComments || 0} 
          icon={MessageSquare} 
          color="text-emerald-500" 
          bg="bg-emerald-500/10" 
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registrations */}
        <div className="bg-[#0f0f11] border border-white/5 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <UserPlus size={20} className="text-blue-500" />
              Recent Registrations
            </h2>
            <span className="text-xs text-gray-500">Last 5 users</span>
          </div>
          <div className="space-y-4">
            {recentUsers.map(user => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
                    <Avatar 
                      src={user.avatarUrl} 
                      alt={user.displayName} 
                      gender={user.gender}
                      className="w-full h-full"
                      size="custom"
                    />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{user.displayName}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
            {recentUsers.length === 0 && (
              <div className="text-center text-gray-500 py-4">No recent users found.</div>
            )}
          </div>
        </div>

        {/* System Health (Mock) */}
        <div className="bg-[#0f0f11] border border-white/5 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp size={20} className="text-green-500" />
              System Health
            </h2>
            <span className="text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded-full">Operational</span>
          </div>
          <div className="space-y-6">
            <HealthMetric label="API Latency" value="24ms" status="good" />
            <HealthMetric label="Database Load" value="12%" status="good" />
            <HealthMetric label="Storage Usage" value="45%" status="warning" />
            <HealthMetric label="Memory Usage" value="340MB" status="good" />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color, bg }: any) {
  return (
    <div className="bg-[#0f0f11] border border-white/5 rounded-xl p-6 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${bg} ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <div className="text-gray-400 text-sm">{title}</div>
        <div className="text-2xl font-bold text-white">{value.toLocaleString()}</div>
      </div>
    </div>
  )
}

function HealthMetric({ label, value, status }: any) {
  const statusColor = {
    good: 'bg-green-500',
    warning: 'bg-yellow-500',
    critical: 'bg-red-500',
  }[status as string] || 'bg-gray-500'

  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-400 text-sm">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-white font-mono text-sm">{value}</span>
        <div className={`w-2 h-2 rounded-full ${statusColor}`} />
      </div>
    </div>
  )
}

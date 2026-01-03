'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  FileText, 
  Calendar, 
  TrendingUp,
  Activity
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import AdminLayout from '@/components/admin/AdminLayout'

interface DashboardStats {
  totalMembers: number
  pendingApplications: number
  upcomingEvents: number
  raidProgress: string
}

interface ActivityLog {
  id: string
  action: string
  description: string
  user: string | null
  created_at: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    pendingApplications: 0,
    upcomingEvents: 0,
    raidProgress: '0/0'
  })
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Load stats
      const [membersRes, applicationsRes, eventsRes, raidsRes] = await Promise.all([
        fetch('/api/members'),
        fetch('/api/applications'),
        fetch('/api/events'),
        fetch('/api/raids')
      ])

      const [members, applications, events, raids] = await Promise.all([
        membersRes.json(),
        applicationsRes.json(),
        eventsRes.json(),
        raidsRes.json()
      ])

      // Calculate stats
      const totalMembers = members.members?.filter((m: any) => m.status === 'active').length || 0
      const pendingApplications = applications.applications?.filter((app: any) => app.status === 'pending').length || 0
      const upcomingEvents = events.events?.length || 0
      
      let raidProgress = '0/0'
      if (raids.raids && raids.raids.length > 0) {
        const currentRaid = raids.raids[0]
        const killedBosses = currentRaid.bosses?.filter((boss: any) => boss.status === 'killed').length || 0
        const totalBosses = currentRaid.bosses?.length || 0
        raidProgress = `${killedBosses}/${totalBosses}`
      }

      setStats({
        totalMembers,
        pendingApplications,
        upcomingEvents,
        raidProgress
      })

      // Mock recent activity for now
      setRecentActivity([
        {
          id: '1',
          action: 'application_submitted',
          description: 'New application from: TestPlayer',
          user: null,
          created_at: new Date().toISOString()
        }
      ])

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <AdminLayout currentPage="dashboard">
        <div className="p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout currentPage="dashboard">
      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-blue-900/30 rounded-lg">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Total Members</p>
                <p className="text-2xl font-bold text-white">{stats.totalMembers}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-900/30 rounded-lg">
                <FileText className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Pending Applications</p>
                <p className="text-2xl font-bold text-white">{stats.pendingApplications}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-green-900/30 rounded-lg">
                <Calendar className="w-6 h-6 text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Upcoming Events</p>
                <p className="text-2xl font-bold text-white">{stats.upcomingEvents}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-red-900/30 rounded-lg">
                <TrendingUp className="w-6 h-6 text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Raid Progress</p>
                <p className="text-2xl font-bold text-white">{stats.raidProgress}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-700">
            <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <a href="/admin/members">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center border-gray-600 text-gray-300 hover:bg-gray-700 w-full">
                  <Users className="w-6 h-6 mb-2" />
                  <span className="text-sm">Manage Members</span>
                </Button>
              </a>
              <a href="/admin/applications">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center border-gray-600 text-gray-300 hover:bg-gray-700 w-full">
                  <FileText className="w-6 h-6 mb-2" />
                  <span className="text-sm">Review Applications</span>
                </Button>
              </a>
              <a href="/admin/events">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center border-gray-600 text-gray-300 hover:bg-gray-700 w-full">
                  <Calendar className="w-6 h-6 mb-2" />
                  <span className="text-sm">Manage Events</span>
                </Button>
              </a>
              <a href="/admin/raids">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center border-gray-600 text-gray-300 hover:bg-gray-700 w-full">
                  <TrendingUp className="w-6 h-6 mb-2" />
                  <span className="text-sm">Update Progress</span>
                </Button>
              </a>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-white">{activity.description}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(activity.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

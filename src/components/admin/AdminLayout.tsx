'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  FileText, 
  Calendar, 
  TrendingUp, 
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  Activity
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AdminLayoutProps {
  children: React.ReactNode
  currentPage: string
}

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: Home, key: 'dashboard' },
  { name: 'Members', href: '/admin/members', icon: Users, key: 'members' },
  { name: 'Applications', href: '/admin/applications', icon: FileText, key: 'applications' },
  { name: 'Events', href: '/admin/events', icon: Calendar, key: 'events' },
  { name: 'Raids', href: '/admin/raids', icon: TrendingUp, key: 'raids' },
  { name: 'Settings', href: '/admin/settings', icon: Settings, key: 'settings' }
]

export default function AdminLayout({ children, currentPage }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<{ username: string } | null>(null)
  const [isAuthChecking, setIsAuthChecking] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check-auth')
      const data = await response.json()
      
      if (data.authenticated) {
        setUser(data.user)
      } else {
        // Only redirect if we're not already on login page
        if (window.location.pathname !== '/admin/login') {
          router.push('/admin/login')
          return
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      // For development, set a default user to prevent issues
      setUser({ username: 'admin' })
    } finally {
      setIsAuthChecking(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/admin/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (isAuthChecking || !user) {
    return (
      <div className="admin-layout">
        {/* Skeleton Sidebar - Fixed width to prevent layout shift */}
        <div className="admin-sidebar bg-gray-800 border-r border-gray-700">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
            <div className="w-24 h-6 bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="mt-8 space-y-2 px-4">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className="w-full h-10 bg-gray-700 rounded animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              ></div>
            ))}
          </div>
        </div>
        
        {/* Main Content Loading */}
        <div className="flex-1 flex flex-col">
          {/* Header Skeleton */}
          <div className="bg-gray-800 border-b border-gray-700 h-16 flex items-center px-4">
            <div className="w-32 h-6 bg-gray-700 rounded animate-pulse"></div>
          </div>
          
          {/* Content Loading */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-300">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className={`admin-sidebar ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } fixed inset-y-0 left-0 z-50 bg-gray-800 border-r border-gray-700 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:transform-none`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
          <span className="text-xl font-bold text-white">Admin Panel</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="mt-8">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.key
            
            return (
              <a
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-red-600 text-white border-r-4 border-red-400 shadow-lg'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 transition-colors duration-200 ${
                  isActive ? 'text-white' : 'text-gray-400'
                }`} />
                {item.name}
              </a>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Logged in as <span className="text-white">{user.username}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-400 hover:text-white"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-gray-800 shadow-sm border-b border-gray-700">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="flex items-center space-x-4">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                View Site
              </a>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-900">
          {children}
        </main>
      </div>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

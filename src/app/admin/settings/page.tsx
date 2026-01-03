'use client'

import { useState, useEffect } from 'react'
import { Save, Settings, Server, Users, Clock, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import AdminLayout from '@/components/admin/AdminLayout'

interface GuildSettings {
  guild_name: string
  server_name: string
  guild_description: string
  raid_times: string
  discord_invite: string
  recruitment_status: string
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<GuildSettings>({
    guild_name: '',
    server_name: '',
    guild_description: '',
    raid_times: '',
    discord_invite: '',
    recruitment_status: 'open'
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        if (data.settings) {
          setSettings(prev => ({ ...prev, ...data.settings }))
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        setLastSaved(new Date())
        alert('Settings saved successfully!')
      } else {
        const error = await response.json()
        alert(error.error || 'Error saving settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Error saving settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setSettings(prev => ({ ...prev, [name]: value }))
  }

  if (isLoading) {
    return (
      <AdminLayout currentPage="settings">
        <div className="p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading settings...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout currentPage="settings">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Guild Settings</h1>
          {lastSaved && (
            <div className="text-sm text-gray-400">
              Last saved: {lastSaved.toLocaleTimeString()}
            </div>
          )}
        </div>

        <form onSubmit={handleSave} className="max-w-4xl space-y-8">
          {/* Basic Guild Information */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center mb-6">
              <Users className="w-6 h-6 text-red-400 mr-3" />
              <h2 className="text-xl font-semibold text-white">Basic Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Guild Name *
                </label>
                <input
                  type="text"
                  name="guild_name"
                  value={settings.guild_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Server Name *
                </label>
                <input
                  type="text"
                  name="server_name"
                  value={settings.server_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Guild Description *
              </label>
              <textarea
                name="guild_description"
                value={settings.guild_description}
                onChange={handleInputChange}
                rows={3}
                required
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Raid Information */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center mb-6">
              <Clock className="w-6 h-6 text-red-400 mr-3" />
              <h2 className="text-xl font-semibold text-white">Raid Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Raid Times *
                </label>
                <input
                  type="text"
                  name="raid_times"
                  value={settings.raid_times}
                  onChange={handleInputChange}
                  placeholder="z.B. Mittwoch & Sonntag, 20:00-23:00 Uhr"
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Recruitment Status
                </label>
                <select
                  name="recruitment_status"
                  value={settings.recruitment_status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                  <option value="selective">Selective</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center mb-6">
              <MessageCircle className="w-6 h-6 text-red-400 mr-3" />
              <h2 className="text-xl font-semibold text-white">Contact Information</h2>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Discord Invite Link
              </label>
              <input
                type="url"
                name="discord_invite"
                value={settings.discord_invite}
                onChange={handleInputChange}
                placeholder="https://discord.gg/your-server"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Full Discord invite URL (leave # for placeholder)
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="horde"
              size="lg"
              disabled={isSaving}
            >
              {isSaving ? (
                'Saving...'
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}

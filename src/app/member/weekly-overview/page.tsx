'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface WeeklyOverviewActivity {
  id: string
  character_id: string
  week_start: string
  week_end: string
  mythic_plus_runs: number
  highest_key_level: number
  total_keys_completed: number
  raid_bosses_killed: number
  raid_difficulty: string | null
  vault_mythic_plus_tier: number
  vault_raid_tier: number
  vault_pvp_tier: number
  character: {
    id: string
    name: string
    realm: string
    character_class: string
    active_spec: string | null
    level: number
    equipped_item_level: number | null
    avatar_url: string | null
    is_main: boolean
    user: {
      battletag: string
    }
  }
}

export default function WeeklyOverviewPage() {
  const router = useRouter()
  const [activities, setActivities] = useState<WeeklyOverviewActivity[]>([])
  const [weekStart, setWeekStart] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'mythic' | 'raid' | 'ilvl'>('mythic')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/check-member-auth')
      const data = await res.json()

      if (!data.authenticated) {
        router.push('/member/login')
        return
      }

      await loadWeeklyOverview()
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/member/login')
    }
  }

  const loadWeeklyOverview = async () => {
    try {
      const res = await fetch('/api/member/weekly-overview')
      const data = await res.json()

      if (res.ok) {
        setActivities(data.activities || [])
        setWeekStart(data.weekStart)
      }
    } catch (error) {
      console.error('Failed to load weekly overview:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getClassColor = (charClass: string) => {
    const colors: Record<string, string> = {
      'Death Knight': 'text-red-500',
      'Demon Hunter': 'text-purple-500',
      'Druid': 'text-orange-500',
      'Evoker': 'text-teal-500',
      'Hunter': 'text-green-500',
      'Mage': 'text-cyan-500',
      'Monk': 'text-lime-500',
      'Paladin': 'text-pink-500',
      'Priest': 'text-gray-300',
      'Rogue': 'text-yellow-500',
      'Shaman': 'text-blue-500',
      'Warlock': 'text-purple-700',
      'Warrior': 'text-amber-700'
    }
    return colors[charClass] || 'text-white'
  }

  const getVaultTierColor = (tier: number) => {
    if (tier >= 3) return 'text-purple-400'
    if (tier >= 2) return 'text-blue-400'
    if (tier >= 1) return 'text-green-400'
    return 'text-gray-500'
  }

  const sortedActivities = [...activities].sort((a, b) => {
    switch (sortBy) {
      case 'mythic':
        return b.mythic_plus_runs - a.mythic_plus_runs || b.highest_key_level - a.highest_key_level
      case 'raid':
        return b.raid_bosses_killed - a.raid_bosses_killed
      case 'ilvl':
        return (b.character.equipped_item_level || 0) - (a.character.equipped_item_level || 0)
      default:
        return 0
    }
  })

  const stats = {
    totalMembers: activities.length,
    totalMythicRuns: activities.reduce((sum, a) => sum + a.mythic_plus_runs, 0),
    averageKeyLevel: activities.length > 0
      ? Math.round(activities.reduce((sum, a) => sum + a.highest_key_level, 0) / activities.length)
      : 0,
    totalRaidBosses: activities.reduce((sum, a) => sum + a.raid_bosses_killed, 0),
    vaultReadyMembers: activities.filter(a => a.vault_mythic_plus_tier >= 1).length
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Lädt...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Wöchentliche Gilden-Übersicht</h1>
              <p className="text-gray-400">
                Woche vom {weekStart ? new Date(weekStart).toLocaleDateString('de-DE') : '-'}
              </p>
            </div>
            <div className="flex gap-4">
              <a
                href="/member/dashboard"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Mein Dashboard
              </a>
              <button
                onClick={() => loadWeeklyOverview()}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Aktualisieren
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 text-white">
            <div className="text-3xl font-bold">{stats.totalMembers}</div>
            <div className="text-blue-100 text-sm">Aktive Mitglieder</div>
          </div>
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-6 text-white">
            <div className="text-3xl font-bold">{stats.totalMythicRuns}</div>
            <div className="text-purple-100 text-sm">M+ Runs</div>
          </div>
          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 text-white">
            <div className="text-3xl font-bold">+{stats.averageKeyLevel}</div>
            <div className="text-green-100 text-sm">Ø Schlüsselstufe</div>
          </div>
          <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-lg p-6 text-white">
            <div className="text-3xl font-bold">{stats.totalRaidBosses}</div>
            <div className="text-red-100 text-sm">Raid Bosse</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-lg p-6 text-white">
            <div className="text-3xl font-bold">{stats.vaultReadyMembers}</div>
            <div className="text-yellow-100 text-sm">Vault Ready</div>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
          <div className="flex items-center gap-4">
            <span className="text-white font-medium">Sortieren nach:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('mythic')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  sortBy === 'mythic'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                M+ Aktivität
              </button>
              <button
                onClick={() => setSortBy('raid')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  sortBy === 'raid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Raid Progress
              </button>
              <button
                onClick={() => setSortBy('ilvl')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  sortBy === 'ilvl'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Item Level
              </button>
            </div>
          </div>
        </div>

        {/* Activities Table */}
        {sortedActivities.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
            <p className="text-gray-400 mb-2">Keine Aktivitäten für diese Woche gefunden</p>
            <p className="text-sm text-gray-500">
              Mitglieder müssen ihre wöchentlichen Aktivitäten in ihrem Dashboard aktualisieren
            </p>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Charakter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Spieler
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                    iLvl
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                    M+ Runs
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Höchster Key
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Raid Bosse
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Vault M+
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Vault Raid
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {sortedActivities.map((activity, index) => (
                  <tr key={activity.id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {activity.character.avatar_url && (
                          <img
                            src={activity.character.avatar_url}
                            alt={activity.character.name}
                            className="w-10 h-10 rounded border-2 border-gray-600"
                          />
                        )}
                        <div>
                          <div className={`font-bold ${getClassColor(activity.character.character_class)}`}>
                            {activity.character.name}
                          </div>
                          <div className="text-xs text-gray-400">
                            {activity.character.active_spec && `${activity.character.active_spec} `}
                            {activity.character.character_class}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {activity.character.user.battletag}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-white">
                      {activity.character.equipped_item_level || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-purple-400">
                      {activity.mythic_plus_runs}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-blue-400">
                      +{activity.highest_key_level}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-red-400">
                      {activity.raid_bosses_killed}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`text-sm font-bold ${getVaultTierColor(activity.vault_mythic_plus_tier)}`}>
                        {activity.vault_mythic_plus_tier}/3
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`text-sm font-bold ${getVaultTierColor(activity.vault_raid_tier)}`}>
                        {activity.vault_raid_tier}/3
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}


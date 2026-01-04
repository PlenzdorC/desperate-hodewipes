'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface User {
  id: string
  battlenetId: number
  battletag: string
  region: string
}

interface Character {
  id: string
  name: string
  realm: string
  faction: string
  character_class: string
  active_spec: string | null
  level: number
  equipped_item_level: number | null
  average_item_level: number | null
  achievement_points: number | null
  avatar_url: string | null
  is_main: boolean
  updated_at: string
}

interface WeeklyActivity {
  id: string
  mythic_plus_runs: number
  highest_key_level: number
  total_keys_completed: number
  raid_bosses_killed: number
  raid_difficulty: string | null
  vault_mythic_plus_tier: number
  vault_raid_tier: number
  vault_pvp_tier: number
  week_start: string
}

export default function MemberDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [characters, setCharacters] = useState<Character[]>([])
  const [weeklyActivities, setWeeklyActivities] = useState<Record<string, WeeklyActivity>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)
  const [refreshingCharacters, setRefreshingCharacters] = useState<Set<string>>(new Set())

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

      setUser(data.user)
      await loadCharacters()
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/member/login')
    }
  }

  const loadCharacters = async () => {
    try {
      const res = await fetch('/api/member/characters')
      const data = await res.json()

      if (res.ok) {
        setCharacters(data.characters)
        
        // Load weekly activities for each character
        for (const char of data.characters) {
          loadWeeklyActivity(char.id)
        }
      }
    } catch (error) {
      console.error('Failed to load characters:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadWeeklyActivity = async (characterId: string) => {
    try {
      const res = await fetch(`/api/member/characters/${characterId}/weekly-activity`)
      const data = await res.json()

      if (res.ok && data.activity) {
        setWeeklyActivities(prev => ({
          ...prev,
          [characterId]: data.activity
        }))
      }
    } catch (error) {
      console.error(`Failed to load weekly activity for character ${characterId}:`, error)
    }
  }

  const syncCharacters = async () => {
    setIsSyncing(true)
    setSyncMessage(null)

    try {
      const res = await fetch('/api/member/characters', { method: 'POST' })
      const data = await res.json()

      if (res.ok) {
        setSyncMessage(`${data.count} Charaktere erfolgreich synchronisiert!`)
        await loadCharacters()
      } else {
        setSyncMessage(`Fehler: ${data.error}`)
      }
    } catch (error) {
      console.error('Sync failed:', error)
      setSyncMessage('Synchronisation fehlgeschlagen')
    } finally {
      setIsSyncing(false)
    }
  }

  const refreshCharacter = async (characterId: string) => {
    setRefreshingCharacters(prev => new Set(prev).add(characterId))

    try {
      const res = await fetch(`/api/member/characters/${characterId}/refresh`, { method: 'POST' })
      
      if (res.ok) {
        await loadCharacters()
      }
    } catch (error) {
      console.error('Refresh failed:', error)
    } finally {
      setRefreshingCharacters(prev => {
        const newSet = new Set(prev)
        newSet.delete(characterId)
        return newSet
      })
    }
  }

  const refreshWeeklyActivity = async (characterId: string) => {
    try {
      const res = await fetch(`/api/member/characters/${characterId}/weekly-activity`, { method: 'POST' })
      
      if (res.ok) {
        await loadWeeklyActivity(characterId)
      }
    } catch (error) {
      console.error('Activity refresh failed:', error)
    }
  }

  const setMainCharacter = async (characterId: string) => {
    try {
      const res = await fetch(`/api/member/characters/${characterId}/set-main`, { method: 'POST' })
      
      if (res.ok) {
        await loadCharacters()
      }
    } catch (error) {
      console.error('Set main failed:', error)
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/member-logout', { method: 'POST' })
      router.push('/member/login')
    } catch (error) {
      console.error('Logout failed:', error)
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
              <h1 className="text-2xl font-bold text-white">Mitglieder-Dashboard</h1>
              <p className="text-gray-400">Willkommen, {user?.battletag}!</p>
            </div>
            <div className="flex gap-4">
              <a
                href="/member/weekly-overview"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Gilden-Übersicht
              </a>
              <a
                href="/"
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Zur Hauptseite
              </a>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Abmelden
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sync Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Charaktere synchronisieren</h2>
              <p className="text-gray-400 text-sm">
                Hole alle deine Charaktere von Battle.net ab und aktualisiere ihre Daten
              </p>
            </div>
            <button
              onClick={syncCharacters}
              disabled={isSyncing}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors font-medium"
            >
              {isSyncing ? 'Synchronisiere...' : 'Jetzt synchronisieren'}
            </button>
          </div>
          {syncMessage && (
            <div className="mt-4 p-3 bg-gray-700 rounded-lg text-white text-sm">
              {syncMessage}
            </div>
          )}
        </div>

        {/* Characters List */}
        <h2 className="text-2xl font-bold text-white mb-6">Meine Charaktere</h2>
        
        {characters.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
            <p className="text-gray-400 mb-4">Keine Charaktere gefunden</p>
            <p className="text-sm text-gray-500">
              Klicke auf "Jetzt synchronisieren" um deine Charaktere von Battle.net abzurufen
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {characters.map(char => {
              const activity = weeklyActivities[char.id]
              const isRefreshing = refreshingCharacters.has(char.id)

              return (
                <div
                  key={char.id}
                  className={`bg-gray-800 rounded-lg p-6 border-2 transition-all ${
                    char.is_main ? 'border-yellow-500' : 'border-gray-700'
                  }`}
                >
                  {/* Character Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      {char.avatar_url && (
                        <img
                          src={char.avatar_url}
                          alt={char.name}
                          className="w-16 h-16 rounded-lg border-2 border-gray-700"
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className={`text-xl font-bold ${getClassColor(char.character_class)}`}>
                            {char.name}
                          </h3>
                          {char.is_main && (
                            <span className="px-2 py-0.5 bg-yellow-600 text-yellow-100 text-xs font-bold rounded">
                              MAIN
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm">
                          {char.active_spec && `${char.active_spec} `}{char.character_class}
                        </p>
                        <p className="text-gray-500 text-xs">{char.realm}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">
                        {char.level}
                      </div>
                      <div className="text-sm text-gray-400">
                        {char.equipped_item_level ? `iLvl ${char.equipped_item_level}` : '-'}
                      </div>
                    </div>
                  </div>

                  {/* Character Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-700/50 rounded-lg">
                    <div className="text-center">
                      <div className="text-xs text-gray-400">Fraktion</div>
                      <div className="text-sm font-bold text-white capitalize">{char.faction}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-400">Avg iLvl</div>
                      <div className="text-sm font-bold text-white">
                        {char.average_item_level || '-'}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-400">Erfolge</div>
                      <div className="text-sm font-bold text-white">
                        {char.achievement_points || '-'}
                      </div>
                    </div>
                  </div>

                  {/* Weekly Activity */}
                  {activity && (
                    <div className="mb-4 p-3 bg-gray-700/50 rounded-lg">
                      <h4 className="text-sm font-bold text-white mb-2">Diese Woche</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-400">M+ Runs:</span>
                          <span className="text-white ml-2 font-bold">
                            {activity.mythic_plus_runs}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Höchster Key:</span>
                          <span className="text-white ml-2 font-bold">
                            +{activity.highest_key_level}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Raid Bosse:</span>
                          <span className="text-white ml-2 font-bold">
                            {activity.raid_bosses_killed}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Vault Tier:</span>
                          <span className={`ml-2 font-bold ${getVaultTierColor(activity.vault_mythic_plus_tier)}`}>
                            {activity.vault_mythic_plus_tier}/3
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => refreshCharacter(char.id)}
                      disabled={isRefreshing}
                      className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm rounded transition-colors"
                    >
                      {isRefreshing ? 'Aktualisiere...' : 'Daten aktualisieren'}
                    </button>
                    <button
                      onClick={() => refreshWeeklyActivity(char.id)}
                      className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                    >
                      Aktivität laden
                    </button>
                    {!char.is_main && (
                      <button
                        onClick={() => setMainCharacter(char.id)}
                        className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded transition-colors"
                      >
                        Als Main
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}


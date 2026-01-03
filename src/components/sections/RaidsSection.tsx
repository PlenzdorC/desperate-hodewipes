'use client'

import { useState, useEffect } from 'react'
import { Calendar, Trophy, Sword, Clock, Users, Target } from 'lucide-react'

interface Boss {
  id: string
  name: string
  position: number
  status: string
  kill_date: string | null
  progress_percentage: number
  difficulty: string
}

interface Raid {
  id: string
  name: string
  difficulty: string
  bosses: Boss[]
}

interface Event {
  id: string
  title: string
  description: string | null
  event_type: string
  event_date: string
  event_time: string
  max_attendees: number | null
  current_attendees: number
}

export default function RaidsSection() {
  const [raids, setRaids] = useState<Raid[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [activeTab, setActiveTab] = useState('progress')
  const [activeDifficulty, setActiveDifficulty] = useState('mythic')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadRaidData()
  }, [])

  const loadRaidData = async () => {
    try {
      const [raidsResponse, eventsResponse] = await Promise.all([
        fetch('/api/raids'),
        fetch('/api/events')
      ])

      if (raidsResponse.ok) {
        const raidsData = await raidsResponse.json()
        setRaids(raidsData.raids || [])
      }

      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json()
        setEvents(eventsData.events || [])
      }
    } catch (error) {
      console.error('Error loading raid data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const currentRaid = raids.length > 0 ? raids[0] : null
  const mythicBosses = currentRaid?.bosses.filter(b => b.difficulty === activeDifficulty) || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'killed': return 'text-green-400 bg-green-900/30'
      case 'progress': return 'text-yellow-400 bg-yellow-900/30'
      default: return 'text-gray-400 bg-gray-800'
    }
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'raid': return 'bg-red-600'
      case 'mythicplus': return 'bg-purple-600'
      case 'social': return 'bg-blue-600'
      default: return 'bg-gray-600'
    }
  }

  const getEventTypeName = (type: string) => {
    switch (type) {
      case 'raid': return 'Raid'
      case 'mythicplus': return 'M+'
      case 'social': return 'Social'
      default: return 'Event'
    }
  }

  if (isLoading) {
    return (
      <section id="raids" className="py-20 bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading raid data...</p>
        </div>
      </section>
    )
  }

  return (
    <section id="raids" className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white font-serif">
          Raid Progress & Events
        </h2>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {[
            { key: 'progress', label: 'Progress', icon: Trophy },
            { key: 'calendar', label: 'Kalender', icon: Calendar },
            { key: 'loot', label: 'Loot System', icon: Target }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === tab.key
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5 mr-2" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="max-w-6xl mx-auto">
          {/* Progress Tab */}
          {activeTab === 'progress' && currentRaid && (
            <div className="space-y-8">
              <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
                <h3 className="text-2xl font-bold text-white mb-6 text-center">
                  {currentRaid.name}
                </h3>

                {/* Difficulty Selector */}
                <div className="flex justify-center gap-4 mb-8">
                  {['mythic', 'heroic', 'normal'].map((difficulty) => (
                    <button
                      key={difficulty}
                      onClick={() => setActiveDifficulty(difficulty)}
                      className={`px-6 py-2 rounded-lg font-medium capitalize transition-all duration-300 ${
                        activeDifficulty === difficulty
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {difficulty}
                    </button>
                  ))}
                </div>

                {/* Boss Progress */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mythicBosses.map((boss) => (
                    <div
                      key={boss.id}
                      className={`p-4 rounded-lg border transition-all duration-300 ${getStatusColor(boss.status)}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-lg">{boss.name}</h4>
                          <p className="text-sm opacity-75 capitalize">{boss.difficulty}</p>
                        </div>
                        <div className="text-right">
                          {boss.status === 'killed' && boss.kill_date && (
                            <div className="text-sm">
                              {new Date(boss.kill_date).toLocaleDateString('de-DE')}
                            </div>
                          )}
                          {boss.status === 'progress' && (
                            <div className="text-lg font-bold">
                              {boss.progress_percentage}%
                            </div>
                          )}
                          {boss.status === 'not_attempted' && (
                            <div className="text-sm">Nicht versucht</div>
                          )}
                        </div>
                      </div>
                      
                      {boss.status === 'progress' && (
                        <div className="mt-3">
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${boss.progress_percentage}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Calendar Tab */}
          {activeTab === 'calendar' && (
            <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">
                Nächste Events
              </h3>
              
              <div className="space-y-4">
                {events.length > 0 ? (
                  events.slice(0, 5).map((event) => {
                    const eventDate = new Date(event.event_date)
                    const day = eventDate.getDate()
                    const month = eventDate.toLocaleDateString('de-DE', { month: 'short' })
                    const time = event.event_time.substring(0, 5)
                    
                    return (
                      <div
                        key={event.id}
                        className="flex items-center p-4 bg-gray-900 rounded-lg border border-gray-700 hover:border-red-600/50 transition-all duration-300"
                      >
                        <div className="flex-shrink-0 text-center mr-6">
                          <div className="text-2xl font-bold text-white">{day}</div>
                          <div className="text-sm text-gray-400 uppercase">{month}</div>
                        </div>
                        
                        <div className="flex-grow">
                          <h4 className="text-lg font-bold text-white mb-1">
                            {event.title}
                          </h4>
                          <p className="text-gray-300 text-sm mb-2">
                            {time} Uhr
                          </p>
                          {event.description && (
                            <p className="text-gray-400 text-sm">
                              {event.description}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex-shrink-0 text-right">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white ${getEventTypeColor(event.event_type)}`}>
                            {getEventTypeName(event.event_type)}
                          </span>
                          <div className="text-sm text-gray-400 mt-2">
                            <Users className="w-4 h-4 inline mr-1" />
                            {event.current_attendees}{event.max_attendees ? `/${event.max_attendees}` : ''}
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Keine Events geplant</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Loot System Tab */}
          {activeTab === 'loot' && (
            <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-8 text-center">
                Unser Loot-System
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-8 h-8 text-red-400" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-3">
                    Personal Loot + Council
                  </h4>
                  <p className="text-gray-300 text-sm">
                    Hauptsächlich Personal Loot, bei wichtigen Items entscheidet der Loot Council fair nach Bedarf und Aktivität.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sword className="w-8 h-8 text-red-400" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-3">
                    Main Spec &gt; Off Spec
                  </h4>
                  <p className="text-gray-300 text-sm">
                    Main Spec hat immer Vorrang. Off Spec Items werden nach Aktivität und Hilfsbereitschaft vergeben.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-red-400" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-3">
                    Fair Play
                  </h4>
                  <p className="text-gray-300 text-sm">
                    Transparenz und Fairness stehen im Vordergrund. Jeder soll langfristig seine Items bekommen!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

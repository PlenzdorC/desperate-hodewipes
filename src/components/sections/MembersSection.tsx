'use client'

import { useState, useEffect } from 'react'
import { Shield, Sword, Heart, Users, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Member {
  id: string
  name: string
  class: string
  specialization: string
  role: string
  item_level: number | null
  raiderio_score: number | null
  status: string
  is_officer: boolean
  avatar_url: string | null
}

const classColors: Record<string, string> = {
  warrior: 'bg-amber-600',
  paladin: 'bg-pink-500',
  hunter: 'bg-green-600',
  rogue: 'bg-yellow-500',
  priest: 'bg-gray-300',
  shaman: 'bg-blue-600',
  mage: 'bg-cyan-400',
  warlock: 'bg-purple-600',
  monk: 'bg-green-400',
  druid: 'bg-orange-600',
  dh: 'bg-purple-800',
  dk: 'bg-red-800',
  evoker: 'bg-emerald-500'
}

const roleIcons = {
  tank: Shield,
  heal: Heart,
  dps: Sword,
  officer: Users
}

export default function MembersSection() {
  const [members, setMembers] = useState<Member[]>([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadMembers()
  }, [])

  const loadMembers = async () => {
    try {
      const response = await fetch('/api/members')
      if (response.ok) {
        const data = await response.json()
        setMembers(data.members || [])
      }
    } catch (error) {
      console.error('Error loading members:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredMembers = members.filter(member => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'officer') return member.is_officer
    return member.role === activeFilter
  })

  const filters = [
    { key: 'all', label: 'Alle', count: members.length },
    { key: 'tank', label: 'Tanks', count: members.filter(m => m.role === 'tank').length },
    { key: 'heal', label: 'Healer', count: members.filter(m => m.role === 'heal').length },
    { key: 'dps', label: 'DPS', count: members.filter(m => m.role === 'dps').length },
    { key: 'officer', label: 'Officer', count: members.filter(m => m.is_officer).length }
  ]

  if (isLoading) {
    return (
      <section id="members" className="py-20 bg-gray-800">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading members...</p>
        </div>
      </section>
    )
  }

  return (
    <section id="members" className="py-20 bg-gray-800">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white font-serif">
          Unsere Helden
        </h2>
        
        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeFilter === filter.key
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>

        {/* Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {filteredMembers.map((member) => {
            const RoleIcon = roleIcons[member.role as keyof typeof roleIcons] || Sword
            const classColor = classColors[member.class] || 'bg-gray-600'
            
            return (
              <div
                key={member.id}
                className="bg-gray-900 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-700 hover:border-red-600/50"
              >
                {/* Avatar and Class Indicator */}
                <div className="relative mb-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gray-700 flex items-center justify-center text-2xl font-bold text-white">
                    {member.avatar_url ? (
                      <img 
                        src={member.avatar_url} 
                        alt={member.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      member.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className={`absolute -bottom-2 -right-2 w-8 h-8 ${classColor} rounded-full flex items-center justify-center`}>
                    <RoleIcon className="w-4 h-4 text-white" />
                  </div>
                  {member.is_officer && (
                    <div className="absolute -top-2 -left-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Users className="w-3 h-3 text-gray-900" />
                    </div>
                  )}
                </div>

                {/* Member Info */}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-1">
                    {member.name}
                  </h3>
                  <p className="text-red-400 text-sm mb-2 capitalize">
                    {member.is_officer ? 'Officer & ' : ''}{member.role}
                  </p>
                  <p className="text-gray-300 text-sm mb-4 capitalize">
                    {member.specialization} {member.class}
                  </p>

                  {/* Stats */}
                  <div className="flex justify-between text-sm">
                    <div className="text-center">
                      <div className="text-white font-semibold">
                        {member.item_level || 'N/A'}
                      </div>
                      <div className="text-gray-400">ilvl</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white font-semibold">
                        {member.raiderio_score ? `${(member.raiderio_score / 1000).toFixed(1)}k` : 'N/A'}
                      </div>
                      <div className="text-gray-400">Rio</div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Recruitment Notice */}
        <div className="bg-gray-900 rounded-lg p-8 text-center border border-gray-700">
          <div className="flex items-center justify-center mb-4">
            <Plus className="w-8 h-8 text-red-400 mr-3" />
            <h3 className="text-2xl font-bold text-white">
              Wir suchen Verstärkung!
            </h3>
          </div>
          <p className="text-gray-300 mb-6">
            Aktuell suchen wir: <strong className="text-red-400">1x Healer</strong> und <strong className="text-red-400">2x Ranged DPS</strong>
          </p>
          <Button 
            variant="horde" 
            size="lg"
            onClick={() => {
              const applySection = document.getElementById('apply')
              if (applySection) {
                const element = applySection as HTMLElement
                const offsetTop = element.offsetTop - 70
                window.scrollTo({
                  top: offsetTop,
                  behavior: 'smooth'
                })
              }
            }}
          >
            Jetzt bewerben
          </Button>
        </div>
      </div>
    </section>
  )
}

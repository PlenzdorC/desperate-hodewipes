'use client'

import { useState, useEffect } from 'react'
import { Trophy, Target, Calendar, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import AdminLayout from '@/components/admin/AdminLayout'

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

const bossStatuses = [
  { value: 'not_attempted', label: 'Not Attempted' },
  { value: 'progress', label: 'In Progress' },
  { value: 'killed', label: 'Killed' }
]

const difficulties = ['mythic', 'heroic', 'normal']

export default function AdminRaids() {
  const [raids, setRaids] = useState<Raid[]>([])
  const [selectedRaid, setSelectedRaid] = useState<Raid | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState('mythic')
  const [isLoading, setIsLoading] = useState(true)
  const [editingBoss, setEditingBoss] = useState<Boss | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    status: 'not_attempted',
    progress_percentage: '0',
    kill_date: ''
  })

  useEffect(() => {
    loadRaids()
  }, [])

  const loadRaids = async () => {
    try {
      const response = await fetch('/api/raids')
      if (response.ok) {
        const data = await response.json()
        setRaids(data.raids || [])
        if (data.raids && data.raids.length > 0) {
          setSelectedRaid(data.raids[0])
        }
      }
    } catch (error) {
      console.error('Error loading raids:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBossUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingBoss) return

    try {
      const response = await fetch('/api/admin/raids/boss', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingBoss.id,
          status: formData.status,
          progress_percentage: parseInt(formData.progress_percentage),
          kill_date: formData.status === 'killed' ? (formData.kill_date || new Date().toISOString().split('T')[0]) : null
        })
      })

      if (response.ok) {
        await loadRaids()
        setShowModal(false)
        setEditingBoss(null)
        resetForm()
      } else {
        const error = await response.json()
        alert(error.error || 'Error updating boss')
      }
    } catch (error) {
      console.error('Error updating boss:', error)
      alert('Error updating boss')
    }
  }

  const handleEditBoss = (boss: Boss) => {
    setEditingBoss(boss)
    setFormData({
      status: boss.status,
      progress_percentage: boss.progress_percentage.toString(),
      kill_date: boss.kill_date || ''
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      status: 'not_attempted',
      progress_percentage: '0',
      kill_date: ''
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'killed': return 'bg-green-600 border-green-500'
      case 'progress': return 'bg-yellow-600 border-yellow-500'
      default: return 'bg-gray-600 border-gray-500'
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500'
    if (percentage >= 50) return 'bg-yellow-500'
    if (percentage > 0) return 'bg-red-500'
    return 'bg-gray-600'
  }

  const filteredBosses = selectedRaid?.bosses.filter(boss => boss.difficulty === selectedDifficulty) || []

  return (
    <AdminLayout currentPage="raids">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Raid Progress Management</h1>
          <div className="text-sm text-gray-400">
            {selectedRaid ? `Managing: ${selectedRaid.name}` : 'No raid selected'}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading raid data...</p>
          </div>
        ) : selectedRaid ? (
          <div className="space-y-6">
            {/* Raid Header */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">{selectedRaid.name}</h2>
              
              {/* Difficulty Selector */}
              <div className="flex space-x-4">
                {difficulties.map((difficulty) => (
                  <button
                    key={difficulty}
                    onClick={() => setSelectedDifficulty(difficulty)}
                    className={`px-4 py-2 rounded-lg font-medium capitalize transition-all duration-300 ${
                      selectedDifficulty === difficulty
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {difficulty}
                  </button>
                ))}
              </div>
            </div>

            {/* Boss Progress */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <div className="px-6 py-4 bg-gray-700 border-b border-gray-600">
                <h3 className="text-lg font-semibold text-white">
                  Boss Progress - {selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)}
                </h3>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredBosses.map((boss) => (
                    <div
                      key={boss.id}
                      className={`p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer hover:shadow-lg ${getStatusColor(boss.status)}`}
                      onClick={() => handleEditBoss(boss)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-white text-lg">
                          {boss.position}. {boss.name}
                        </h4>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-400 text-gray-200 hover:bg-gray-600"
                        >
                          Edit
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-200">Status:</span>
                          <span className="capitalize font-medium text-white">
                            {boss.status.replace('_', ' ')}
                          </span>
                        </div>
                        
                        {boss.status === 'killed' && boss.kill_date && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-200">Kill Date:</span>
                            <span className="text-white">
                              {new Date(boss.kill_date).toLocaleDateString('de-DE')}
                            </span>
                          </div>
                        )}
                        
                        {boss.status === 'progress' && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-200">Progress:</span>
                              <span className="text-white font-medium">
                                {boss.progress_percentage}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(boss.progress_percentage)}`}
                                style={{ width: `${boss.progress_percentage}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {filteredBosses.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    No bosses found for {selectedDifficulty} difficulty.
                  </div>
                )}
              </div>
            </div>

            {/* Progress Summary */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Progress Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {difficulties.map((difficulty) => {
                  const difficultyBosses = selectedRaid.bosses.filter(b => b.difficulty === difficulty)
                  const killedBosses = difficultyBosses.filter(b => b.status === 'killed').length
                  const totalBosses = difficultyBosses.length
                  const progressPercentage = totalBosses > 0 ? (killedBosses / totalBosses) * 100 : 0
                  
                  return (
                    <div key={difficulty} className="text-center">
                      <div className="text-2xl font-bold text-white mb-2 capitalize">
                        {difficulty}
                      </div>
                      <div className="text-lg text-gray-300 mb-3">
                        {killedBosses}/{totalBosses}
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(progressPercentage)}`}
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                      <div className="text-sm text-gray-400 mt-2">
                        {Math.round(progressPercentage)}% Complete
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No raids configured yet.</p>
          </div>
        )}
      </div>

      {/* Boss Edit Modal */}
      {showModal && editingBoss && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">
              Edit Boss: {editingBoss.name}
            </h2>
            
            <form onSubmit={handleBossUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {bossStatuses.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>

              {formData.status === 'progress' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Progress Percentage (0-99)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={formData.progress_percentage}
                    onChange={(e) => setFormData({...formData, progress_percentage: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              )}

              {formData.status === 'killed' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Kill Date
                  </label>
                  <input
                    type="date"
                    value={formData.kill_date}
                    onChange={(e) => setFormData({...formData, kill_date: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Leave empty to use today's date
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowModal(false)
                    setEditingBoss(null)
                    resetForm()
                  }}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button type="submit" variant="horde">
                  Update Boss
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

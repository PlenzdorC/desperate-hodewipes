'use client'

import { useState, useEffect } from 'react'
import { Eye, Check, X, Clock, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import AdminLayout from '@/components/admin/AdminLayout'

interface Application {
  id: string
  character_name: string
  character_class: string
  specialization: string
  item_level: number
  raiderio_score: number | null
  experience: string
  motivation: string
  availability: string
  discord_name: string
  status: string
  notes: string | null
  created_at: string
  reviewed_at: string | null
  reviewed_by: string | null
}

const statuses = ['pending', 'approved', 'rejected', 'interview']

export default function AdminApplications() {
  const [applications, setApplications] = useState<Application[]>([])
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')

  useEffect(() => {
    loadApplications()
  }, [])

  useEffect(() => {
    filterApplications()
  }, [applications, searchTerm, filterStatus])

  const loadApplications = async () => {
    try {
      const response = await fetch('/api/applications')
      if (response.ok) {
        const data = await response.json()
        setApplications(data.applications || [])
      }
    } catch (error) {
      console.error('Error loading applications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterApplications = () => {
    let filtered = applications

    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.character_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.character_class.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.discord_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(app => app.status === filterStatus)
    }

    // Sort by created_at desc (newest first)
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    setFilteredApplications(filtered)
  }

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/applications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: applicationId,
          status: newStatus,
          notes: reviewNotes
        })
      })

      if (response.ok) {
        await loadApplications()
        setShowModal(false)
        setSelectedApplication(null)
        setReviewNotes('')
      } else {
        const error = await response.json()
        alert(error.error || 'Error updating application')
      }
    } catch (error) {
      console.error('Error updating application:', error)
      alert('Error updating application')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this application?')) return

    try {
      const response = await fetch('/api/applications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })

      if (response.ok) {
        await loadApplications()
      } else {
        const error = await response.json()
        alert(error.error || 'Error deleting application')
      }
    } catch (error) {
      console.error('Error deleting application:', error)
      alert('Error deleting application')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-600'
      case 'approved': return 'bg-green-600'
      case 'rejected': return 'bg-red-600'
      case 'interview': return 'bg-blue-600'
      default: return 'bg-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock
      case 'approved': return Check
      case 'rejected': return X
      case 'interview': return Eye
      default: return Clock
    }
  }

  const formatAvailability = (availability: string) => {
    return availability.split(',').map(day => {
      switch (day.trim()) {
        case 'wednesday': return 'Mi'
        case 'sunday': return 'So'
        case 'optional': return 'Opt'
        default: return day
      }
    }).join(', ')
  }

  return (
    <AdminLayout currentPage="applications">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Applications Management</h1>
          <div className="text-sm text-gray-400">
            {applications.filter(app => app.status === 'pending').length} pending applications
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Status</option>
              {statuses.map(status => (
                <option key={status} value={status} className="capitalize">{status}</option>
              ))}
            </select>

            <div className="text-sm text-gray-400 flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              {filteredApplications.length} of {applications.length} applications
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading applications...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Character</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Class/Spec</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Item Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Availability</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Applied</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredApplications.map((application) => {
                    const StatusIcon = getStatusIcon(application.status)
                    
                    return (
                      <tr key={application.id} className="hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-white">
                              {application.character_name}
                            </div>
                            <div className="text-sm text-gray-400">
                              {application.discord_name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300 capitalize">
                            {application.character_class}
                          </div>
                          <div className="text-sm text-gray-400 capitalize">
                            {application.specialization}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">
                            {application.item_level}
                          </div>
                          {application.raiderio_score && (
                            <div className="text-sm text-gray-400">
                              {application.raiderio_score} Rio
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {formatAvailability(application.availability)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white capitalize ${getStatusColor(application.status)}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {application.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {new Date(application.created_at).toLocaleDateString('de-DE')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedApplication(application)
                                setReviewNotes(application.notes || '')
                                setShowModal(true)
                              }}
                              className="border-gray-600 text-gray-300 hover:bg-gray-700"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            
                            {application.status === 'pending' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStatusUpdate(application.id, 'approved')}
                                  className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStatusUpdate(application.id, 'rejected')}
                                  className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              
              {filteredApplications.length === 0 && !isLoading && (
                <div className="p-8 text-center text-gray-400">
                  No applications found matching your criteria.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Application Detail Modal */}
      {showModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                Application Details - {selectedApplication.character_name}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Character Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Character Name</label>
                  <div className="text-white">{selectedApplication.character_name}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Discord</label>
                  <div className="text-white">{selectedApplication.discord_name}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Class</label>
                  <div className="text-white capitalize">{selectedApplication.character_class}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Specialization</label>
                  <div className="text-white capitalize">{selectedApplication.specialization}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Item Level</label>
                  <div className="text-white">{selectedApplication.item_level}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Raider.IO Score</label>
                  <div className="text-white">{selectedApplication.raiderio_score || 'N/A'}</div>
                </div>
              </div>

              {/* Availability */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Availability</label>
                <div className="text-white">{formatAvailability(selectedApplication.availability)}</div>
              </div>

              {/* Experience */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Raid Experience</label>
                <div className="bg-gray-700 rounded-md p-3 text-white whitespace-pre-wrap">
                  {selectedApplication.experience}
                </div>
              </div>

              {/* Motivation */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Motivation</label>
                <div className="bg-gray-700 rounded-md p-3 text-white whitespace-pre-wrap">
                  {selectedApplication.motivation}
                </div>
              </div>

              {/* Review Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Review Notes</label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Add notes about this application..."
                />
              </div>

              {/* Status and Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-400">Current Status:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white capitalize ${getStatusColor(selectedApplication.status)}`}>
                    {selectedApplication.status}
                  </span>
                </div>

                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowModal(false)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Close
                  </Button>
                  
                  {selectedApplication.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => handleStatusUpdate(selectedApplication.id, 'interview')}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Interview
                      </Button>
                      <Button
                        onClick={() => handleStatusUpdate(selectedApplication.id, 'approved')}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleStatusUpdate(selectedApplication.id, 'rejected')}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  
                  {selectedApplication.status !== 'pending' && (
                    <Button
                      onClick={() => handleStatusUpdate(selectedApplication.id, 'pending')}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white"
                    >
                      Reset to Pending
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

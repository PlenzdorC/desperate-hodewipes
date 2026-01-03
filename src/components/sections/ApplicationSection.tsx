'use client'

import { useState } from 'react'
import { Check, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'

const wowClasses = [
  { value: 'warrior', label: 'Krieger' },
  { value: 'paladin', label: 'Paladin' },
  { value: 'hunter', label: 'Jäger' },
  { value: 'rogue', label: 'Schurke' },
  { value: 'priest', label: 'Priester' },
  { value: 'shaman', label: 'Schamane' },
  { value: 'mage', label: 'Magier' },
  { value: 'warlock', label: 'Hexenmeister' },
  { value: 'monk', label: 'Mönch' },
  { value: 'druid', label: 'Druide' },
  { value: 'dh', label: 'Dämonenjäger' },
  { value: 'dk', label: 'Todesritter' },
  { value: 'evoker', label: 'Rufer' }
]

interface FormData {
  charName: string
  charClass: string
  charSpec: string
  ilvl: string
  rio: string
  experience: string
  motivation: string
  availability: string[]
  discord: string
}

export default function ApplicationSection() {
  const [formData, setFormData] = useState<FormData>({
    charName: '',
    charClass: '',
    charSpec: '',
    ilvl: '',
    rio: '',
    experience: '',
    motivation: '',
    availability: [],
    discord: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target
    setFormData(prev => ({
      ...prev,
      availability: checked 
        ? [...prev.availability, value]
        : prev.availability.filter(item => item !== value)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitted(true)
        setFormData({
          charName: '',
          charClass: '',
          charSpec: '',
          ilvl: '',
          rio: '',
          experience: '',
          motivation: '',
          availability: [],
          discord: ''
        })
      } else {
        throw new Error('Fehler beim Senden der Bewerbung')
      }
    } catch (error) {
      console.error('Error submitting application:', error)
      alert('Fehler beim Senden der Bewerbung. Bitte versuche es später erneut.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <section id="apply" className="py-20 bg-gray-800">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto bg-gray-900 rounded-lg p-8 shadow-lg border border-gray-700">
            <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              Bewerbung gesendet!
            </h3>
            <p className="text-gray-300 mb-6">
              Vielen Dank für deine Bewerbung! Wir werden uns bald bei dir melden.
            </p>
            <Button 
              onClick={() => setSubmitted(false)}
              variant="outline"
              className="border-gray-600 text-white hover:bg-gray-800"
            >
              Neue Bewerbung
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="apply" className="py-20 bg-gray-800">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white font-serif">
          Bewerbung
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Info Section */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Interesse an unserer Gilde?
              </h3>
              <p className="text-gray-300 mb-6">
                Wir sind immer auf der Suche nach motivierten Spielern, die Lust auf Progress und eine tolle Community haben!
              </p>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 shadow-lg border border-gray-700">
              <h4 className="text-lg font-bold text-white mb-4">Was wir erwarten:</h4>
              <ul className="space-y-2">
                {[
                  'Mindestens ilvl 435+',
                  'Grundkenntnisse der aktuellen Raids',
                  'Teamfähigkeit und Humor',
                  'Regelmäßige Teilnahme an Raids',
                  'Discord mit funktionierendem Mikrofon'
                ].map((requirement, index) => (
                  <li key={index} className="flex items-center text-gray-300">
                    <Check className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                    {requirement}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 shadow-lg border border-gray-700">
              <h4 className="text-lg font-bold text-white mb-4">Aktuell gesucht:</h4>
              <div className="space-y-2">
                <span className="inline-block bg-red-900/50 text-red-300 px-3 py-1 rounded-full text-sm font-medium border border-red-700">
                  Heiler (Hoch)
                </span>
                <span className="inline-block bg-yellow-900/50 text-yellow-300 px-3 py-1 rounded-full text-sm font-medium ml-2 border border-yellow-700">
                  Ranged DPS (Mittel)
                </span>
                <span className="inline-block bg-green-900/50 text-green-300 px-3 py-1 rounded-full text-sm font-medium ml-2 border border-green-700">
                  Melee DPS (Niedrig)
                </span>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="bg-gray-900 rounded-lg p-8 shadow-lg border border-gray-700">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="charName" className="block text-sm font-medium text-gray-300 mb-2">
                  Charaktername *
                </label>
                <input
                  type="text"
                  id="charName"
                  name="charName"
                  value={formData.charName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="charClass" className="block text-sm font-medium text-gray-300 mb-2">
                    Klasse *
                  </label>
                  <select
                    id="charClass"
                    name="charClass"
                    value={formData.charClass}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Wählen...</option>
                    {wowClasses.map((cls) => (
                      <option key={cls.value} value={cls.value}>
                        {cls.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="charSpec" className="block text-sm font-medium text-gray-300 mb-2">
                    Spezialisierung *
                  </label>
                  <input
                    type="text"
                    id="charSpec"
                    name="charSpec"
                    value={formData.charSpec}
                    onChange={handleInputChange}
                    placeholder="z.B. Schutz, Vergeltung..."
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ilvl" className="block text-sm font-medium text-gray-300 mb-2">
                    Item Level *
                  </label>
                  <input
                    type="number"
                    id="ilvl"
                    name="ilvl"
                    value={formData.ilvl}
                    onChange={handleInputChange}
                    min="400"
                    max="500"
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="rio" className="block text-sm font-medium text-gray-300 mb-2">
                    Raider.IO Score
                  </label>
                  <input
                    type="number"
                    id="rio"
                    name="rio"
                    value={formData.rio}
                    onChange={handleInputChange}
                    min="0"
                    max="5000"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="experience" className="block text-sm font-medium text-gray-300 mb-2">
                  Raid-Erfahrung *
                </label>
                <textarea
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Erzähl uns von deiner Raid-Erfahrung..."
                  required
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-gray-400"
                />
              </div>

              <div>
                <label htmlFor="motivation" className="block text-sm font-medium text-gray-300 mb-2">
                  Warum unsere Gilde? *
                </label>
                <textarea
                  id="motivation"
                  name="motivation"
                  value={formData.motivation}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Was motiviert dich, bei uns zu raiden?"
                  required
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Verfügbarkeit *
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'wednesday', label: 'Mittwoch 20-23 Uhr' },
                    { value: 'sunday', label: 'Sonntag 20-23 Uhr' },
                    { value: 'optional', label: 'Optional Events' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center text-gray-300">
                      <input
                        type="checkbox"
                        value={option.value}
                        checked={formData.availability.includes(option.value)}
                        onChange={handleCheckboxChange}
                        className="mr-2 h-4 w-4 text-red-600 focus:ring-red-500 bg-gray-800 border-gray-600 rounded"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="discord" className="block text-sm font-medium text-gray-300 mb-2">
                  Discord Name *
                </label>
                <input
                  type="text"
                  id="discord"
                  name="discord"
                  value={formData.discord}
                  onChange={handleInputChange}
                  placeholder="username#1234"
                  required
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-gray-400"
                />
              </div>

              <Button
                type="submit"
                variant="horde"
                size="lg"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  'Wird gesendet...'
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Bewerbung absenden
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

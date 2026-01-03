'use client'

import { useState, useEffect } from 'react'
import { 
  MessageCircle, 
  Mail, 
  Gamepad2, 
  Server, 
  Globe, 
  Users, 
  Sword,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface GuildSettings {
  guild_name: string
  server_name: string
  guild_description: string
  raid_times: string
  discord_invite: string
}

export default function ContactSection() {
  const [settings, setSettings] = useState<GuildSettings>({
    guild_name: 'Desperate Hordewipes',
    server_name: 'Dein Server Name',
    guild_description: 'Eine Gilde, die beweist, dass man auch beim Wipen Spaß haben kann!',
    raid_times: 'Mittwoch & Sonntag, 20:00-23:00 Uhr',
    discord_invite: '#'
  })
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(label)
      setTimeout(() => setCopiedText(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const contactMethods = [
    {
      icon: MessageCircle,
      title: 'Discord',
      description: 'Unser Hauptkommunikationsmittel',
      action: 'Discord Server beitreten',
      link: settings.discord_invite !== '#' ? settings.discord_invite : 'https://discord.gg/your-server',
      copyText: 'discord.gg/your-server'
    },
    {
      icon: Mail,
      title: 'E-Mail',
      description: 'Für offizielle Anfragen',
      action: 'E-Mail senden',
      link: 'mailto:guildmaster@desperate-hordewipes.de',
      copyText: 'guildmaster@desperate-hordewipes.de'
    },
    {
      icon: Gamepad2,
      title: 'Battle.net',
      description: 'Direkter Kontakt im Spiel',
      action: 'Battle.net hinzufügen',
      link: '#',
      copyText: 'Guildmaster#1234'
    }
  ]

  const serverInfo = [
    {
      label: 'Server',
      value: settings.server_name,
      icon: Server
    },
    {
      label: 'Fraktion',
      value: 'Horde',
      icon: Sword,
      special: 'horde'
    },
    {
      label: 'Region',
      value: 'EU-Deutsch',
      icon: Globe
    },
    {
      label: 'Typ',
      value: 'PvE/PvP',
      icon: Users
    }
  ]

  const socialLinks = [
    {
      name: 'Discord',
      icon: MessageCircle,
      url: settings.discord_invite !== '#' ? settings.discord_invite : '#',
      color: 'hover:text-indigo-400'
    },
    {
      name: 'Twitch',
      icon: ExternalLink,
      url: '#',
      color: 'hover:text-purple-400'
    },
    {
      name: 'YouTube',
      icon: ExternalLink,
      url: '#',
      color: 'hover:text-red-400'
    },
    {
      name: 'Twitter',
      icon: ExternalLink,
      url: '#',
      color: 'hover:text-blue-400'
    }
  ]

  if (isLoading) {
    return (
      <section id="contact" className="py-20 bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading contact info...</p>
        </div>
      </section>
    )
  }

  return (
    <section id="contact" className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white font-serif">
          Kontakt
        </h2>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {contactMethods.map((method, index) => {
            const Icon = method.icon
            return (
              <div
                key={index}
                className="bg-gray-800 rounded-lg p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-700 hover:border-red-600/50"
              >
                <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icon className="w-8 h-8 text-red-400" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-3">
                  {method.title}
                </h3>
                
                <p className="text-gray-300 mb-6">
                  {method.description}
                </p>
                
                <div className="space-y-3">
                  {method.link !== '#' && (
                    <a
                      href={method.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button variant="horde" size="sm" className="w-full">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {method.action}
                      </Button>
                    </a>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(method.copyText, method.title)}
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    {copiedText === method.title ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Kopiert!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        {method.copyText}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Server Information */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-8 text-center">
              Server Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {serverInfo.map((info, index) => {
                const Icon = info.icon
                return (
                  <div key={index} className="text-center">
                    <div className="w-12 h-12 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Icon className="w-6 h-6 text-red-400" />
                    </div>
                    <div className="text-sm text-gray-400 mb-1">
                      {info.label}
                    </div>
                    <div className={`font-bold ${
                      info.special === 'horde' ? 'text-red-400' : 'text-white'
                    }`}>
                      {info.value}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Guild Description & Raid Times */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h4 className="text-lg font-bold text-white mb-4">
                Über uns
              </h4>
              <p className="text-gray-300">
                {settings.guild_description}
              </p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h4 className="text-lg font-bold text-white mb-4">
                Raid-Zeiten
              </h4>
              <p className="text-gray-300">
                {settings.raid_times}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Optional: Donnerstags Alt-Runs und M+ Abende
              </p>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 mt-8">
            <h3 className="text-xl font-bold text-white mb-6 text-center">
              Community
            </h3>
            
            <div className="flex justify-center space-x-6">
              {socialLinks.map((social, index) => {
                const Icon = social.icon
                return (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-gray-400 transition-all duration-300 hover:bg-gray-600 ${social.color}`}
                    title={social.name}
                  >
                    <Icon className="w-6 h-6" />
                  </a>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

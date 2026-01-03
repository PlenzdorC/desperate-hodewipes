'use client'

import Link from 'next/link'
import { MessageCircle, ExternalLink, Skull } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { href: '#about', label: 'Über uns' },
    { href: '#members', label: 'Mitglieder' },
    { href: '#raids', label: 'Raid Progress' },
    { href: '#gallery', label: 'Galerie' },
    { href: '#apply', label: 'Bewerbung' },
    { href: '#contact', label: 'Kontakt' }
  ]

  const socialLinks = [
    {
      name: 'Discord',
      icon: MessageCircle,
      url: '#',
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

  const handleNavClick = (href: string) => {
    const targetId = href.replace('#', '')
    const targetSection = document.getElementById(targetId)
    
    if (targetSection) {
      const element = targetSection as HTMLElement
      const offsetTop = element.offsetTop - 70
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      })
    }
  }

  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Guild Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Skull className="w-8 h-8 text-red-500" />
              <span className="text-xl font-bold text-white font-serif">
                Desperate Hordewipes
              </span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Eine Gilde, die beweist, dass man auch beim Wipen Spaß haben kann! 
              Seit 2019 bringen wir Chaos, Humor und epische Momente nach Azeroth.
            </p>
            <div className="text-sm text-gray-500">
              <p>Für die Horde! 🗡️</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-white">Quick Links</h4>
            <div className="grid grid-cols-2 gap-2">
              {quickLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className="text-gray-400 hover:text-red-400 transition-colors text-left text-sm"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          {/* Community & Social */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-white">Community</h4>
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 transition-all duration-300 hover:bg-gray-700 ${social.color}`}
                    title={social.name}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                )
              })}
            </div>
            <div className="text-sm text-gray-400 space-y-1">
              <p>Mittwoch & Sonntag</p>
              <p>20:00-23:00 Uhr</p>
              <p className="text-red-400">Wir suchen: Healer & Ranged DPS</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-500 text-center md:text-left">
              <p>&copy; {currentYear} Desperate Hordewipes. Für die Horde!</p>
              <p className="mt-1">
                World of Warcraft ist ein eingetragenes Warenzeichen von Blizzard Entertainment.
              </p>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <Link 
                href="/admin" 
                className="hover:text-red-400 transition-colors"
              >
                Admin
              </Link>
              <span>•</span>
              <span>Made with ❤️ for the Horde</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

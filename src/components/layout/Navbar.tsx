'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Skull, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '#home', label: 'Home' },
  { href: '#about', label: 'Über uns' },
  { href: '#members', label: 'Mitglieder' },
  { href: '#raids', label: 'Raids' },
  { href: '#gallery', label: 'Galerie' },
  { href: '#apply', label: 'Bewerbung' },
  { href: '#contact', label: 'Kontakt' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
      
      // Update active section based on scroll position
      const sections = document.querySelectorAll('section[id]')
      let currentSection = 'home'
      
      sections.forEach((section) => {
        const element = section as HTMLElement
        const sectionTop = element.offsetTop - 100
        const sectionHeight = element.clientHeight
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
          currentSection = section.getAttribute('id') || 'home'
        }
      })
      
      setActiveSection(currentSection)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
    
    setIsOpen(false)
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-gray-900/98 backdrop-blur-md shadow-lg' 
        : 'bg-gray-900/95 backdrop-blur-sm'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 text-white hover:text-red-400 transition-colors">
            <Skull className="w-8 h-8 text-red-500" />
            <span className="text-xl font-bold font-serif">Desperate Hordewipes</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className={`text-sm font-medium transition-colors hover:text-red-400 ${
                  activeSection === item.href.replace('#', '')
                    ? 'text-red-400'
                    : 'text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white hover:text-red-400"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden bg-gray-800/95 backdrop-blur-md rounded-lg mt-2 p-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className={`block w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-red-600/20 hover:text-red-400 ${
                  activeSection === item.href.replace('#', '')
                    ? 'text-red-400 bg-red-600/10'
                    : 'text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { Sword, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeroStats {
  activeMembers: number
  mythicProgress: string
  legendaryWipes: string
}

export default function HeroSection() {
  const [stats, setStats] = useState<HeroStats>({
    activeMembers: 42,
    mythicProgress: '8/8',
    legendaryWipes: '∞'
  })

  const handleApplyClick = () => {
    const applySection = document.getElementById('apply')
    if (applySection) {
      const element = applySection as HTMLElement
      const offsetTop = element.offsetTop - 70
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      })
    }
  }

  const handleScrollDown = () => {
    const aboutSection = document.getElementById('about')
    if (aboutSection) {
      const element = aboutSection as HTMLElement
      const offsetTop = element.offsetTop - 70
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      })
    }
  }

  return (
    <section 
      id="home" 
      className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-red-900/20 to-gray-900 overflow-hidden"
    >
      {/* Background Image Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=2070')"
        }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-serif">
          <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
            Desperate Hordewipes
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto">
          Für die Horde! Chaos, Spaß und epische Wipes seit 2019
        </p>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-red-600/20">
            <div className="text-3xl md:text-4xl font-bold text-red-400 mb-2">
              {stats.activeMembers}
            </div>
            <div className="text-gray-300 text-sm uppercase tracking-wide">
              Aktive Mitglieder
            </div>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-red-600/20">
            <div className="text-3xl md:text-4xl font-bold text-red-400 mb-2">
              {stats.mythicProgress}
            </div>
            <div className="text-gray-300 text-sm uppercase tracking-wide">
              Mythic Progress
            </div>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-red-600/20">
            <div className="text-3xl md:text-4xl font-bold text-red-400 mb-2">
              {stats.legendaryWipes}
            </div>
            <div className="text-gray-300 text-sm uppercase tracking-wide">
              Legendary Wipes
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          variant="horde"
          size="lg"
          onClick={handleApplyClick}
          className="text-lg px-8 py-4 h-auto"
        >
          <Sword className="w-5 h-5 mr-2" />
          Jetzt bewerben
        </Button>
      </div>

      {/* Scroll Indicator */}
      <button
        onClick={handleScrollDown}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white hover:text-red-400 transition-colors animate-bounce"
      >
        <ChevronDown className="w-8 h-8" />
      </button>
    </section>
  )
}

import Navbar from '@/components/layout/Navbar'
import HeroSection from '@/components/sections/HeroSection'
import AboutSection from '@/components/sections/AboutSection'
import ApplicationSection from '@/components/sections/ApplicationSection'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <ApplicationSection />
    </main>
  )
}

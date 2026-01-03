import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import HeroSection from '@/components/sections/HeroSection'
import AboutSection from '@/components/sections/AboutSection'
import MembersSection from '@/components/sections/MembersSection'
import RaidsSection from '@/components/sections/RaidsSection'
import GallerySection from '@/components/sections/GallerySection'
import ApplicationSection from '@/components/sections/ApplicationSection'
import ContactSection from '@/components/sections/ContactSection'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <MembersSection />
      <RaidsSection />
      <GallerySection />
      <ApplicationSection />
      <ContactSection />
      <Footer />
    </main>
  )
}

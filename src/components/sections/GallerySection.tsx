'use client'

import { useState, useEffect } from 'react'
import { Image, Trophy, Users, Calendar, X } from 'lucide-react'

interface GalleryItem {
  id: string
  title: string
  description: string | null
  image_url: string
  category: string
  created_at: string
}

// Placeholder images for demo
const placeholderImages = [
  {
    id: '1',
    title: 'Mythic Gnarlroot Kill',
    description: 'Unser erster Mythic Kill in Amirdrassil!',
    image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop',
    category: 'kills',
    created_at: '2023-11-15'
  },
  {
    id: '2',
    title: 'Epic Wipe Compilation',
    description: 'Die besten (schlechtesten) Momente unserer Raids',
    image_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop',
    category: 'fun',
    created_at: '2023-11-10'
  },
  {
    id: '3',
    title: 'Gildentreffen 2023',
    description: 'Real Life Treffen in München - Epic!',
    image_url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop',
    category: 'events',
    created_at: '2023-10-20'
  },
  {
    id: '4',
    title: 'Igira der Grausame Down',
    description: 'Zweiter Mythic Boss gefallen!',
    image_url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=300&fit=crop',
    category: 'kills',
    created_at: '2023-11-22'
  },
  {
    id: '5',
    title: 'Guild Photo Shoot',
    description: 'Alle zusammen vor Orgrimmar',
    image_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=300&fit=crop',
    category: 'fun',
    created_at: '2023-09-15'
  },
  {
    id: '6',
    title: 'Oktoberfest Guild Event',
    description: 'Prost! Guild Event in München',
    image_url: 'https://images.unsplash.com/photo-1544198365-f5d60b6d8190?w=400&h=300&fit=crop',
    category: 'events',
    created_at: '2023-10-01'
  },
  {
    id: '7',
    title: 'Volcoross Victory',
    description: 'Dritter Mythic Boss im Sack!',
    image_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&h=300&fit=crop',
    category: 'kills',
    created_at: '2023-11-29'
  },
  {
    id: '8',
    title: 'Funny Raid Moments',
    description: 'Wenn der Tank vergisst zu tanken...',
    image_url: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=300&fit=crop',
    category: 'fun',
    created_at: '2023-11-05'
  }
]

export default function GallerySection() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadGallery()
  }, [])

  const loadGallery = async () => {
    try {
      // Try to load from API, fallback to placeholder data
      const response = await fetch('/api/gallery')
      if (response.ok) {
        const data = await response.json()
        setGalleryItems(data.gallery?.length > 0 ? data.gallery : placeholderImages)
      } else {
        setGalleryItems(placeholderImages)
      }
    } catch (error) {
      console.error('Error loading gallery:', error)
      setGalleryItems(placeholderImages)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredItems = galleryItems.filter(item => {
    if (activeFilter === 'all') return true
    return item.category === activeFilter
  })

  const filters = [
    { key: 'all', label: 'Alle', icon: Image, count: galleryItems.length },
    { key: 'kills', label: 'First Kills', icon: Trophy, count: galleryItems.filter(i => i.category === 'kills').length },
    { key: 'fun', label: 'Fun Pics', icon: Users, count: galleryItems.filter(i => i.category === 'fun').length },
    { key: 'events', label: 'Events', icon: Calendar, count: galleryItems.filter(i => i.category === 'events').length }
  ]

  if (isLoading) {
    return (
      <section id="gallery" className="py-20 bg-gray-800">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading gallery...</p>
        </div>
      </section>
    )
  }

  return (
    <section id="gallery" className="py-20 bg-gray-800">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white font-serif">
          Galerie
        </h2>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {filters.map((filter) => {
            const Icon = filter.icon
            return (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeFilter === filter.key
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Icon className="w-5 h-5 mr-2" />
                {filter.label} ({filter.count})
              </button>
            )
          })}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group relative bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-700 hover:border-red-600/50"
              onClick={() => setSelectedImage(item)}
            >
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-bold text-lg mb-1">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-gray-200 text-sm">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Category Badge */}
              <div className="absolute top-3 left-3">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium text-white ${
                  item.category === 'kills' ? 'bg-green-600' :
                  item.category === 'fun' ? 'bg-purple-600' :
                  item.category === 'events' ? 'bg-blue-600' :
                  'bg-gray-600'
                }`}>
                  {item.category === 'kills' ? 'Kill' :
                   item.category === 'fun' ? 'Fun' :
                   item.category === 'events' ? 'Event' : item.category}
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            <Image className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Keine Bilder in dieser Kategorie</p>
          </div>
        )}
      </div>

      {/* Modal for selected image */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-red-400 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              <img
                src={selectedImage.image_url}
                alt={selectedImage.title}
                className="w-full max-h-[70vh] object-contain"
              />
              <div className="p-6">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {selectedImage.title}
                </h3>
                {selectedImage.description && (
                  <p className="text-gray-300 mb-4">
                    {selectedImage.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span className="capitalize">
                    Kategorie: {selectedImage.category}
                  </span>
                  <span>
                    {new Date(selectedImage.created_at).toLocaleDateString('de-DE')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

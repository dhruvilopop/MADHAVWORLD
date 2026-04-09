'use client'

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, ZoomIn, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'

interface GalleryImage {
  id: string
  title: string
  description: string | null
  image: string
  category: string
}

const categoryLabels: Record<string, string> = {
  factory: 'Factory',
  team: 'Our Team',
  product: 'Products',
  process: 'Manufacturing Process',
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/gallery')
      .then(r => r.json())
      .then(data => {
        setImages(data)
        setIsLoading(false)
      })
      .catch(console.error)
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-50 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-200/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-orange-200/30 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
                Our Gallery
              </span>
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Take a visual tour of our state-of-the-art manufacturing facility, dedicated team, and premium products
            </p>
          </motion.div>
        </div>
      </section>

      {/* Gallery Horizontal Scroll */}
      <section className="py-12">
        <div className="container mx-auto px-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Gallery</h2>
              <p className="text-gray-600">{images.length} images</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll('left')}
                className="h-12 w-12 rounded-full border-amber-300 hover:bg-amber-50"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll('right')}
                className="h-12 w-12 rounded-full border-amber-300 hover:bg-amber-50"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex gap-6 px-4 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-80">
                <div className="bg-gray-200 rounded-2xl aspect-square animate-pulse" />
              </div>
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No images found</h3>
            <p className="text-gray-500">Gallery images will appear here once added</p>
          </div>
        ) : (
          <div 
            ref={scrollRef}
            className="flex gap-6 px-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar"
            style={{ scrollBehavior: 'smooth' }}
          >
            <div className="w-4 flex-shrink-0" /> {/* Left padding */}
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex-shrink-0 w-80 snap-start"
              >
                <div 
                  className="group relative overflow-hidden rounded-2xl aspect-square cursor-pointer"
                  onClick={() => setSelectedImage(image)}
                >
                  <img
                    src={image.image}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <ZoomIn className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                    <span className="text-amber-400 text-sm font-medium uppercase tracking-wider">
                      {categoryLabels[image.category] || image.category}
                    </span>
                    <h3 className="text-white text-xl font-semibold mt-1">{image.title}</h3>
                    {image.description && (
                      <p className="text-white/70 text-sm mt-2 line-clamp-2">{image.description}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            <div className="w-4 flex-shrink-0" /> {/* Right padding */}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Want to Visit Our Factory?
          </h2>
          <p className="text-white/90 mb-6 max-w-xl mx-auto">
            Schedule a visit to see our manufacturing process firsthand.
          </p>
          <Button size="lg" className="bg-white text-amber-700 hover:bg-gray-100">
            Schedule Visit
          </Button>
        </div>
      </section>

      {/* Image Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0 bg-transparent border-0 overflow-hidden">
          {selectedImage && (
            <div className="relative">
              <img
                src={selectedImage.image}
                alt={selectedImage.title}
                className="w-full max-h-[80vh] object-contain rounded-2xl"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-2xl">
                <span className="text-amber-400 text-sm font-medium uppercase tracking-wider">
                  {categoryLabels[selectedImage.category] || selectedImage.category}
                </span>
                <h3 className="text-white text-2xl font-semibold mt-1">{selectedImage.title}</h3>
                {selectedImage.description && (
                  <p className="text-white/70 mt-2">{selectedImage.description}</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

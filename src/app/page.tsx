'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { 
  ArrowRight, ChevronLeft, ChevronRight, 
  Phone, Mail, MapPin, Send, Loader2, Palette,
  Star, ShoppingBag, Globe, Award, Users, TrendingUp,
  ChevronDown, Factory, RotateCcw, ZoomIn, Move
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import LogoLoader from '@/components/layout/LogoLoader'

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// Types
interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number | null
  image: string
  material: string | null
  categoryId: string | null
  Category?: { id: string; name: string; slug: string }
}

interface GalleryImage {
  id: string
  title: string
  image: string
  category: string
}

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  _count?: { Product: number }
}

interface Settings {
  companyName: string
  description: string | null
  address: string | null
  phone: string | null
  email: string | null
}

interface CustomizerOption {
  id: string
  category: string
  name: string
  value: string
  image: string | null
  isActive: boolean
  sortOrder: number
}

interface CustomizerConfig {
  id: string
  step: string
  isEnabled: boolean
  isRequired: boolean
  sortOrder: number
}

// Hero Bags Data
const heroBags = [
  { id: 1, name: 'Premium Tote Bag', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600', color: '#8B4513', price: '₹2,499', tag: 'Best Seller' },
  { id: 2, name: 'Elegant Shoulder Bag', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600', color: '#1a1a1a', price: '₹3,299', tag: 'New Arrival' },
  { id: 3, name: 'Classic Handbag', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600', color: '#D2B48C', price: '₹2,999', tag: 'Premium' },
  { id: 4, name: 'Modern Backpack', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600', color: '#1e3a5f', price: '₹3,799', tag: 'Trending' },
  { id: 5, name: 'Chic Crossbody', image: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=600', color: '#800000', price: '₹2,199', tag: 'Popular' },
]

// Features Data
const features = [
  { icon: Globe, title: 'Global Reach', description: 'Exporting to 30+ countries', color: 'from-blue-500 to-blue-600' },
  { icon: Award, title: 'Premium Quality', description: 'ISO certified manufacturing', color: 'from-amber-500 to-amber-600' },
  { icon: Users, title: '500+ Clients', description: 'Trusted by businesses', color: 'from-rose-500 to-rose-600' },
  { icon: TrendingUp, title: '28+ Years', description: 'Decades of excellence', color: 'from-emerald-500 to-emerald-600' },
]

// 3D Bag Preview Component - Realistic Preview
function Bag3DPreview({ selectedOptions, options }: { selectedOptions: Record<string, string>, options: CustomizerOption[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [zoom, setZoom] = useState(1)
  const lastMousePos = useRef({ x: 0, y: 0 })

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    lastMousePos.current = { x: e.clientX, y: e.clientY }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const deltaX = e.clientX - lastMousePos.current.x
    const deltaY = e.clientY - lastMousePos.current.y
    setRotation(prev => ({
      x: Math.max(-30, Math.min(30, prev.x - deltaY * 0.5)),
      y: prev.y + deltaX * 0.5
    }))
    lastMousePos.current = { x: e.clientX, y: e.clientY }
  }

  const handleMouseUp = () => setIsDragging(false)

  const resetView = () => {
    setRotation({ x: 0, y: 0 })
    setZoom(1)
  }

  // Get selected color
  const optionsArray = Array.isArray(options) ? options : []
  const selectedColor = optionsArray.find(o => o.category === 'color' && o.value === selectedOptions.color)?.value || '#8B4513'
  
  // Get selected style image
  const selectedStyleImage = optionsArray.find(o => o.category === 'style' && o.value === selectedOptions.style)?.image || heroBags[0].image

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[400px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
      style={{ perspective: '1500px' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Background Glow */}
      <motion.div
        className="absolute w-[350px] h-[350px] rounded-full"
        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 4, repeat: Infinity }}
        style={{
          background: `radial-gradient(circle, ${selectedColor}40 0%, transparent 70%)`,
        }}
      />

      {/* 3D Bag Container */}
      <motion.div
        className="relative"
        animate={{ 
          rotateX: rotation.x,
          rotateY: rotation.y,
          scale: zoom,
        }}
        transition={{ type: 'spring', stiffness: 150, damping: 15 }}
        style={{ 
          transformStyle: 'preserve-3d',
          transformOrigin: 'center center',
        }}
      >
        {/* Main Bag Face */}
        <div 
          className="relative w-[220px] h-[280px] rounded-[20px] overflow-hidden shadow-2xl"
          style={{
            boxShadow: `0 40px 80px -20px ${selectedColor}50, 0 20px 40px -20px rgba(0,0,0,0.3)`,
            transform: 'translateZ(20px)',
          }}
        >
          {/* Bag Image */}
          <img 
            src={selectedStyleImage} 
            alt="Bag Preview" 
            className="w-full h-full object-cover"
            style={{ filter: `brightness(1.1) saturate(1.1)` }}
          />
          
          {/* Color Overlay */}
          <div 
            className="absolute inset-0 mix-blend-multiply opacity-30"
            style={{ backgroundColor: selectedColor }}
          />
          
          {/* Highlight */}
          <div 
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)`,
            }}
          />
        </div>

        {/* Side (3D depth) */}
        <div 
          className="absolute top-0 right-0 w-[40px] h-[280px] origin-left rounded-r-[20px]"
          style={{
            background: `linear-gradient(to right, ${selectedColor}d0, ${selectedColor}80)`,
            transform: 'rotateY(90deg) translateZ(0px) translateX(-20px)',
            boxShadow: 'inset -5px 0 15px rgba(0,0,0,0.2)',
          }}
        />

        {/* Bottom */}
        <div 
          className="absolute bottom-0 left-0 w-[220px] h-[40px] origin-top rounded-b-[20px]"
          style={{
            background: `linear-gradient(to bottom, ${selectedColor}c0, ${selectedColor}90)`,
            transform: 'rotateX(-90deg) translateZ(0px) translateY(20px)',
          }}
        />

        {/* Handle */}
        {selectedOptions.handle && selectedOptions.handle !== 'none' && (
          <div 
            className="absolute -top-[60px] left-1/2 -translate-x-1/2 w-[100px] h-[70px] rounded-t-full"
            style={{
              border: `8px solid ${selectedColor}`,
              borderBottom: 'none',
              transform: 'translateZ(25px)',
            }}
          />
        )}
      </motion.div>

      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
        <button onClick={resetView} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <RotateCcw className="w-4 h-4 text-gray-600" />
        </button>
        <button onClick={() => setZoom(z => Math.min(1.5, z + 0.1))} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ZoomIn className="w-4 h-4 text-gray-600" />
        </button>
        <div className="text-xs text-gray-500 flex items-center gap-1">
          <Move className="w-3 h-3" />
          Drag to rotate
        </div>
      </div>
    </div>
  )
}

// Immersive Hero Section
function ImmersiveHero({ currentBag, settings }: { currentBag: typeof heroBags[0], settings: Settings | null }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10])
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10])
  
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (rect) {
      mouseX.set(e.clientX - rect.left - rect.width / 2)
      mouseY.set(e.clientY - rect.top - rect.height / 2)
    }
  }, [mouseX, mouseY])

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ perspective: '2000px' }}
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-gray-100" />
        <motion.div
          className="absolute inset-0 opacity-50"
          animate={{
            background: [
              'radial-gradient(circle at 20% 30%, rgba(245,158,11,0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 70%, rgba(245,158,11,0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 30%, rgba(245,158,11,0.1) 0%, transparent 50%)',
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <div className="container mx-auto px-6 relative z-10 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="space-y-6"
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-3 px-5 py-2.5 bg-amber-50 border border-amber-100 rounded-full"
            >
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2.5 h-2.5 rounded-full bg-amber-500"
              />
              <span className="text-sm font-medium text-amber-700">Premium Quality Since 1995</span>
            </motion.div>

            <div className="space-y-2">
              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight"
              >
                Craft Your
              </motion.h1>
              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Perfect Bag
              </motion.h1>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-lg text-gray-600 max-w-md leading-relaxed"
            >
              {settings?.description || 'Create custom bags that match your unique style. Premium materials, expert craftsmanship.'}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex gap-10"
            >
              {[
                { value: '28+', label: 'Years' },
                { value: '10K+', label: 'Products' },
                { value: '500+', label: 'Clients' },
              ].map((stat, i) => (
                <div key={i}>
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => document.querySelector('#customizer')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-2 px-7 py-3.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-all shadow-lg"
              >
                <Palette className="w-5 h-5" />
                Customize Now
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => document.querySelector('#products')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-2 px-7 py-3.5 bg-white text-gray-700 rounded-xl font-medium border border-gray-200 hover:border-gray-300 transition-all"
              >
                View Products
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Right - 3D Bag */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
            style={{ rotateX, rotateY }}
            className="relative flex items-center justify-center"
          >
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <motion.div
                key={currentBag.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5 }}
                className="relative w-[300px] md:w-[350px] aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl"
                style={{
                  boxShadow: `0 50px 100px -30px ${currentBag.color}40`,
                }}
              >
                <img src={currentBag.image} alt={currentBag.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <Badge className="bg-white/90 text-gray-700 mb-2">{currentBag.tag}</Badge>
                  <h3 className="text-xl font-bold text-white">{currentBag.name}</h3>
                  <p className="text-white/80 text-lg font-semibold mt-1">{currentBag.price}</p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center gap-2 text-gray-400"
        >
          <span className="text-sm">Scroll to explore</span>
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </section>
  )
}

// Horizontal Products Section with Category Tabs
function HorizontalProductsSection({ products, selectedCategory, categories, onSelectCategory }: { 
  products: Product[], 
  selectedCategory: string | null, 
  categories: Category[],
  onSelectCategory: (id: string | null) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  // Filter products by selected category
  const filteredProducts = selectedCategory 
    ? products.filter(p => p.categoryId === selectedCategory)
    : products

  // Get category name for heading
  const selectedCategoryName = selectedCategory 
    ? categories.find(c => c.id === selectedCategory)?.name 
    : null

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 10)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (el) {
      el.addEventListener('scroll', checkScroll)
      checkScroll()
      return () => el.removeEventListener('scroll', checkScroll)
    }
  }, [checkScroll, filteredProducts])

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320
      scrollRef.current.scrollBy({ left: dir === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <section id="products" className="relative py-16 md:py-24 bg-white overflow-hidden">
      {/* Centered Heading */}
      <div className="text-center mb-6 md:mb-8 px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900"
        >
          Products
        </motion.h2>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap justify-center gap-2 md:gap-3 px-4 mb-8 md:mb-10">
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onClick={() => onSelectCategory(null)}
          className={`px-4 py-2 md:px-6 md:py-2.5 rounded-full text-sm md:text-base font-medium transition-all ${
            selectedCategory === null 
              ? 'bg-amber-500 text-white shadow-lg' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All
        </motion.button>
        {categories.map((category, index) => (
          <motion.button
            key={category.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelectCategory(category.id)}
            className={`px-4 py-2 md:px-6 md:py-2.5 rounded-full text-sm md:text-base font-medium transition-all ${
              selectedCategory === category.id 
                ? 'bg-amber-500 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category.name}
          </motion.button>
        ))}
      </div>

      {/* Products Row with Side Arrows */}
      <div className="flex items-center justify-center gap-3 md:gap-6 px-4 md:px-8">
        {/* Left Arrow */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          className={`flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all z-10 ${
            canScrollLeft 
              ? 'bg-white border-2 border-gray-200 hover:border-amber-500 hover:bg-amber-50 text-gray-700 shadow-lg' 
              : 'bg-gray-50 border-2 border-gray-100 text-gray-300 cursor-not-allowed'
          }`}
        >
          <ChevronLeft className="w-6 h-6 md:w-7 md:h-7" />
        </motion.button>

        {/* Products Container */}
        <div 
          ref={scrollRef}
          className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide flex-1 max-w-7xl"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex-shrink-0 w-[260px] sm:w-[280px] md:w-[300px] lg:w-[320px] scroll-snap-start"
              >
                <Link href={`/products/${product.slug}`}>
                  <Card className="overflow-hidden border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 bg-white rounded-xl h-full group cursor-pointer">
                    <div className="relative aspect-square overflow-hidden bg-gray-50">
                      <motion.img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                      />
                      {product.Category && (
                        <Badge className="absolute top-3 left-3 bg-white/95 text-gray-700 text-xs md:text-sm">
                          {product.Category.name}
                        </Badge>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="bg-white text-gray-900 px-4 py-2 rounded-full font-medium text-sm">View Details</span>
                      </div>
                    </div>
                    <CardContent className="p-4 md:p-5">
                      <h3 className="font-semibold text-gray-800 text-base md:text-lg mb-1 truncate group-hover:text-amber-600 transition-colors">{product.name}</h3>
                      <p className="text-gray-400 text-sm line-clamp-1 mb-3">{product.description}</p>
                      <div className="flex items-center justify-between">
                        {product.price ? (
                          <span className="font-bold text-xl md:text-2xl text-amber-600">₹{product.price.toLocaleString()}</span>
                        ) : (
                          <span className="text-amber-600 font-medium text-sm">Price on Request</span>
                        )}
                        {product.material && (
                          <span className="text-xs md:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{product.material}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))
          ) : (
            <div className="flex items-center justify-center w-full py-12">
              <p className="text-gray-400 text-lg">No products found in this category</p>
            </div>
          )}
        </div>

        {/* Right Arrow */}
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          onClick={() => scroll('right')}
          disabled={!canScrollRight || filteredProducts.length === 0}
          className={`flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all z-10 ${
            canScrollRight && filteredProducts.length > 0
              ? 'bg-white border-2 border-gray-200 hover:border-amber-500 hover:bg-amber-50 text-gray-700 shadow-lg' 
              : 'bg-gray-50 border-2 border-gray-100 text-gray-300 cursor-not-allowed'
          }`}
        >
          <ChevronRight className="w-6 h-6 md:w-7 md:h-7" />
        </motion.button>
      </div>

      {/* Scroll indicator */}
      {filteredProducts.length > 4 && (
        <p className="text-sm md:text-base text-gray-400 text-center mt-8">Use arrows to see more products</p>
      )}
    </section>
  )
}

// Horizontal Gallery Section - Only 4 visible
function HorizontalGallerySection({ gallery }: { gallery: GalleryImage[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 10)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (el) {
      el.addEventListener('scroll', checkScroll)
      checkScroll()
      return () => el.removeEventListener('scroll', checkScroll)
    }
  }, [checkScroll, gallery])

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320
      scrollRef.current.scrollBy({ left: dir === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <section id="gallery" className="relative py-16 md:py-24 bg-gray-50 overflow-hidden">
      {/* Centered Heading */}
      <div className="text-center mb-10 md:mb-12 px-4">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-amber-600 font-medium"
        >
          Our Work
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mt-2"
        >
          Gallery
        </motion.h2>
      </div>

      {/* Gallery Row with Side Arrows */}
      <div className="flex items-center justify-center gap-3 md:gap-6 px-4 md:px-8">
        {/* Left Arrow */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          className={`flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all z-10 ${
            canScrollLeft 
              ? 'bg-white border-2 border-gray-200 hover:border-amber-500 hover:bg-amber-50 text-gray-700 shadow-lg' 
              : 'bg-gray-100 border-2 border-gray-200 text-gray-300 cursor-not-allowed'
          }`}
        >
          <ChevronLeft className="w-6 h-6 md:w-7 md:h-7" />
        </motion.button>

        {/* Gallery Container */}
        <div 
          ref={scrollRef}
          className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide flex-1 max-w-7xl"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {gallery.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="flex-shrink-0 w-[260px] sm:w-[280px] md:w-[300px] lg:w-[320px] scroll-snap-start"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 md:p-5">
                  <span className="text-white font-medium text-base md:text-lg">{item.title}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Right Arrow */}
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          className={`flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all z-10 ${
            canScrollRight 
              ? 'bg-white border-2 border-gray-200 hover:border-amber-500 hover:bg-amber-50 text-gray-700 shadow-lg' 
              : 'bg-gray-100 border-2 border-gray-200 text-gray-300 cursor-not-allowed'
          }`}
        >
          <ChevronRight className="w-6 h-6 md:w-7 md:h-7" />
        </motion.button>
      </div>

      {/* Scroll indicator */}
      {gallery.length > 4 && (
        <p className="text-sm md:text-base text-gray-400 text-center mt-8">Use arrows to see more images</p>
      )}
    </section>
  )
}

// Interactive Customizer with 3D Preview
function CustomizerSection({ 
  formData, 
  setFormData, 
  isSubmitting, 
  onSubmit,
  options,
  configs
}: { 
  formData: { name: string; email: string; phone: string }
  setFormData: (data: { name: string; email: string; phone: string }) => void
  isSubmitting: boolean
  onSubmit: () => void
  options: CustomizerOption[]
  configs: CustomizerConfig[]
}) {
  const [step, setStep] = useState(0)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})

  // Filter enabled steps and sort them
  const enabledSteps = (configs || [])
    .filter(c => c.isEnabled)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(c => c.step)

  // Add contact step at the end
  const allSteps = [...enabledSteps, 'contact']

  // Get options for a category - handle both array and object formats
  const getOptions = (category: string) => {
    const optionsArray = Array.isArray(options) ? options : []
    return optionsArray.filter(o => o.category === category && o.isActive).sort((a, b) => a.sortOrder - b.sortOrder)
  }

  const handleSelect = (category: string, value: string) => {
    setSelectedOptions(prev => ({ ...prev, [category]: value }))
    // Move to next step
    const currentIndex = allSteps.indexOf(category)
    if (currentIndex < allSteps.length - 1) {
      setStep(currentIndex + 1)
    }
  }

  const currentStep = allSteps[step]

  const renderStepContent = () => {
    switch (currentStep) {
      case 'style':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white text-center">Choose Your Style</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {getOptions('style').map((option) => (
                <motion.button
                  key={option.id}
                  onClick={() => handleSelect('style', option.value)}
                  whileHover={{ scale: 1.03, y: -5 }}
                  whileTap={{ scale: 0.97 }}
                  className={`relative rounded-2xl overflow-hidden ${selectedOptions.style === option.value ? 'ring-2 ring-amber-500' : ''}`}
                >
                  {option.image ? (
                    <img src={option.image} alt={option.name} className="w-full h-32 object-cover" />
                  ) : (
                    <div className="w-full h-32 bg-gray-700 flex items-center justify-center">
                      <ShoppingBag className="w-10 h-10 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <span className="absolute bottom-3 left-3 text-white font-medium">{option.name}</span>
                </motion.button>
              ))}
            </div>
          </div>
        )

      case 'color':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white text-center">Select Color</h3>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
              {getOptions('color').map((option) => (
                <motion.button
                  key={option.id}
                  onClick={() => handleSelect('color', option.value)}
                  whileHover={{ scale: 1.1, y: -5 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex flex-col items-center gap-2 p-3"
                >
                  <div
                    className="w-14 h-14 rounded-full border-4 border-white/20 shadow-lg"
                    style={{ backgroundColor: option.value }}
                  />
                  <span className="text-white text-sm">{option.name}</span>
                </motion.button>
              ))}
            </div>
          </div>
        )

      case 'material':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white text-center">Choose Material</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {getOptions('material').map((option) => (
                <motion.button
                  key={option.id}
                  onClick={() => handleSelect('material', option.value)}
                  whileHover={{ scale: 1.02, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-5 rounded-2xl border-2 text-center ${selectedOptions.material === option.value ? 'border-amber-500 bg-amber-500/10' : 'border-white/10 hover:border-white/30'}`}
                >
                  <span className="font-semibold text-white text-lg">{option.name}</span>
                </motion.button>
              ))}
            </div>
          </div>
        )

      case 'size':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white text-center">Select Size</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {getOptions('size').map((option) => (
                <motion.button
                  key={option.id}
                  onClick={() => handleSelect('size', option.value)}
                  whileHover={{ scale: 1.03, y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  className={`p-5 rounded-2xl border-2 text-center ${selectedOptions.size === option.value ? 'border-amber-500 bg-amber-500/10' : 'border-white/10 hover:border-white/30'}`}
                >
                  <span className="font-semibold text-white text-xl">{option.name}</span>
                  {option.value && <p className="text-gray-400 text-sm mt-1">{option.value}</p>}
                </motion.button>
              ))}
            </div>
          </div>
        )

      case 'handle':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white text-center">Select Handle Type</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {getOptions('handle').map((option) => (
                <motion.button
                  key={option.id}
                  onClick={() => handleSelect('handle', option.value)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-5 rounded-2xl border-2 text-center ${selectedOptions.handle === option.value ? 'border-amber-500 bg-amber-500/10' : 'border-white/10 hover:border-white/30'}`}
                >
                  <span className="font-semibold text-white">{option.name}</span>
                </motion.button>
              ))}
            </div>
          </div>
        )

      case 'print':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white text-center">Select Print Option</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {getOptions('print').map((option) => (
                <motion.button
                  key={option.id}
                  onClick={() => handleSelect('print', option.value)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`p-5 rounded-2xl border-2 text-center ${selectedOptions.print === option.value ? 'border-amber-500 bg-amber-500/10' : 'border-white/10 hover:border-white/30'}`}
                >
                  <span className="font-semibold text-white">{option.name}</span>
                </motion.button>
              ))}
            </div>
          </div>
        )

      case 'contact':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white text-center mb-6">Your Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Your Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-12 rounded-xl"
                required
              />
              <Input
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-12 rounded-xl"
                required
              />
              <Input
                placeholder="Email (Optional)"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-12 rounded-xl md:col-span-2"
              />
            </div>
            <Button
              onClick={onSubmit}
              disabled={isSubmitting || !formData.name || !formData.phone}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white h-14 rounded-xl text-lg font-semibold"
            >
              {isSubmitting ? (
                <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Submitting...</>
              ) : (
                <>Submit Inquiry <ArrowRight className="w-5 h-5 ml-2" /></>
              )}
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <section id="customizer" className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
      
      {/* Particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-amber-400 rounded-full"
          style={{ left: `${(i * 7) % 100}%`, top: `${(i * 11) % 100}%` }}
          animate={{ y: [0, -30, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 3 + (i % 3), repeat: Infinity, delay: i * 0.3 }}
        />
      ))}

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <span className="text-amber-400 font-medium">Design Your Own</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-2">Bag Customizer</h2>
        </div>

        {/* Progress */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-2">
            {allSteps.map((s, i) => (
              <div key={s} className="flex items-center">
                <motion.div
                  animate={{
                    scale: step === i ? 1.2 : 1,
                    backgroundColor: step >= i ? '#f59e0b' : '#374151',
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                >
                  {i + 1}
                </motion.div>
                {i < allSteps.length - 1 && (
                  <div className={`w-10 h-0.5 ${step > i ? 'bg-amber-500' : 'bg-gray-600'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
          {/* 3D Preview */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10"
          >
            <Bag3DPreview selectedOptions={selectedOptions} options={options} />
          </motion.div>

          {/* Step Content */}
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10"
          >
            {renderStepContent()}
          </motion.div>
        </div>

        {/* Back Button */}
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="mt-6 text-gray-400 hover:text-white transition-colors flex items-center gap-2 mx-auto"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        )}
      </div>
    </section>
  )
}

// Features Section
function FeaturesSection() {
  return (
    <section className="relative py-24 bg-white">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-amber-600 font-medium">Why Choose Us</span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-2">Our Strengths</h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className="p-6 text-center border-0 shadow-lg hover:shadow-xl transition-all bg-white rounded-2xl h-full">
                <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Contact Section
function ContactSection({ 
  settings, 
  formData, 
  setFormData, 
  isSubmitting, 
  onSubmit 
}: { 
  settings: Settings | null
  formData: { name: string; email: string; phone: string; subject: string; message: string }
  setFormData: (data: { name: string; email: string; phone: string; subject: string; message: string }) => void
  isSubmitting: boolean
  onSubmit: (e: React.FormEvent) => void
}) {
  return (
    <section id="contact" className="relative py-24 bg-gray-50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-amber-600 font-medium">Get In Touch</span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-2">Contact Us</h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {[
              { icon: MapPin, label: 'Address', value: settings?.address || 'India' },
              { icon: Phone, label: 'Phone', value: settings?.phone || '+91 9876543210' },
              { icon: Mail, label: 'Email', value: settings?.email || 'info@madhavworld.com' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{item.label}</p>
                  <p className="text-gray-900 font-medium">{item.value}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.form
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            onSubmit={onSubmit}
            className="space-y-4 bg-white p-6 rounded-2xl shadow-lg"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Your Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-12 rounded-xl"
                required
              />
              <Input
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="h-12 rounded-xl"
                required
              />
            </div>
            <Input
              placeholder="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="h-12 rounded-xl"
            />
            <Input
              placeholder="Subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="h-12 rounded-xl"
            />
            <Textarea
              placeholder="Your Message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={4}
              className="rounded-xl"
            />
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white h-12 rounded-xl font-semibold"
            >
              {isSubmitting ? (
                <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Sending...</>
              ) : (
                <>Send Message <Send className="w-4 h-4 ml-2" /></>
              )}
            </Button>
          </motion.form>
        </div>
      </div>
    </section>
  )
}

// Main Page Component
export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [gallery, setGallery] = useState<GalleryImage[]>([])
  const [settings, setSettings] = useState<Settings | null>(null)
  const [customizerOptions, setCustomizerOptions] = useState<CustomizerOption[]>([])
  const [customizerConfigs, setCustomizerConfigs] = useState<CustomizerConfig[]>([])
  const [showLoader, setShowLoader] = useState(true)
  const [currentBagIndex, setCurrentBagIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', subject: '', message: ''
  })

  const [customizerFormData, setCustomizerFormData] = useState({
    name: '', email: '', phone: ''
  })

  // Auto-rotate bags
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBagIndex((prev) => (prev + 1) % heroBags.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // Fetch all data
  useEffect(() => {
    Promise.all([
      fetch('/api/products?limit=20').then(r => r.json()),
      fetch('/api/gallery?limit=12').then(r => r.json()),
      fetch('/api/settings').then(r => r.json()),
      fetch('/api/customizer-options').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
    ]).then(([productsData, galleryData, settingsData, optionsResponse, categoriesData]) => {
      setProducts(productsData)
      setGallery(galleryData)
      setSettings(settingsData)
      // API returns { options: [...], config: [...] }
      const optionsArray = Array.isArray(optionsResponse?.options) ? optionsResponse.options : []
      const configsArray = Array.isArray(optionsResponse?.config) ? optionsResponse.config : []
      setCustomizerOptions(optionsArray)
      setCustomizerConfigs(configsArray)
      setCategories(Array.isArray(categoriesData) ? categoriesData : [])
    }).catch(console.error)
  }, [])

  const handleLoaderComplete = useCallback(() => {
    setShowLoader(false)
  }, [])

  const handleCustomizerSubmit = async () => {
    setIsSubmitting(true)
    try {
      const optionsArr = Array.isArray(customizerOptions) ? customizerOptions : []
      const response = await fetch('/api/custom-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...customizerFormData,
          style: optionsArr.find(o => o.category === 'style')?.name || '',
          color: optionsArr.find(o => o.category === 'color')?.name || '',
          material: optionsArr.find(o => o.category === 'material')?.name || '',
          quantity: 100,
        }),
      })
      if (response.ok) {
        toast({ title: 'Inquiry Submitted!', description: 'We will contact you soon.' })
        setCustomizerFormData({ name: '', email: '', phone: '' })
      } else {
        const error = await response.json()
        toast({ title: 'Error', description: error.error || 'Failed to submit', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to submit', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
        toast({ title: 'Message Sent!', description: 'We will get back to you soon.' })
      } else {
        const error = await response.json()
        toast({ title: 'Error', description: error.error || 'Failed to send', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to send', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <LogoLoader onLoadComplete={handleLoaderComplete} settings={settings} />

      <AnimatePresence>
        {!showLoader && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen flex flex-col bg-white"
          >
            <Header />
            
            <main className="flex-1">
              <ImmersiveHero currentBag={heroBags[currentBagIndex]} settings={settings} />
              <HorizontalProductsSection 
                products={products} 
                selectedCategory={selectedCategory}
                categories={categories}
                onSelectCategory={setSelectedCategory}
              />
              <FeaturesSection />
              <CustomizerSection 
                formData={customizerFormData}
                setFormData={setCustomizerFormData}
                isSubmitting={isSubmitting}
                onSubmit={handleCustomizerSubmit}
                options={customizerOptions}
                configs={customizerConfigs}
              />
              <HorizontalGallerySection gallery={gallery} />
              <ContactSection 
                settings={settings}
                formData={formData}
                setFormData={setFormData}
                isSubmitting={isSubmitting}
                onSubmit={handleContactSubmit}
              />
            </main>

            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

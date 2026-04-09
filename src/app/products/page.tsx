'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, ChevronRight, ShoppingBag, Package, 
  Grid3X3, LayoutGrid, Search, Filter, X, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number | null
  image: string
  material: string | null
  stock: number
  isOnSale: boolean
  discountPercent: number
  originalPrice: number | null
  categoryId: string | null
  Category?: { id: string; name: string; slug: string } | null
}

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  _count?: { products: number }
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then(r => r.json()),
      fetch('/api/categories').then(r => r.json())
    ]).then(([productsData, categoriesData]) => {
      setProducts(productsData)
      setCategories(categoriesData)
      setIsLoading(false)
    }).catch(console.error)
  }, [])

  // Filter products by category and search
  const filteredProducts = products.filter(product => {
    const matchesCategory = !selectedCategory || product.categoryId === selectedCategory
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Get selected category name
  const selectedCategoryName = categories.find(c => c.id === selectedCategory)?.name

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -340 : 340,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="relative py-16 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
              className="absolute -top-20 -right-20 w-64 h-64 border border-white/10 rounded-full"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
              className="absolute -bottom-16 -left-16 w-48 h-48 border border-white/10 rounded-full"
            />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <Badge className="mb-4 bg-amber-500/20 text-amber-400 border-amber-500/30">
                <Package className="w-3 h-3 mr-1" />
                Premium Collection
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Our Products
              </h1>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Discover our exquisite collection of handcrafted bags designed for the modern lifestyle
              </p>
            </motion.div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-8 bg-white border-b border-gray-100 sticky top-20 z-30">
          <div className="container mx-auto px-4">
            {/* Search and Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 rounded-xl border-gray-200 focus:border-amber-500"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'bg-amber-500 hover:bg-amber-600' : ''}
                >
                  <Grid3X3 className="w-5 h-5" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'bg-amber-500 hover:bg-amber-600' : ''}
                >
                  <LayoutGrid className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <Button
                variant={selectedCategory === null ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(null)}
                className={`flex-shrink-0 rounded-full ${
                  selectedCategory === null 
                    ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                    : 'border-gray-200 hover:border-amber-300'
                }`}
              >
                All Products
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex-shrink-0 rounded-full ${
                    selectedCategory === category.id 
                      ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                      : 'border-gray-200 hover:border-amber-300'
                  }`}
                >
                  {category.name}
                  {category._count && (
                    <span className="ml-2 text-xs opacity-70">({category._count.products})</span>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedCategoryName || 'All Products'}
                </h2>
                <p className="text-gray-500">{filteredProducts.length} products found</p>
              </div>
              {selectedCategory && (
                <Button
                  variant="ghost"
                  onClick={() => setSelectedCategory(null)}
                  className="text-amber-600 hover:text-amber-700"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear Filter
                </Button>
              )}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                    <div className="aspect-square bg-gray-200 animate-pulse" />
                    <div className="p-5 space-y-3">
                      <div className="bg-gray-200 rounded h-6 w-3/4 animate-pulse" />
                      <div className="bg-gray-200 rounded h-4 w-1/2 animate-pulse" />
                      <div className="bg-gray-200 rounded h-8 w-1/3 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery 
                    ? `No products match "${searchQuery}"`
                    : 'No products in this category yet'}
                </p>
                <Button
                  onClick={() => {
                    setSelectedCategory(null)
                    setSearchQuery('')
                  }}
                  className="bg-amber-500 hover:bg-amber-600"
                >
                  View All Products
                </Button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link href={`/products/${product.slug}`}>
                      <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white rounded-2xl h-full">
                        <div className="relative overflow-hidden aspect-square bg-gray-50">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          
                          {/* Sale Badge */}
                          {product.isOnSale && product.discountPercent > 0 && (
                            <div className="absolute top-3 left-3">
                              <Badge className="bg-rose-500 text-white">
                                -{product.discountPercent}% OFF
                              </Badge>
                            </div>
                          )}
                          
                          {/* Category Badge */}
                          {product.Category && (
                            <div className="absolute top-3 right-3">
                              <Badge className="bg-white/95 text-gray-700 text-xs">
                                {product.Category.name}
                              </Badge>
                            </div>
                          )}
                          
                          {/* Quick View Overlay */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <Button className="bg-white text-gray-900 hover:bg-gray-100">
                              View Details
                            </Button>
                          </div>
                        </div>
                        
                        <CardContent className="p-5">
                          <h3 className="font-semibold text-gray-800 text-lg mb-2 group-hover:text-amber-600 transition-colors line-clamp-1">
                            {product.name}
                          </h3>
                          <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                            {product.description}
                          </p>
                          <div className="flex items-center justify-between">
                            {product.price ? (
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xl text-amber-600">
                                  ₹{product.price.toLocaleString()}
                                </span>
                                {product.isOnSale && product.originalPrice && (
                                  <span className="text-sm text-gray-400 line-through">
                                    ₹{product.originalPrice.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-amber-600 font-medium">Price on Request</span>
                            )}
                            {product.material && (
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                {product.material}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              // List View
              <div className="space-y-4">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link href={`/products/${product.slug}`}>
                      <Card className="flex overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-white rounded-2xl">
                        <div className="relative w-48 flex-shrink-0">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                          {product.isOnSale && product.discountPercent > 0 && (
                            <Badge className="absolute top-2 left-2 bg-rose-500 text-white">
                              -{product.discountPercent}% OFF
                            </Badge>
                          )}
                        </div>
                        <CardContent className="flex-1 p-6">
                          <div className="flex items-start justify-between">
                            <div>
                              {product.Category && (
                                <Badge className="mb-2 bg-amber-100 text-amber-700">
                                  {product.Category.name}
                                </Badge>
                              )}
                              <h3 className="font-semibold text-xl text-gray-800 mb-2 group-hover:text-amber-600">
                                {product.name}
                              </h3>
                              <p className="text-gray-500 line-clamp-2 max-w-lg">
                                {product.description}
                              </p>
                            </div>
                            <div className="text-right">
                              {product.price ? (
                                <>
                                  <span className="font-bold text-2xl text-amber-600">
                                    ₹{product.price.toLocaleString()}
                                  </span>
                                  {product.isOnSale && product.originalPrice && (
                                    <p className="text-sm text-gray-400 line-through">
                                      ₹{product.originalPrice.toLocaleString()}
                                    </p>
                                  )}
                                </>
                              ) : (
                                <span className="text-amber-600 font-medium">Price on Request</span>
                              )}
                            </div>
                          </div>
                          <div className="mt-4 flex items-center gap-4">
                            {product.material && (
                              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                {product.material}
                              </span>
                            )}
                            {product.stock !== undefined && product.stock <= 10 && product.stock > 0 && (
                              <span className="text-sm text-amber-600">
                                Only {product.stock} left!
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Need a Custom Order?
            </h2>
            <p className="text-gray-400 mb-6 max-w-xl mx-auto">
              We specialize in custom designs. Contact us for bulk orders and personalized bags.
            </p>
            <Link href="/#contact">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white">
                Contact Us
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}

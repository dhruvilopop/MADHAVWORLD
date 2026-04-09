'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Package, Loader2, ArrowLeft, Phone, Mail, ChevronRight, Star, Truck, PackageCheck, Boxes } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number | null
  image: string
  images: string | null
  material: string | null
  bagStyle: string | null
  gsm: string | null
  bagSize: string | null
  handleType: string | null
  bagColor: string | null
  printType: string | null
  capacity: string | null
  usageApplication: string | null
  usage: string | null
  bagShape: string | null
  sideGusset: string | null
  finishing: string | null
  productPattern: string | null
  productColor: string | null
  productMaterial: string | null
  minOrderQuantity: number
  productionCapacity: string | null
  deliveryTime: string | null
  packagingDetails: string | null
  stock: number
  isOnSale: boolean
  discountPercent: number
  originalPrice: number | null
  categoryId: string | null
  Category?: { id: string; name: string; slug: string } | null
}

export default function ProductDetailPage() {
  const params = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [allImages, setAllImages] = useState<string[]>([])

  useEffect(() => {
    if (params.slug) {
      fetch(`/api/products/${params.slug}`)
        .then(res => res.json())
        .then(data => {
          setProduct(data.product)
          setRelatedProducts(data.relatedProducts || [])
          
          // Combine main image with additional images
          const images = [data.product.image]
          if (data.product.images) {
            const additionalImages = data.product.images.split(',').filter(Boolean)
            images.push(...additionalImages)
          }
          setAllImages(images)
          setIsLoading(false)
        })
        .catch(err => {
          console.error('Error fetching product:', err)
          setIsLoading(false)
        })
    }
  }, [params.slug])

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-20 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-amber-600" />
        </main>
        <Footer />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-20 flex items-center justify-center">
          <div className="text-center">
            <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
            <p className="text-gray-600 mb-6">The product you are looking for does not exist.</p>
            <Link href="/#products">
              <Button className="bg-amber-600 hover:bg-amber-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Products
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Specifications to display
  const specifications = [
    { label: 'Material', value: product.material },
    { label: 'Bag Style', value: product.bagStyle },
    { label: 'GSM', value: product.gsm },
    { label: 'Bag Size', value: product.bagSize },
    { label: 'Handle Type', value: product.handleType },
    { label: 'Bag Color', value: product.bagColor },
    { label: 'Print Type', value: product.printType },
    { label: 'Capacity', value: product.capacity },
    { label: 'Usage/Application', value: product.usageApplication },
    { label: 'Usage', value: product.usage },
    { label: 'Bag Shape', value: product.bagShape },
    { label: 'Side Gusset', value: product.sideGusset },
    { label: 'Finishing', value: product.finishing },
    { label: 'Product Pattern', value: product.productPattern },
    { label: 'Product Color', value: product.productColor },
    { label: 'Product Material', value: product.productMaterial },
  ].filter(spec => spec.value)

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 pt-20">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <ol className="flex items-center gap-2 text-sm flex-wrap">
              <li>
                <button onClick={() => window.location.href = '/#home'} className="text-gray-500 hover:text-amber-600">
                  Home
                </button>
              </li>
              <li className="text-gray-400">/</li>
              <li>
                <button onClick={() => window.location.href = '/products'} className="text-gray-500 hover:text-amber-600">
                  Products
                </button>
              </li>
              {product.Category && (
                <>
                  <li className="text-gray-400">/</li>
                  <li className="text-gray-500">{product.Category.name}</li>
                </>
              )}
              <li className="text-gray-400">/</li>
              <li className="text-amber-600 font-medium truncate max-w-[200px]">{product.name}</li>
            </ol>
          </nav>

          {/* Product Detail Section */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Left Side - Image Gallery */}
              <div className="p-6 lg:p-8 bg-gray-50">
                <div className="sticky top-24">
                  {/* Main Image */}
                  <motion.div
                    key={selectedImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="relative aspect-square rounded-xl overflow-hidden bg-white shadow-md mb-4"
                  >
                    <img
                      src={allImages[selectedImage]}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                    
                    {/* Sale Badge */}
                    {product.isOnSale && product.discountPercent > 0 && (
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-rose-500 text-white text-sm px-3 py-1">
                          -{product.discountPercent}% OFF
                        </Badge>
                      </div>
                    )}
                  </motion.div>

                  {/* Thumbnail Gallery */}
                  {allImages.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {allImages.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            selectedImage === index
                              ? 'border-amber-500 shadow-md'
                              : 'border-gray-200 hover:border-amber-300'
                          }`}
                        >
                          <img
                            src={img}
                            alt={`${product.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side - Product Details */}
              <div className="p-6 lg:p-8">
                <div className="space-y-6">
                  {/* Category Badge */}
                  {product.Category && (
                    <Link href={`/products?category=${product.Category.slug}`}>
                      <span className="inline-block px-4 py-1.5 bg-amber-100 text-amber-700 text-sm font-medium rounded-full hover:bg-amber-200 transition-colors cursor-pointer">
                        {product.Category.name}
                      </span>
                    </Link>
                  )}

                  {/* Product Name */}
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                    {product.name}
                  </h1>

                  {/* Rating (demo) */}
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-gray-500 text-sm">(4.9 · 128 reviews)</span>
                  </div>

                  {/* Price & MOQ */}
                  <div className="space-y-2">
                    {product.price ? (
                      <div className="flex items-baseline gap-3 flex-wrap">
                        <span className="text-4xl font-bold text-amber-600">
                          ₹{product.price.toLocaleString()}
                        </span>
                        {product.isOnSale && product.originalPrice && (
                          <span className="text-xl text-gray-400 line-through">
                            ₹{product.originalPrice.toLocaleString()}
                          </span>
                        )}
                        <span className="text-gray-500 text-sm">/Piece</span>
                      </div>
                    ) : (
                      <span className="text-2xl text-amber-600 font-medium">Get Latest Price</span>
                    )}
                    
                    {product.minOrderQuantity > 0 && (
                      <p className="text-sm text-gray-500">
                        Minimum Order Quantity: <span className="font-semibold text-gray-700">{product.minOrderQuantity.toLocaleString()} Piece</span>
                      </p>
                    )}
                  </div>

                  {/* Stock Status */}
                  {product.stock !== undefined && (
                    <div className="flex items-center gap-2">
                      {product.stock > 0 ? (
                        <Badge className="bg-emerald-100 text-emerald-700">
                          In Stock ({product.stock} available)
                        </Badge>
                      ) : (
                        <Badge className="bg-rose-100 text-rose-700">
                          Out of Stock
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {product.description}
                  </p>

                  {/* Specifications Table */}
                  {specifications.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Product Specifications
                      </h3>
                      <div className="grid gap-2">
                        {specifications.map((spec, index) => (
                          <div
                            key={index}
                            className={`flex py-2.5 px-3 rounded-lg ${
                              index % 2 === 0 ? 'bg-white' : 'bg-transparent'
                            }`}
                          >
                            <span className="w-1/3 text-gray-500 text-sm font-medium">
                              {spec.label}
                            </span>
                            <span className="w-2/3 text-gray-900 text-sm font-medium">
                              {spec.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button
                      size="lg"
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-white gap-2"
                      onClick={() => window.location.href = '/#contact'}
                    >
                      <Phone className="w-5 h-5" />
                      Enquire Now
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="flex-1 border-amber-500 text-amber-600 hover:bg-amber-50 gap-2"
                      onClick={() => window.location.href = '/#contact'}
                    >
                      <Mail className="w-5 h-5" />
                      Get Quote
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          {(product.productionCapacity || product.deliveryTime || product.packagingDetails) && (
            <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 lg:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Additional Information</h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                {product.productionCapacity && (
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Boxes className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Production Capacity</h4>
                      <p className="text-gray-600 text-sm mt-1">{product.productionCapacity}</p>
                    </div>
                  </div>
                )}
                
                {product.deliveryTime && (
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Truck className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Delivery Time</h4>
                      <p className="text-gray-600 text-sm mt-1">{product.deliveryTime}</p>
                    </div>
                  </div>
                )}
                
                {product.packagingDetails && (
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl md:col-span-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <PackageCheck className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Packaging Details</h4>
                      <p className="text-gray-600 text-sm mt-1 whitespace-pre-line">{product.packagingDetails}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Suggested Products Section */}
          {relatedProducts.length > 0 && (
            <section className="mt-16">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">You May Also Like</h2>
                  <p className="text-gray-500">Similar products you might be interested in</p>
                </div>
                <Link href="/products">
                  <Button variant="outline" className="gap-2 border-amber-300 text-amber-600 hover:bg-amber-50">
                    View All <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.slice(0, 4).map((relatedProduct, index) => (
                  <motion.div
                    key={relatedProduct.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link href={`/products/${relatedProduct.slug}`}>
                      <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white rounded-2xl h-full">
                        <div className="relative overflow-hidden aspect-square bg-gray-50">
                          <img
                            src={relatedProduct.image}
                            alt={relatedProduct.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          
                          {relatedProduct.isOnSale && relatedProduct.discountPercent > 0 && (
                            <Badge className="absolute top-3 left-3 bg-rose-500 text-white">
                              -{relatedProduct.discountPercent}% OFF
                            </Badge>
                          )}
                          
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <Button className="bg-white text-gray-900 hover:bg-gray-100">
                              View Details
                            </Button>
                          </div>
                        </div>
                        
                        <CardContent className="p-5">
                          <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-amber-600 transition-colors line-clamp-1">
                            {relatedProduct.name}
                          </h3>
                          <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                            {relatedProduct.description}
                          </p>
                          <div className="flex items-center justify-between">
                            {relatedProduct.price ? (
                              <span className="font-bold text-lg text-amber-600">
                                ₹{relatedProduct.price.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-amber-600 font-medium text-sm">Price on Request</span>
                            )}
                            {relatedProduct.material && (
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                {relatedProduct.material}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Back to Products */}
          <div className="mt-12 text-center">
            <Link href="/products">
              <Button variant="outline" className="gap-2 border-gray-300 hover:border-amber-300">
                <ArrowLeft className="w-4 h-4" />
                Back to All Products
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, Eye, Search, Loader2, ChevronDown, ChevronUp, FolderPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ImageUpload, MultiImageUpload } from '@/components/ui/image-upload'
import { useToast } from '@/hooks/use-toast'

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
  categoryId: string | null
  isActive: boolean
  isFeatured: boolean
  category?: { name: string }
}

interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
  image?: string | null
  _count?: { products: number }
}

const defaultFormData = {
  name: '',
  description: '',
  price: '',
  image: '',
  images: [] as string[],
  material: '',
  bagStyle: '',
  gsm: '',
  bagSize: '',
  handleType: '',
  bagColor: '',
  printType: '',
  capacity: '',
  usageApplication: '',
  usage: '',
  bagShape: '',
  sideGusset: '',
  finishing: '',
  productPattern: '',
  productColor: '',
  productMaterial: '',
  minOrderQuantity: '1000',
  productionCapacity: '',
  deliveryTime: '',
  packagingDetails: '',
  categoryId: '',
  isActive: true,
  isFeatured: false,
}

// Predefined options for quick selection
const materialOptions = ['Laminated Non Woven', 'Non Woven', 'Genuine Leather', 'Vegan Leather', 'Canvas', 'Nylon', 'Suede', 'Polyester', 'Jute', 'PP Non Woven']
const bagStyleOptions = ['Loop Handle Bags', 'Tote Bag', 'Shoulder Bag', 'Clutch', 'Backpack', 'Handbag', 'Crossbody', 'Duffle Bag', 'Briefcase', 'Zipper Bag']
const handleTypeOptions = ['Stitched Loop', 'Heat Seal Loop', 'Double Handle', 'Single Handle', 'Crossbody Strap', 'Chain Strap', 'No Handle', 'Padded Strap']
const printTypeOptions = ['Offset Print', 'Without Print', 'Logo Print', 'Pattern', 'Embossed', 'Custom Design', 'Full Color Print', 'Screen Print']
const bagShapeOptions = ['Rectangular', 'Square', 'Round', 'Oval', 'Trapezoid']
const finishingOptions = ['Stitched', 'Heat Seal', 'Zipper', 'Button Closure', 'Magnetic Closure', 'Drawstring']

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState(defaultFormData)
  const [categoryFormData, setCategoryFormData] = useState({ name: '', description: '', image: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSpecs, setShowSpecs] = useState(false)
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false)
  const [activeTab, setActiveTab] = useState('products')
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/products?all=true'),
        fetch('/api/categories')
      ])
      const [productsData, categoriesData] = await Promise.all([
        productsRes.json(),
        categoriesRes.json()
      ])
      setProducts(productsData)
      setCategories(categoriesData)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || p.categoryId === categoryFilter
    return matchesSearch && matchesCategory
  })

  // Product handlers
  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price?.toString() || '',
        image: product.image,
        images: product.images ? product.images.split(',').filter(Boolean) : [],
        material: product.material || '',
        bagStyle: product.bagStyle || '',
        gsm: product.gsm || '',
        bagSize: product.bagSize || '',
        handleType: product.handleType || '',
        bagColor: product.bagColor || '',
        printType: product.printType || '',
        capacity: product.capacity || '',
        usageApplication: product.usageApplication || '',
        usage: product.usage || '',
        bagShape: product.bagShape || '',
        sideGusset: product.sideGusset || '',
        finishing: product.finishing || '',
        productPattern: product.productPattern || '',
        productColor: product.productColor || '',
        productMaterial: product.productMaterial || '',
        minOrderQuantity: product.minOrderQuantity?.toString() || '1000',
        productionCapacity: product.productionCapacity || '',
        deliveryTime: product.deliveryTime || '',
        packagingDetails: product.packagingDetails || '',
        categoryId: product.categoryId || '',
        isActive: product.isActive,
        isFeatured: product.isFeatured,
      })
    } else {
      setEditingProduct(null)
      setFormData(defaultFormData)
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const data = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : null,
        minOrderQuantity: parseInt(formData.minOrderQuantity) || 1000,
        categoryId: formData.categoryId || null,
        images: formData.images.join(','),
      }

      if (editingProduct) {
        const res = await fetch('/api/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingProduct.id, ...data })
        })
        if (res.ok) {
          toast({ title: 'Product updated successfully!' })
          fetchData()
        } else {
          const error = await res.json()
          toast({ title: 'Error updating product', description: error.error, variant: 'destructive' })
        }
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
        if (res.ok) {
          toast({ title: 'Product created successfully!' })
          fetchData()
        } else {
          const error = await res.json()
          toast({ title: 'Error creating product', description: error.error, variant: 'destructive' })
        }
      }
      setIsDialogOpen(false)
    } catch (error) {
      toast({ title: 'Error saving product', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: 'Product deleted successfully!' })
        fetchData()
      }
    } catch {
      toast({ title: 'Error deleting product', variant: 'destructive' })
    }
  }

  // Category handlers
  const handleOpenCategoryDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setCategoryFormData({ 
        name: category.name, 
        description: category.description || '',
        image: category.image || ''
      })
    } else {
      setEditingCategory(null)
      setCategoryFormData({ name: '', description: '', image: '' })
    }
    setIsCategoryDialogOpen(true)
  }

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (editingCategory) {
        const res = await fetch('/api/categories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingCategory.id, ...categoryFormData })
        })
        if (res.ok) {
          toast({ title: 'Category updated successfully!' })
          fetchData()
        }
      } else {
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoryFormData)
        })
        if (res.ok) {
          toast({ title: 'Category created successfully!' })
          fetchData()
        }
      }
      setIsCategoryDialogOpen(false)
    } catch {
      toast({ title: 'Error saving category', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? Products in this category will become uncategorized.')) return

    try {
      const res = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: 'Category deleted successfully!' })
        fetchData()
      }
    } catch {
      toast({ title: 'Error deleting category', variant: 'destructive' })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="products" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Products ({products.length})
          </TabsTrigger>
          <TabsTrigger value="categories" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Categories ({categories.length})
          </TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6 mt-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => handleOpenDialog()} className="bg-amber-600 hover:bg-amber-700 gap-2">
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300">
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2 flex gap-2 flex-wrap">
                        {product.isFeatured && (
                          <Badge className="bg-amber-500">Featured</Badge>
                        )}
                        {!product.isActive && (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-8 w-8"
                          onClick={() => window.open(`/products/${product.slug}`, '_blank')}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold line-clamp-1">{product.name}</h3>
                        {product.price && (
                          <span className="text-amber-600 font-semibold whitespace-nowrap">
                            ₹{product.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {product.category && (
                          <Badge variant="outline" className="text-xs">
                            {product.category.name}
                          </Badge>
                        )}
                        {product.material && (
                          <Badge variant="secondary" className="text-xs">
                            {product.material}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                        {product.description}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleOpenDialog(product)}
                        >
                          <Pencil className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No products found</p>
            </div>
          )}
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6 mt-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Manage Categories</h3>
            <Button onClick={() => handleOpenCategoryDialog()} className="bg-amber-600 hover:bg-amber-700 gap-2">
              <FolderPlus className="w-4 h-4" />
              Add Category
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-white rounded-xl border border-slate-200 hover:shadow-md transition-all"
              >
                <div className="flex gap-4">
                  {category.image && (
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-800">{category.name}</h4>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{category.description || 'No description'}</p>
                    <Badge variant="secondary" className="mt-2">
                      {category._count?.products || 0} products
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleOpenCategoryDialog(category)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {categories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No categories yet. Add your first category!</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add/Edit Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                  placeholder="Enter product description..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price (₹)</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g., 18"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Minimum Order Quantity</Label>
                  <Input
                    type="number"
                    value={formData.minOrderQuantity}
                    onChange={(e) => setFormData({ ...formData, minOrderQuantity: e.target.value })}
                    placeholder="e.g., 1000"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Main Product Image *</Label>
                  <ImageUpload
                    value={formData.image}
                    onChange={(url) => setFormData({ ...formData, image: url })}
                    folder="products"
                    className="max-w-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Additional Images</Label>
                  <MultiImageUpload
                    value={formData.images}
                    onChange={(urls) => setFormData({ ...formData, images: urls })}
                    folder="products"
                    maxImages={5}
                  />
                </div>
              </div>
            </div>

            {/* Specifications Toggle */}
            <button
              type="button"
              onClick={() => setShowSpecs(!showSpecs)}
              className="flex items-center gap-2 font-semibold text-gray-900 border-b pb-2 w-full"
            >
              Product Specifications
              {showSpecs ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>

            {showSpecs && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Material</Label>
                    <div className="flex gap-2 flex-wrap mb-2">
                      {materialOptions.slice(0, 5).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setFormData({ ...formData, material: opt })}
                          className={`px-3 py-1 text-xs rounded-full border transition-all ${
                            formData.material === opt 
                              ? 'bg-amber-100 border-amber-500 text-amber-700' 
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    <Input
                      value={formData.material}
                      onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                      placeholder="e.g., Laminated Non Woven"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Bag Style</Label>
                    <div className="flex gap-2 flex-wrap mb-2">
                      {bagStyleOptions.slice(0, 4).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setFormData({ ...formData, bagStyle: opt })}
                          className={`px-3 py-1 text-xs rounded-full border transition-all ${
                            formData.bagStyle === opt 
                              ? 'bg-amber-100 border-amber-500 text-amber-700' 
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    <Input
                      value={formData.bagStyle}
                      onChange={(e) => setFormData({ ...formData, bagStyle: e.target.value })}
                      placeholder="e.g., Loop Handle Bags"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>GSM</Label>
                    <Input
                      value={formData.gsm}
                      onChange={(e) => setFormData({ ...formData, gsm: e.target.value })}
                      placeholder="e.g., 100 GSM"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bag Size</Label>
                    <Input
                      value={formData.bagSize}
                      onChange={(e) => setFormData({ ...formData, bagSize: e.target.value })}
                      placeholder="e.g., 15X12X4"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Handle Type</Label>
                    <div className="flex gap-2 flex-wrap mb-2">
                      {handleTypeOptions.slice(0, 3).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setFormData({ ...formData, handleType: opt })}
                          className={`px-2 py-0.5 text-xs rounded-full border transition-all ${
                            formData.handleType === opt 
                              ? 'bg-amber-100 border-amber-500 text-amber-700' 
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    <Input
                      value={formData.handleType}
                      onChange={(e) => setFormData({ ...formData, handleType: e.target.value })}
                      placeholder="e.g., Stitched Loop"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Bag Color</Label>
                    <Input
                      value={formData.bagColor}
                      onChange={(e) => setFormData({ ...formData, bagColor: e.target.value })}
                      placeholder="e.g., IVORY"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Print Type</Label>
                    <div className="flex gap-2 flex-wrap mb-2">
                      {printTypeOptions.slice(0, 3).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setFormData({ ...formData, printType: opt })}
                          className={`px-2 py-0.5 text-xs rounded-full border transition-all ${
                            formData.printType === opt 
                              ? 'bg-amber-100 border-amber-500 text-amber-700' 
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    <Input
                      value={formData.printType}
                      onChange={(e) => setFormData({ ...formData, printType: e.target.value })}
                      placeholder="e.g., Offset Print"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Capacity</Label>
                    <Input
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      placeholder="e.g., 5 Kg"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Usage/Application</Label>
                    <Input
                      value={formData.usageApplication}
                      onChange={(e) => setFormData({ ...formData, usageApplication: e.target.value })}
                      placeholder="e.g., Shopping"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Usage</Label>
                    <Textarea
                      value={formData.usage}
                      onChange={(e) => setFormData({ ...formData, usage: e.target.value })}
                      placeholder="e.g., Shopping, Garment Packing, Grocery..."
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bag Shape</Label>
                    <div className="flex gap-2 flex-wrap mb-2">
                      {bagShapeOptions.slice(0, 3).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setFormData({ ...formData, bagShape: opt })}
                          className={`px-2 py-0.5 text-xs rounded-full border transition-all ${
                            formData.bagShape === opt 
                              ? 'bg-amber-100 border-amber-500 text-amber-700' 
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    <Input
                      value={formData.bagShape}
                      onChange={(e) => setFormData({ ...formData, bagShape: e.target.value })}
                      placeholder="e.g., Rectangular"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Side Gusset</Label>
                    <Input
                      value={formData.sideGusset}
                      onChange={(e) => setFormData({ ...formData, sideGusset: e.target.value })}
                      placeholder="e.g., 4 inch Gusset"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Finishing</Label>
                    <div className="flex gap-2 flex-wrap mb-2">
                      {finishingOptions.slice(0, 3).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setFormData({ ...formData, finishing: opt })}
                          className={`px-2 py-0.5 text-xs rounded-full border transition-all ${
                            formData.finishing === opt 
                              ? 'bg-amber-100 border-amber-500 text-amber-700' 
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    <Input
                      value={formData.finishing}
                      onChange={(e) => setFormData({ ...formData, finishing: e.target.value })}
                      placeholder="e.g., Stitched"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Product Pattern</Label>
                    <Input
                      value={formData.productPattern}
                      onChange={(e) => setFormData({ ...formData, productPattern: e.target.value })}
                      placeholder="e.g., Plain"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Product Color</Label>
                    <Input
                      value={formData.productColor}
                      onChange={(e) => setFormData({ ...formData, productColor: e.target.value })}
                      placeholder="e.g., Beige ( Base )"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Product Material</Label>
                    <Input
                      value={formData.productMaterial}
                      onChange={(e) => setFormData({ ...formData, productMaterial: e.target.value })}
                      placeholder="e.g., Non Woven"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Additional Information Toggle */}
            <button
              type="button"
              onClick={() => setShowAdditionalInfo(!showAdditionalInfo)}
              className="flex items-center gap-2 font-semibold text-gray-900 border-b pb-2 w-full"
            >
              Additional Information
              {showAdditionalInfo ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>

            {showAdditionalInfo && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Production Capacity</Label>
                    <Input
                      value={formData.productionCapacity}
                      onChange={(e) => setFormData({ ...formData, productionCapacity: e.target.value })}
                      placeholder="e.g., 5 KG"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Delivery Time</Label>
                    <Input
                      value={formData.deliveryTime}
                      onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                      placeholder="e.g., 2-3 DAYS"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Packaging Details</Label>
                  <Textarea
                    value={formData.packagingDetails}
                    onChange={(e) => setFormData({ ...formData, packagingDetails: e.target.value })}
                    placeholder="e.g., Standard packing in bundles of 100 pieces..."
                    rows={4}
                  />
                </div>
              </div>
            )}

            {/* Status */}
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                />
                <Label htmlFor="isFeatured">Featured</Label>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-amber-600 hover:bg-amber-700"
                disabled={isSubmitting || !formData.image}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {editingProduct ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCategorySubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Category Name *</Label>
              <Input
                id="categoryName"
                value={categoryFormData.name}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryDescription">Description</Label>
              <Textarea
                id="categoryDescription"
                value={categoryFormData.description}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Category Image</Label>
              <ImageUpload
                value={categoryFormData.image}
                onChange={(url) => setCategoryFormData({ ...categoryFormData, image: url })}
                folder="categories"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCategoryDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-amber-600 hover:bg-amber-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {editingCategory ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

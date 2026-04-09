'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Package, Search, Percent } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

interface Product {
  id: string
  name: string
  price: number | null
  image: string
}

interface BundleItem {
  id: string
  productId: string
  quantity: number
  Product?: Product
}

interface Bundle {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  discount: number
  isActive: boolean
  items: BundleItem[]
  createdAt: string
}

export default function BundlesAdminPage() {
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBundle, setEditingBundle] = useState<Bundle | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    discount: 10,
    isActive: true,
    items: [] as { productId: string; quantity: number }[]
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [bundlesRes, productsRes] = await Promise.all([
        fetch('/api/bundles'),
        fetch('/api/products?all=true')
      ])
      const [bundlesData, productsData] = await Promise.all([
        bundlesRes.json(),
        productsRes.json()
      ])
      setBundles(bundlesData)
      setProducts(productsData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = '/api/bundles'
      const method = editingBundle ? 'PUT' : 'POST'
      const body = editingBundle 
        ? { ...formData, id: editingBundle.id } 
        : formData

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        toast({ title: editingBundle ? 'Bundle updated!' : 'Bundle created!' })
        setShowForm(false)
        setEditingBundle(null)
        setFormData({
          name: '', description: '', image: '', discount: 10, isActive: true, items: []
        })
        fetchData()
      }
    } catch (error) {
      toast({ title: 'Error saving bundle', variant: 'destructive' })
    }
  }

  const handleEdit = (bundle: Bundle) => {
    setEditingBundle(bundle)
    setFormData({
      name: bundle.name,
      description: bundle.description || '',
      image: bundle.image || '',
      discount: bundle.discount,
      isActive: bundle.isActive,
      items: bundle.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }))
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bundle?')) return
    try {
      const res = await fetch(`/api/bundles?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: 'Bundle deleted!' })
        fetchData()
      }
    } catch (error) {
      toast({ title: 'Error deleting bundle', variant: 'destructive' })
    }
  }

  const addItem = () => {
    if (products.length > 0) {
      setFormData({
        ...formData,
        items: [...formData.items, { productId: products[0].id, quantity: 1 }]
      })
    }
  }

  const updateItem = (index: number, field: 'productId' | 'quantity', value: string | number) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setFormData({ ...formData, items: newItems })
  }

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    })
  }

  const calculateBundleValue = (bundle: Bundle) => {
    return bundle.items.reduce((sum, item) => {
      const price = item.Product?.price || 0
      return sum + (price * item.quantity)
    }, 0)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Bundles</h1>
          <p className="text-gray-500 mt-1">Create product bundles with special pricing</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditingBundle(null); }} className="bg-amber-500 hover:bg-amber-600">
          <Plus className="w-4 h-4 mr-2" /> Create Bundle
        </Button>
      </div>

      {/* Bundles Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bundles.map((bundle) => {
          const totalValue = calculateBundleValue(bundle)
          const discountedValue = totalValue * (1 - bundle.discount / 100)

          return (
            <motion.div
              key={bundle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className={!bundle.isActive ? 'opacity-60' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{bundle.name}</CardTitle>
                      {bundle.discount > 0 && (
                        <Badge className="mt-2 bg-green-500">
                          <Percent className="w-3 h-3 mr-1" /> {bundle.discount}% OFF
                        </Badge>
                      )}
                    </div>
                    <Badge variant={bundle.isActive ? 'default' : 'secondary'}>
                      {bundle.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                    {bundle.description || 'No description'}
                  </p>

                  <div className="space-y-2 mb-4">
                    {bundle.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center gap-2 text-sm">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="flex-1 truncate">{item.Product?.name || 'Unknown'}</span>
                        <span className="text-gray-400">x{item.quantity}</span>
                      </div>
                    ))}
                    {bundle.items.length > 3 && (
                      <p className="text-xs text-gray-400">+{bundle.items.length - 3} more items</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm mb-4">
                    <span className="text-gray-500">Total Value:</span>
                    <div className="text-right">
                      {bundle.discount > 0 && (
                        <span className="text-gray-400 line-through mr-2">₹{totalValue.toLocaleString()}</span>
                      )}
                      <span className="font-bold text-green-600">₹{discountedValue.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEdit(bundle)}>
                      <Edit className="w-3 h-3 mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(bundle.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {bundles.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No bundles yet. Create your first bundle!</p>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBundle ? 'Edit Bundle' : 'Create Bundle'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bundle Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Discount %</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Products in Bundle</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="w-4 h-4 mr-1" /> Add Product
                </Button>
              </div>
              <div className="space-y-2">
                {formData.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Select
                      value={item.productId}
                      onValueChange={(value) => updateItem(index, 'productId', value)}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} {p.price ? `- ₹${p.price}` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-20"
                    />
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded"
              />
              Active
            </label>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-amber-500 hover:bg-amber-600">
                {editingBundle ? 'Update' : 'Create'} Bundle
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

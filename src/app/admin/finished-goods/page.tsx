'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Package, Plus, Search, Edit, Trash2, AlertTriangle,
  ShoppingBag, TrendingUp, Eye
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface FinishedGood {
  id: string
  sku: string
  name: string
  size?: string | null
  color?: string | null
  material?: string | null
  quantityInStock: number
  reservedQuantity: number
  availableQuantity: number
  costPrice: number
  sellingPrice: number
  mrp?: number | null
  isActive: boolean
}

export default function FinishedGoodsPage() {
  const [goods, setGoods] = useState<FinishedGood[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchGoods()
  }, [])

  const fetchGoods = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/finished-goods')
      const data = await res.json()
      setGoods(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching finished goods:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteGood = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    
    try {
      await fetch(`/api/finished-goods/${id}`, { method: 'DELETE' })
      fetchGoods()
    } catch (error) {
      console.error('Error deleting finished good:', error)
    }
  }

  const filteredGoods = goods.filter(good => 
    good.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    good.sku.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const stats = {
    total: goods.length,
    totalStock: goods.reduce((sum, g) => sum + g.quantityInStock, 0),
    lowStock: goods.filter(g => g.quantityInStock < 10).length,
    totalValue: goods.reduce((sum, g) => sum + (g.quantityInStock * g.costPrice), 0),
    totalRetail: goods.reduce((sum, g) => sum + (g.quantityInStock * g.sellingPrice), 0),
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finished Goods</h1>
          <p className="text-gray-500 mt-1">Manage your finished product inventory</p>
        </div>
        <Link href="/admin/finished-goods/new">
          <Button className="bg-amber-500 hover:bg-amber-600 gap-2">
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Products', value: stats.total, icon: Package, color: 'from-blue-500' },
          { label: 'Total Stock', value: stats.totalStock, icon: ShoppingBag, color: 'from-emerald-500' },
          { label: 'Low Stock', value: stats.lowStock, icon: AlertTriangle, color: 'from-rose-500' },
          { label: 'Cost Value', value: `₹${(stats.totalValue / 1000).toFixed(1)}K`, icon: TrendingUp, color: 'from-violet-500' },
          { label: 'Retail Value', value: `₹${(stats.totalRetail / 1000).toFixed(1)}K`, icon: TrendingUp, color: 'from-amber-500' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                    <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {filteredGoods.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No products found</h3>
          <p className="text-gray-500 mt-1">Add your first finished product</p>
          <Link href="/admin/finished-goods/new">
            <Button className="mt-4 bg-amber-500 hover:bg-amber-600">
              Add Product
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoods.map((good, index) => {
            const stockStatus = good.quantityInStock < 10 
              ? { color: 'bg-rose-100 text-rose-700', label: 'Low Stock' }
              : good.quantityInStock < 20
              ? { color: 'bg-amber-100 text-amber-700', label: 'Warning' }
              : { color: 'bg-emerald-100 text-emerald-700', label: 'In Stock' }
            
            return (
              <motion.div
                key={good.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`border-0 shadow-sm hover:shadow-md transition-all ${good.quantityInStock < 10 ? 'border-l-4 border-l-rose-500' : ''}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stockStatus.color.split(' ')[0]}`}>
                          <ShoppingBag className={`w-6 h-6 ${stockStatus.color.split(' ')[1]}`} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{good.name}</p>
                          <p className="text-xs text-gray-500">{good.sku}</p>
                        </div>
                      </div>
                      <Badge className={stockStatus.color}>{stockStatus.label}</Badge>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      {good.size && <p className="text-sm text-gray-600">Size: {good.size}</p>}
                      {good.color && <p className="text-sm text-gray-600">Color: {good.color}</p>}
                      {good.material && <p className="text-sm text-gray-600">Material: {good.material}</p>}
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center mb-4">
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-xs text-gray-500">In Stock</p>
                        <p className="font-bold text-gray-900">{good.quantityInStock}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-xs text-gray-500">Reserved</p>
                        <p className="font-bold text-amber-600">{good.reservedQuantity}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-xs text-gray-500">Available</p>
                        <p className="font-bold text-emerald-600">{good.availableQuantity}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm mb-4">
                      <div>
                        <p className="text-gray-500">Cost</p>
                        <p className="font-semibold">₹{good.costPrice}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-500">Selling</p>
                        <p className="font-semibold text-emerald-600">₹{good.sellingPrice}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/admin/finished-goods/${good.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full gap-1">
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                      </Link>
                      <Link href={`/admin/finished-goods/${good.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full gap-1">
                          <Edit className="w-4 h-4" />
                          Edit
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => deleteGood(good.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

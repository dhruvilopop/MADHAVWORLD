'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Package, Plus, Search, Edit, Trash2, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Factory, Layers, Settings
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface RawMaterial {
  id: string
  name: string
  category?: { name: string; color: string } | null
  supplier?: { name: string } | null
  unit: string
  currentStock: number
  minStockLevel: number
  unitCost: number
  size?: number | null
  width?: number | null
  gsm?: number | null
  weightPerBag?: number | null
  bagsPerKg?: number | null
  isActive: boolean
  lastRestocked?: string | null
}

interface Category {
  id: string
  name: string
  color?: string | null
  _count?: { materials: number }
}

export default function RawMaterialsPage() {
  const [materials, setMaterials] = useState<RawMaterial[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [stockFilter, setStockFilter] = useState('all')

  useEffect(() => {
    fetchMaterials()
    fetchCategories()
  }, [])

  const fetchMaterials = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/raw-materials')
      const data = await res.json()
      setMaterials(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching materials:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/raw-materials/categories')
      const data = await res.json()
      setCategories(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const deleteMaterial = async (id: string) => {
    if (!confirm('Are you sure you want to delete this material?')) return
    
    try {
      await fetch(`/api/raw-materials/${id}`, { method: 'DELETE' })
      fetchMaterials()
    } catch (error) {
      console.error('Error deleting material:', error)
    }
  }

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || material.category?.id === categoryFilter
    const matchesStock = stockFilter === 'all' || 
      (stockFilter === 'low' && material.currentStock < material.minStockLevel) ||
      (stockFilter === 'ok' && material.currentStock >= material.minStockLevel)
    return matchesSearch && matchesCategory && matchesStock
  })

  const stats = {
    total: materials.length,
    lowStock: materials.filter(m => m.currentStock < m.minStockLevel).length,
    totalValue: materials.reduce((sum, m) => sum + (m.currentStock * m.unitCost), 0),
    categories: categories.length
  }

  const getStockStatus = (current: number, min: number) => {
    if (current < min) return { color: 'bg-rose-100 text-rose-700', label: 'Low Stock' }
    if (current < min * 1.5) return { color: 'bg-amber-100 text-amber-700', label: 'Warning' }
    return { color: 'bg-emerald-100 text-emerald-700', label: 'In Stock' }
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
          <h1 className="text-3xl font-bold text-gray-900">Raw Materials</h1>
          <p className="text-gray-500 mt-1">Manage your raw material inventory</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/raw-materials/categories">
            <Button variant="outline" className="gap-2">
              <Layers className="w-4 h-4" />
              Categories
            </Button>
          </Link>
          <Link href="/admin/raw-materials/suppliers">
            <Button variant="outline" className="gap-2">
              <Factory className="w-4 h-4" />
              Suppliers
            </Button>
          </Link>
          <Link href="/admin/raw-materials/new">
            <Button className="bg-amber-500 hover:bg-amber-600 gap-2">
              <Plus className="w-4 h-4" />
              Add Material
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Materials', value: stats.total, icon: Package, color: 'from-blue-500' },
          { label: 'Low Stock', value: stats.lowStock, icon: AlertTriangle, color: 'from-rose-500' },
          { label: 'Total Value', value: `₹${(stats.totalValue / 1000).toFixed(1)}K`, icon: ArrowUpRight, color: 'from-emerald-500' },
          { label: 'Categories', value: stats.categories, icon: Layers, color: 'from-violet-500' },
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

      {/* Low Stock Alert */}
      {stats.lowStock > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-rose-200 bg-rose-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <div>
                  <p className="font-medium text-rose-700">Low Stock Alert</p>
                  <p className="text-sm text-rose-600">
                    {stats.lowStock} materials are below minimum stock level and need to be reordered
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
                <SelectItem value="ok">In Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Materials List */}
      {filteredMaterials.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No materials found</h3>
          <p className="text-gray-500 mt-1">Add your first raw material to get started</p>
          <Link href="/admin/raw-materials/new">
            <Button className="mt-4 bg-amber-500 hover:bg-amber-600">
              Add Material
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMaterials.map((material, index) => {
            const stockStatus = getStockStatus(material.currentStock, material.minStockLevel)
            return (
              <motion.div
                key={material.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`border-0 shadow-sm hover:shadow-md transition-all ${material.currentStock < material.minStockLevel ? 'border-l-4 border-l-rose-500' : ''}`}>
                  <CardContent className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stockStatus.color.split(' ')[0]}`}>
                          <Package className={`w-6 h-6 ${stockStatus.color.split(' ')[1]}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-gray-900">{material.name}</p>
                            <Badge className={stockStatus.color}>{stockStatus.label}</Badge>
                            {material.category && (
                              <Badge variant="outline" style={{ borderColor: material.category.color || undefined }}>
                                {material.category.name}
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
                            {material.size && <span>Size: {material.size}</span>}
                            {material.width && <span>Width: {material.width}"</span>}
                            {material.gsm && <span>GSM: {material.gsm}</span>}
                            {material.bagsPerKg && <span>{material.bagsPerKg} bags/kg</span>}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-6 text-center">
                        <div>
                          <p className="text-sm text-gray-500">Stock</p>
                          <p className={`font-bold ${material.currentStock < material.minStockLevel ? 'text-rose-600' : 'text-gray-900'}`}>
                            {material.currentStock} {material.unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Min Level</p>
                          <p className="font-semibold text-gray-700">{material.minStockLevel}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Unit Cost</p>
                          <p className="font-semibold text-gray-900">₹{material.unitCost}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Value</p>
                          <p className="font-bold text-emerald-600">
                            ₹{(material.currentStock * material.unitCost).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link href={`/admin/raw-materials/${material.id}`}>
                          <Button variant="outline" size="sm" className="gap-1">
                            <Edit className="w-4 h-4" />
                            Edit
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => deleteMaterial(material.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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

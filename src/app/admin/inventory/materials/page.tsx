'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Package, Plus, Search, Edit, Trash2, AlertTriangle,
  Box, Layers, Factory, Ruler
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

interface Material {
  id: string
  name: string
  category: string
  unit: string
  currentStock: number
  minStock: number
  unitCost: number
  supplier: string
  lastRestocked: string | null
}

const defaultMaterials: Material[] = [
  { id: '1', name: 'Leather Sheet (Premium)', category: 'Raw Materials', unit: 'sq ft', currentStock: 500, minStock: 100, unitCost: 150, supplier: 'Leather Co.', lastRestocked: '2024-01-15' },
  { id: '2', name: 'Cotton Fabric', category: 'Raw Materials', unit: 'meters', currentStock: 1200, minStock: 200, unitCost: 80, supplier: 'Textile Hub', lastRestocked: '2024-01-12' },
  { id: '3', name: 'Metal Buckles', category: 'Hardware', unit: 'pieces', currentStock: 2000, minStock: 500, unitCost: 25, supplier: 'Metal Works', lastRestocked: '2024-01-10' },
  { id: '4', name: 'Zippers (Various)', category: 'Hardware', unit: 'pieces', currentStock: 150, minStock: 300, unitCost: 15, supplier: 'ZipFast Inc.', lastRestocked: '2024-01-08' },
  { id: '5', name: 'Thread (Nylon)', category: 'Consumables', unit: 'spools', currentStock: 350, minStock: 100, unitCost: 45, supplier: 'Thread World', lastRestocked: '2024-01-14' },
  { id: '6', name: 'Adhesive Glue', category: 'Consumables', unit: 'liters', currentStock: 25, minStock: 50, unitCost: 200, supplier: 'ChemBond', lastRestocked: '2024-01-05' },
  { id: '7', name: 'Packaging Boxes', category: 'Packaging', unit: 'pieces', currentStock: 800, minStock: 200, unitCost: 30, supplier: 'PackRight', lastRestocked: '2024-01-11' },
  { id: '8', name: 'Foam Padding', category: 'Raw Materials', unit: 'sheets', currentStock: 45, minStock: 100, unitCost: 120, supplier: 'FoamTech', lastRestocked: '2024-01-07' },
]

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>(defaultMaterials)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const categories = ['all', 'Raw Materials', 'Hardware', 'Consumables', 'Packaging']

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.supplier.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || material.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const lowStockMaterials = materials.filter(m => m.currentStock < m.minStock)

  const stats = {
    total: materials.length,
    lowStock: lowStockMaterials.length,
    totalValue: materials.reduce((sum, m) => sum + (m.currentStock * m.unitCost), 0),
    categories: [...new Set(materials.map(m => m.category))].length
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Raw Materials': return 'bg-blue-100 text-blue-700'
      case 'Hardware': return 'bg-amber-100 text-amber-700'
      case 'Consumables': return 'bg-violet-100 text-violet-700'
      case 'Packaging': return 'bg-emerald-100 text-emerald-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Materials</h1>
          <p className="text-gray-500 mt-1">Manage raw materials and supplies</p>
        </div>
        <Button className="bg-amber-500 hover:bg-amber-600 gap-2">
          <Plus className="w-4 h-4" />
          Add Material
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Materials', value: stats.total, icon: Package, color: 'from-blue-500' },
          { label: 'Low Stock', value: stats.lowStock, icon: AlertTriangle, color: 'from-rose-500' },
          { label: 'Total Value', value: `₹${(stats.totalValue / 1000).toFixed(0)}K`, icon: Box, color: 'from-emerald-500' },
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
      {lowStockMaterials.length > 0 && (
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
                    {lowStockMaterials.length} materials are below minimum stock level
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
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </SelectItem>
                ))}
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
          <p className="text-gray-500 mt-1">Add your first material to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMaterials.map((material, index) => (
            <motion.div
              key={material.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`border-0 shadow-sm hover:shadow-md transition-all ${material.currentStock < material.minStock ? 'border-l-4 border-l-rose-500' : ''}`}>
                <CardContent className="p-5">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${material.currentStock < material.minStock ? 'bg-rose-100' : 'bg-blue-100'}`}>
                        <Factory className={`w-6 h-6 ${material.currentStock < material.minStock ? 'text-rose-600' : 'text-blue-600'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{material.name}</p>
                          {material.currentStock < material.minStock && (
                            <Badge className="bg-rose-100 text-rose-700">Low Stock</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getCategoryColor(material.category)}>
                            {material.category}
                          </Badge>
                          <span className="text-sm text-gray-500">{material.supplier}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-6 text-center">
                      <div>
                        <p className="text-sm text-gray-500">Stock</p>
                        <p className={`font-bold ${material.currentStock < material.minStock ? 'text-rose-600' : 'text-gray-900'}`}>
                          {material.currentStock} {material.unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Min Level</p>
                        <p className="font-semibold text-gray-700">{material.minStock}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Unit Cost</p>
                        <p className="font-semibold text-gray-900">₹{material.unitCost}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Value</p>
                        <p className="font-bold text-emerald-600">₹{(material.currentStock * material.unitCost).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="gap-1">
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Package, Plus, Search, Edit, AlertTriangle, TrendingDown,
  Loader2, Box, Layers, ArrowUpDown, Calendar, History,
  PlusCircle, MinusCircle, BarChart3
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'

interface Material {
  id: string
  name: string
  category: string
  unit: string
  quantity: number
  minQuantity: number
  unitCost: number | null
  supplier: string | null
  lastRestocked: string | null
}

interface StockHistory {
  id: string
  productName: string
  type: string
  quantity: number
  reason: string | null
  createdAt: string
}

export default function InventoryPage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [stockHistory, setStockHistory] = useState<StockHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    category: 'leather',
    unit: 'meter',
    quantity: 0,
    minQuantity: 10,
    unitCost: 0,
    supplier: '',
  })

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    setIsLoading(true)
    try {
      const [materialsRes, historyRes] = await Promise.all([
        fetch('/api/inventory/materials'),
        fetch('/api/inventory/history'),
      ])
      const materialsData = await materialsRes.json()
      const historyData = await historyRes.json()
      setMaterials(Array.isArray(materialsData) ? materialsData : [])
      setStockHistory(Array.isArray(historyData) ? historyData : [])
    } catch (error) {
      console.error('Error fetching inventory:', error)
      // Sample data
      setMaterials([
        { id: '1', name: 'Premium Leather', category: 'leather', unit: 'sq ft', quantity: 500, minQuantity: 100, unitCost: 150, supplier: 'Leather Co.', lastRestocked: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
        { id: '2', name: 'Canvas Fabric', category: 'fabric', unit: 'meter', quantity: 200, minQuantity: 50, unitCost: 80, supplier: 'Textile Mart', lastRestocked: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
        { id: '3', name: 'Zippers', category: 'accessories', unit: 'piece', quantity: 1500, minQuantity: 200, unitCost: 15, supplier: 'Zip Suppliers', lastRestocked: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
        { id: '4', name: 'Metal Buckles', category: 'hardware', unit: 'piece', quantity: 45, minQuantity: 100, unitCost: 50, supplier: 'Hardware Hub', lastRestocked: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
        { id: '5', name: 'Vegan Leather', category: 'leather', unit: 'sq ft', quantity: 300, minQuantity: 80, unitCost: 120, supplier: 'Eco Materials', lastRestocked: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
        { id: '6', name: 'Thread Spools', category: 'consumables', unit: 'piece', quantity: 25, minQuantity: 50, unitCost: 30, supplier: 'Sewing Supplies', lastRestocked: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() },
      ])
      setStockHistory([
        { id: '1', productName: 'Premium Leather', type: 'in', quantity: 200, reason: 'Purchase Order #PO-001', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
        { id: '2', productName: 'Canvas Fabric', type: 'out', quantity: 50, reason: 'Order #ORD-045', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { id: '3', productName: 'Zippers', type: 'out', quantity: 100, reason: 'Order #ORD-044', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || material.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const lowStockItems = materials.filter(m => m.quantity <= m.minQuantity)
  const totalValue = materials.reduce((sum, m) => sum + (m.quantity * (m.unitCost || 0)), 0)

  const getStockStatus = (material: Material) => {
    const percentage = (material.quantity / material.minQuantity) * 100
    if (percentage <= 50) return { status: 'critical', color: 'bg-rose-500' }
    if (percentage <= 100) return { status: 'low', color: 'bg-amber-500' }
    return { status: 'good', color: 'bg-emerald-500' }
  }

  const categoryIcons: Record<string, React.ElementType> = {
    leather: Box,
    fabric: Layers,
    hardware: Package,
    accessories: Package,
    consumables: Package,
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-500 mt-1">Track materials and stock levels</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowHistory(true)} className="gap-2">
            <History className="w-4 h-4" />
            History
          </Button>
          <Button onClick={() => setShowAddModal(true)} className="bg-amber-500 hover:bg-amber-600 gap-2">
            <Plus className="w-4 h-4" />
            Add Material
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Materials', value: materials.length, icon: Layers, color: 'from-blue-500' },
          { label: 'Low Stock Items', value: lowStockItems.length, icon: AlertTriangle, color: 'from-amber-500' },
          { label: 'Total Value', value: `₹${(totalValue / 1000).toFixed(0)}K`, icon: BarChart3, color: 'from-emerald-500' },
          { label: 'Categories', value: new Set(materials.map(m => m.category)).size, icon: Package, color: 'from-violet-500' },
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
      {lowStockItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="border-rose-200 bg-rose-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-rose-800">Low Stock Alert</h3>
                  <p className="text-sm text-rose-600 mt-1">
                    {lowStockItems.length} item(s) are running low: {lowStockItems.map(m => m.name).join(', ')}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="border-rose-200 text-rose-700 hover:bg-rose-100">
                  Reorder All
                </Button>
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
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="leather">Leather</SelectItem>
                <SelectItem value="fabric">Fabric</SelectItem>
                <SelectItem value="hardware">Hardware</SelectItem>
                <SelectItem value="accessories">Accessories</SelectItem>
                <SelectItem value="consumables">Consumables</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Materials Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material, index) => {
            const Icon = categoryIcons[material.category] || Package
            const stockStatus = getStockStatus(material)
            const stockPercentage = Math.min((material.quantity / (material.minQuantity * 2)) * 100, 100)

            return (
              <motion.div
                key={material.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`border-0 shadow-sm hover:shadow-md transition-all ${stockStatus.status !== 'good' ? 'ring-2 ring-amber-200' : ''}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{material.name}</p>
                          <p className="text-xs text-gray-500 capitalize">{material.category}</p>
                        </div>
                      </div>
                      <Badge className={
                        stockStatus.status === 'critical' ? 'bg-rose-100 text-rose-700' :
                        stockStatus.status === 'low' ? 'bg-amber-100 text-amber-700' :
                        'bg-emerald-100 text-emerald-700'
                      }>
                        {stockStatus.status}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-500">Stock Level</span>
                          <span className="font-medium">{material.quantity} {material.unit}</span>
                        </div>
                        <Progress value={stockPercentage} className="h-2" />
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Min. Quantity</span>
                        <span className="font-medium">{material.minQuantity} {material.unit}</span>
                      </div>

                      {material.unitCost && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Unit Cost</span>
                          <span className="font-medium">₹{material.unitCost}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-3 border-t">
                        <Button variant="outline" size="sm" className="flex-1 gap-1">
                          <PlusCircle className="w-4 h-4" />
                          Add Stock
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 gap-1">
                          <MinusCircle className="w-4 h-4" />
                          Use Stock
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

      {/* Add Material Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Material</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Input
              placeholder="Material Name *"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-4">
              <Select value={formData.category} onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="leather">Leather</SelectItem>
                  <SelectItem value="fabric">Fabric</SelectItem>
                  <SelectItem value="hardware">Hardware</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                  <SelectItem value="consumables">Consumables</SelectItem>
                </SelectContent>
              </Select>
              <Select value={formData.unit} onValueChange={(v) => setFormData(prev => ({ ...prev, unit: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="piece">Piece</SelectItem>
                  <SelectItem value="meter">Meter</SelectItem>
                  <SelectItem value="sq ft">Sq Ft</SelectItem>
                  <SelectItem value="kg">Kg</SelectItem>
                  <SelectItem value="roll">Roll</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
              />
              <Input
                placeholder="Min. Quantity"
                type="number"
                value={formData.minQuantity}
                onChange={(e) => setFormData(prev => ({ ...prev, minQuantity: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Unit Cost (₹)"
                type="number"
                value={formData.unitCost}
                onChange={(e) => setFormData(prev => ({ ...prev, unitCost: parseFloat(e.target.value) || 0 }))}
              />
              <Input
                placeholder="Supplier"
                value={formData.supplier}
                onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button className="flex-1 bg-amber-500 hover:bg-amber-600">
                Add Material
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stock History Modal */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Stock Movement History</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4 max-h-96 overflow-y-auto">
            {stockHistory.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  item.type === 'in' ? 'bg-emerald-100' : 'bg-rose-100'
                }`}>
                  {item.type === 'in' ? (
                    <PlusCircle className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <MinusCircle className="w-4 h-4 text-rose-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.productName}</p>
                  <p className="text-sm text-gray-500">{item.reason || 'Manual adjustment'}</p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${item.type === 'in' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {item.type === 'in' ? '+' : '-'}{item.quantity}
                  </p>
                  <p className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

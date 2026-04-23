'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Factory, Plus, Search, Eye, Edit, Trash2, Calendar,
  Package, Clock, CheckCircle, XCircle, AlertCircle, TrendingUp
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

interface ProductionRawMaterial {
  id: string
  materialName: string
  quantityUsed: number
  quantityWasted: number
  unitCost: number
  totalCost: number
}

interface ProductionEntry {
  id: string
  productionNumber: string
  productName: string
  productionDate: string
  quantityProduced: number
  quantityRejected: number
  quantityPassed: number
  totalCost: number
  costPerPiece: number
  status: string
  qualityStatus: string
  workerName?: string
  batchNumber?: string
  rawMaterials: ProductionRawMaterial[]
}

export default function ProductionPage() {
  const [productions, setProductions] = useState<ProductionEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchProductions()
  }, [])

  const fetchProductions = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/production')
      const data = await res.json()
      setProductions(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching productions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteProduction = async (id: string) => {
    if (!confirm('Are you sure? This will restore raw material stock.')) return
    
    try {
      await fetch(`/api/production/${id}`, { method: 'DELETE' })
      fetchProductions()
    } catch (error) {
      console.error('Error deleting production:', error)
    }
  }

  const filteredProductions = productions.filter(production => {
    const matchesSearch = production.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      production.productionNumber.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || production.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: productions.length,
    totalProduced: productions.reduce((sum, p) => sum + p.quantityProduced, 0),
    totalCost: productions.reduce((sum, p) => sum + p.totalCost, 0),
    avgCostPerPiece: productions.length > 0 
      ? productions.reduce((sum, p) => sum + p.costPerPiece, 0) / productions.length 
      : 0,
    completed: productions.filter(p => p.status === 'completed').length,
    inProgress: productions.filter(p => p.status === 'in_progress').length,
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-700'
      case 'in_progress': return 'bg-amber-100 text-amber-700'
      case 'completed': return 'bg-emerald-100 text-emerald-700'
      case 'cancelled': return 'bg-rose-100 text-rose-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getQualityColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-emerald-100 text-emerald-700'
      case 'failed': return 'bg-rose-100 text-rose-700'
      case 'rework': return 'bg-amber-100 text-amber-700'
      default: return 'bg-gray-100 text-gray-700'
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Production</h1>
          <p className="text-gray-500 mt-1">Track production entries and material consumption</p>
        </div>
        <Link href="/admin/production/new">
          <Button className="bg-amber-500 hover:bg-amber-600 gap-2">
            <Plus className="w-4 h-4" />
            New Production
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Entries', value: stats.total, icon: Factory, color: 'from-blue-500' },
          { label: 'Items Produced', value: stats.totalProduced, icon: Package, color: 'from-emerald-500' },
          { label: 'Total Cost', value: `₹${(stats.totalCost / 1000).toFixed(1)}K`, icon: TrendingUp, color: 'from-violet-500' },
          { label: 'Avg Cost/Piece', value: `₹${stats.avgCostPerPiece.toFixed(2)}`, icon: Factory, color: 'from-amber-500' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'from-green-500' },
          { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'from-orange-500' },
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
                    <p className="text-lg font-bold text-gray-900">{stat.value}</p>
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
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by product or production number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Production List */}
      {filteredProductions.length === 0 ? (
        <div className="text-center py-12">
          <Factory className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No production entries found</h3>
          <p className="text-gray-500 mt-1">Start tracking your production</p>
          <Link href="/admin/production/new">
            <Button className="mt-4 bg-amber-500 hover:bg-amber-600">
              Create Production Entry
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProductions.map((production, index) => (
            <motion.div
              key={production.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-0 shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                        <Factory className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900">{production.productName}</p>
                          <Badge className={getStatusColor(production.status)}>
                            {production.status.replace('_', ' ')}
                          </Badge>
                          <Badge className={getQualityColor(production.qualityStatus)}>
                            {production.qualityStatus}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
                          <span>#{production.productionNumber}</span>
                          <span>•</span>
                          <span>{new Date(production.productionDate).toLocaleDateString()}</span>
                          {production.workerName && (
                            <>
                              <span>•</span>
                              <span>Worker: {production.workerName}</span>
                            </>
                          )}
                          {production.batchNumber && (
                            <>
                              <span>•</span>
                              <span>Batch: {production.batchNumber}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-5 gap-4 text-center">
                      <div>
                        <p className="text-xs text-gray-500">Produced</p>
                        <p className="font-bold text-gray-900">{production.quantityProduced}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Passed</p>
                        <p className="font-bold text-emerald-600">{production.quantityPassed}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Rejected</p>
                        <p className="font-bold text-rose-600">{production.quantityRejected}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Total Cost</p>
                        <p className="font-bold text-gray-900">₹{production.totalCost.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Cost/Piece</p>
                        <p className="font-bold text-amber-600">₹{production.costPerPiece.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/admin/production/${production.id}`}>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => deleteProduction(production.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Raw Materials Used */}
                  {production.rawMaterials.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-2">Materials Used:</p>
                      <div className="flex flex-wrap gap-2">
                        {production.rawMaterials.map((item) => (
                          <Badge key={item.id} variant="outline" className="text-xs">
                            {item.materialName}: {item.quantityUsed} units (₹{item.totalCost.toFixed(2)})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

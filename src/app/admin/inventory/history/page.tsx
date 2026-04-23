'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  History, Search, ArrowUpRight, ArrowDownRight, Package,
  Calendar, Filter, Download, TrendingUp, TrendingDown
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

interface StockMovement {
  id: string
  materialName: string
  type: 'in' | 'out'
  quantity: number
  previousStock: number
  newStock: number
  reason: string
  reference: string
  date: string
  user: string
}

const mockHistory: StockMovement[] = [
  { id: '1', materialName: 'Leather Sheet (Premium)', type: 'in', quantity: 100, previousStock: 400, newStock: 500, reason: 'Purchase Order #PO-001', reference: 'PO-001', date: '2024-01-15T10:30:00', user: 'Admin' },
  { id: '2', materialName: 'Cotton Fabric', type: 'out', quantity: 50, previousStock: 1250, newStock: 1200, reason: 'Production Order #ORD-123', reference: 'ORD-123', date: '2024-01-15T09:15:00', user: 'Admin' },
  { id: '3', materialName: 'Metal Buckles', type: 'out', quantity: 200, previousStock: 2200, newStock: 2000, reason: 'Production Order #ORD-122', reference: 'ORD-122', date: '2024-01-14T16:45:00', user: 'Admin' },
  { id: '4', materialName: 'Zippers (Various)', type: 'in', quantity: 500, previousStock: -350, newStock: 150, reason: 'Purchase Order #PO-002', reference: 'PO-002', date: '2024-01-14T14:00:00', user: 'Admin' },
  { id: '5', materialName: 'Thread (Nylon)', type: 'out', quantity: 20, previousStock: 370, newStock: 350, reason: 'Production Order #ORD-121', reference: 'ORD-121', date: '2024-01-14T11:30:00', user: 'Admin' },
  { id: '6', materialName: 'Adhesive Glue', type: 'out', quantity: 5, previousStock: 30, newStock: 25, reason: 'Production Order #ORD-120', reference: 'ORD-120', date: '2024-01-13T15:20:00', user: 'Admin' },
  { id: '7', materialName: 'Packaging Boxes', type: 'in', quantity: 300, previousStock: 500, newStock: 800, reason: 'Purchase Order #PO-003', reference: 'PO-003', date: '2024-01-13T10:00:00', user: 'Admin' },
  { id: '8', materialName: 'Foam Padding', type: 'out', quantity: 15, previousStock: 60, newStock: 45, reason: 'Production Order #ORD-119', reference: 'ORD-119', date: '2024-01-12T14:30:00', user: 'Admin' },
]

export default function InventoryHistoryPage() {
  const [history, setHistory] = useState<StockMovement[]>(mockHistory)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.materialName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === 'all' || item.type === typeFilter
    return matchesSearch && matchesType
  })

  const stats = {
    total: history.length,
    stockIn: history.filter(h => h.type === 'in').length,
    stockOut: history.filter(h => h.type === 'out').length,
    totalInQty: history.filter(h => h.type === 'in').reduce((sum, h) => sum + h.quantity, 0),
    totalOutQty: history.filter(h => h.type === 'out').reduce((sum, h) => sum + h.quantity, 0),
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory History</h1>
          <p className="text-gray-500 mt-1">Track all stock movements and transactions</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Movements', value: stats.total, icon: History, color: 'from-blue-500' },
          { label: 'Stock In', value: stats.stockIn, icon: TrendingUp, color: 'from-emerald-500' },
          { label: 'Stock Out', value: stats.stockOut, icon: TrendingDown, color: 'from-rose-500' },
          { label: 'Total In Qty', value: stats.totalInQty, icon: ArrowUpRight, color: 'from-emerald-500' },
          { label: 'Total Out Qty', value: stats.totalOutQty, icon: ArrowDownRight, color: 'from-rose-500' },
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
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by material or reference..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="in">Stock In</SelectItem>
                <SelectItem value="out">Stock Out</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* History List */}
      {filteredHistory.length === 0 ? (
        <div className="text-center py-12">
          <History className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No history found</h3>
          <p className="text-gray-500 mt-1">Stock movements will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-0 shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-5">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.type === 'in' ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                        {item.type === 'in' ? (
                          <ArrowUpRight className="w-6 h-6 text-emerald-600" />
                        ) : (
                          <ArrowDownRight className="w-6 h-6 text-rose-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{item.materialName}</p>
                          <Badge className={item.type === 'in' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}>
                            {item.type === 'in' ? 'Stock In' : 'Stock Out'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{item.reason}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-6 text-center">
                      <div>
                        <p className="text-sm text-gray-500">Quantity</p>
                        <p className={`font-bold ${item.type === 'in' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {item.type === 'in' ? '+' : '-'}{item.quantity}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Previous</p>
                        <p className="font-semibold text-gray-700">{item.previousStock}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">New Stock</p>
                        <p className="font-bold text-gray-900">{item.newStock}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(item.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-gray-400">by {item.user}</p>
                      <p className="text-xs text-gray-400">{new Date(item.date).toLocaleTimeString()}</p>
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

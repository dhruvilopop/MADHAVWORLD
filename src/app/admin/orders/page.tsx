'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShoppingCart, Plus, Search, Filter, MoreVertical, Eye, Edit, 
  Trash2, Loader2, ChevronDown, Download, Calendar, DollarSign,
  Package, Clock, CheckCircle, XCircle, Truck, AlertCircle, ArrowRight,
  FileText, Mail, Phone, MapPin
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string | null
  customerPhone: string
  customerAddress: string | null
  total: number
  status: string
  paymentStatus: string
  orderDate: string
  expectedDate: string | null
  notes: string | null
  createdAt: string
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
  in_production: 'bg-violet-100 text-violet-700 border-violet-200',
  shipped: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  delivered: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  cancelled: 'bg-rose-100 text-rose-700 border-rose-200',
}

const paymentColors: Record<string, string> = {
  unpaid: 'bg-rose-100 text-rose-700',
  partial: 'bg-amber-100 text-amber-700',
  paid: 'bg-emerald-100 text-emerald-700',
}

const statusIcons: Record<string, React.ElementType> = {
  pending: Clock,
  confirmed: CheckCircle,
  in_production: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/orders')
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      // Sample data for demo
      setOrders([
        {
          id: '1',
          orderNumber: 'ORD-001',
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          customerPhone: '+91 98765 43210',
          customerAddress: '123 Main St, Delhi',
          total: 15000,
          status: 'pending',
          paymentStatus: 'unpaid',
          orderDate: new Date().toISOString(),
          expectedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Rush order - customer needs by Friday',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          orderNumber: 'ORD-002',
          customerName: 'Jane Smith',
          customerEmail: 'jane@example.com',
          customerPhone: '+91 98765 43211',
          customerAddress: '456 Oak Ave, Mumbai',
          total: 25000,
          status: 'in_production',
          paymentStatus: 'partial',
          orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          expectedDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Bulk order for corporate event',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          orderNumber: 'ORD-003',
          customerName: 'Bob Wilson',
          customerEmail: 'bob@example.com',
          customerPhone: '+91 98765 43212',
          customerAddress: '789 Pine Rd, Bangalore',
          total: 8500,
          status: 'delivered',
          paymentStatus: 'paid',
          orderDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          expectedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          notes: '',
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
    } catch (error) {
      console.error('Error updating order:', error)
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery)
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    inProduction: orders.filter(o => o.status === 'in_production').length,
    revenue: orders.reduce((sum, o) => sum + o.total, 0),
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 mt-1">Manage and track all orders</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Link href="/admin/orders/new">
            <Button className="bg-amber-500 hover:bg-amber-600 gap-2">
              <Plus className="w-4 h-4" />
              New Order
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: stats.total, icon: ShoppingCart, color: 'from-blue-500 to-indigo-600' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'from-amber-500 to-orange-600' },
          { label: 'In Production', value: stats.inProduction, icon: Package, color: 'from-violet-500 to-purple-600' },
          { label: 'Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: DollarSign, color: 'from-emerald-500 to-green-600' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
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
                placeholder="Search orders by number, customer, phone..."
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="in_production">In Production</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <ShoppingCart className="w-12 h-12 mb-4 text-gray-300" />
              <p>No orders found</p>
              <Link href="/admin/orders/new">
                <Button className="mt-4 bg-amber-500 hover:bg-amber-600">
                  Create First Order
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Order</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Customer</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Date</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Total</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Payment</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order, index) => {
                    const StatusIcon = statusIcons[order.status] || Clock
                    return (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                              <ShoppingCart className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{order.customerName}</p>
                          <p className="text-sm text-gray-500">{order.customerPhone}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-700">{new Date(order.orderDate).toLocaleDateString()}</p>
                          {order.expectedDate && (
                            <p className="text-sm text-gray-400">
                              Due: {new Date(order.expectedDate).toLocaleDateString()}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-900">₹{order.total.toLocaleString()}</p>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={statusColors[order.status]}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {order.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={paymentColors[order.paymentStatus]}>
                            {order.paymentStatus}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedOrder(order)
                                setShowDetails(true)
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'confirmed')}>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Mark Confirmed
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'in_production')}>
                                  <Package className="w-4 h-4 mr-2" />
                                  Start Production
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'shipped')}>
                                  <Truck className="w-4 h-4 mr-2" />
                                  Mark Shipped
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'delivered')}>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Mark Delivered
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-rose-600">
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Cancel Order
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-amber-500" />
              Order Details - {selectedOrder?.orderNumber}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6 mt-4">
              {/* Status */}
              <div className="flex items-center gap-4">
                <Badge className={statusColors[selectedOrder.status]}>
                  {selectedOrder.status.replace('_', ' ')}
                </Badge>
                <Badge className={paymentColors[selectedOrder.paymentStatus]}>
                  Payment: {selectedOrder.paymentStatus}
                </Badge>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-700">Customer Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="font-medium w-16">Name:</span>
                      {selectedOrder.customerName}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      {selectedOrder.customerPhone}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      {selectedOrder.customerEmail || 'N/A'}
                    </div>
                    <div className="flex items-start gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 mt-0.5" />
                      {selectedOrder.customerAddress || 'N/A'}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-700">Order Info</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      Order Date: {new Date(selectedOrder.orderDate).toLocaleDateString()}
                    </div>
                    {selectedOrder.expectedDate && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        Expected: {new Date(selectedOrder.expectedDate).toLocaleDateString()}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-900 font-semibold text-lg">
                      <DollarSign className="w-4 h-4" />
                      Total: ₹{selectedOrder.total.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="bg-amber-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span className="font-medium text-amber-800">Notes</span>
                  </div>
                  <p className="text-amber-700">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button className="flex-1 bg-amber-500 hover:bg-amber-600">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Invoice
                </Button>
                <Button variant="outline" className="flex-1">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Order
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

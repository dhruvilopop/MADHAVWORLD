'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Edit, Trash2, Package, User, Phone, Mail, MapPin,
  Calendar, Clock, FileText, DollarSign, Truck, CheckCircle, XCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string | null
  customerPhone: string
  customerAddress: string | null
  subtotal: number
  tax: number
  discount: number
  total: number
  status: string
  paymentStatus: string
  orderDate: string
  expectedDate: string | null
  shippedDate: string | null
  deliveredDate: string | null
  trackingNumber: string | null
  shippingMethod: string | null
  notes: string | null
  internalNotes: string | null
  createdAt: string
  OrderItem?: Array<{
    id: string
    productName: string
    quantity: number
    price: number
    total: number
  }>
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

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchOrder()
  }, [params.id])

  const fetchOrder = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/orders/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setOrder(data)
      } else {
        // Use sample data for demo
        setOrder({
          id: params.id as string,
          orderNumber: 'ORD-001',
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          customerPhone: '+91 98765 43210',
          customerAddress: '123 Main Street, Delhi, India',
          subtotal: 12500,
          tax: 2250,
          discount: 0,
          total: 14750,
          status: 'pending',
          paymentStatus: 'unpaid',
          orderDate: new Date().toISOString(),
          expectedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          shippedDate: null,
          deliveredDate: null,
          trackingNumber: null,
          shippingMethod: 'Standard Delivery',
          notes: 'Please call before delivery',
          internalNotes: null,
          createdAt: new Date().toISOString(),
          OrderItem: [
            { id: '1', productName: 'Premium Tote Bag', quantity: 5, price: 2500, total: 12500 },
          ]
        })
      }
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateStatus = async (field: string, value: string) => {
    try {
      await fetch(`/api/orders/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      })
      setOrder(prev => prev ? { ...prev, [field]: value } : null)
    } catch (error) {
      console.error('Error updating order:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Order Not Found</h2>
        <p className="text-gray-500 mb-6">The order you're looking for doesn't exist.</p>
        <Link href="/admin/orders">
          <Button className="bg-amber-500 hover:bg-amber-600">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{order.orderNumber}</h1>
              <Badge className={statusColors[order.status]}>
                {order.status.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-gray-500 mt-1">
              Created {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <FileText className="w-4 h-4" />
            Invoice
          </Button>
          <Button className="bg-amber-500 hover:bg-amber-600 gap-2">
            <Edit className="w-4 h-4" />
            Edit Order
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-500" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.OrderItem?.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{item.productName}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity} × ₹{item.price.toLocaleString()}</p>
                    </div>
                    <p className="font-bold text-gray-900">₹{item.total.toLocaleString()}</p>
                  </motion.div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{order.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>₹{order.tax.toLocaleString()}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span>-₹{order.discount.toLocaleString()}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-amber-600">₹{order.total.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Notes */}
          {(order.notes || order.internalNotes) && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.notes && (
                  <div className="p-4 bg-amber-50 rounded-xl">
                    <p className="text-sm font-medium text-amber-800 mb-1">Customer Notes</p>
                    <p className="text-amber-700">{order.notes}</p>
                  </div>
                )}
                {order.internalNotes && (
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <p className="text-sm font-medium text-blue-800 mb-1">Internal Notes</p>
                    <p className="text-blue-700">{order.internalNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-amber-500" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-semibold text-gray-900">{order.customerName}</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <a href={`tel:${order.customerPhone}`} className="hover:text-amber-600">
                    {order.customerPhone}
                  </a>
                </div>
                {order.customerEmail && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${order.customerEmail}`} className="hover:text-amber-600">
                      {order.customerEmail}
                    </a>
                  </div>
                )}
                {order.customerAddress && (
                  <div className="flex items-start gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 mt-0.5" />
                    <span>{order.customerAddress}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status Updates */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Order Status</label>
                <Select value={order.status} onValueChange={(v) => updateStatus('status', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="in_production">In Production</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Payment Status</label>
                <Select value={order.paymentStatus} onValueChange={(v) => updateStatus('paymentStatus', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Order Placed</p>
                    <p className="text-gray-500">{new Date(order.orderDate).toLocaleDateString()}</p>
                  </div>
                </div>
                {order.expectedDate && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                      <Truck className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Expected Delivery</p>
                      <p className="text-gray-500">{new Date(order.expectedDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
                {order.shippedDate && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center">
                      <Truck className="w-4 h-4 text-cyan-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Shipped</p>
                      <p className="text-gray-500">{new Date(order.shippedDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
                {order.deliveredDate && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Delivered</p>
                      <p className="text-gray-500">{new Date(order.deliveredDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="border-0 shadow-sm border-rose-200">
            <CardContent className="p-4">
              <Button 
                variant="outline" 
                className="w-full text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Cancel Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Users, ShoppingBag, DollarSign, Eye, MessageCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface AnalyticsData {
  summary: {
    totalOrders: number
    totalRevenue: number
    totalProducts: number
    totalCustomers: number
    totalEnquiries: number
    productViews: number
  }
  recentOrders: Array<{
    id: string
    orderNumber: string
    customerName: string
    total: number
    status: string
    createdAt: string
  }>
  topProducts: Array<{
    name: string
    orders: number
    revenue: number
  }>
  ordersByDay: Array<{
    date: string
    count: number
    total: number
  }>
  period: string
}

export default function AnalyticsAdminPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/analytics?period=${period}`)
      const analyticsData = await res.json()
      setData(analyticsData)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0)
  }

  const stats = [
    { label: 'Total Revenue', value: formatCurrency(data?.summary.totalRevenue || 0), icon: DollarSign, color: 'bg-green-500', change: '+12%' },
    { label: 'Total Orders', value: data?.summary.totalOrders || 0, icon: ShoppingBag, color: 'bg-blue-500', change: '+8%' },
    { label: 'Total Customers', value: data?.summary.totalCustomers || 0, icon: Users, color: 'bg-purple-500', change: '+15%' },
    { label: 'Product Views', value: data?.summary.productViews || 0, icon: Eye, color: 'bg-amber-500', change: '+20%' },
  ]

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading analytics...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your business performance</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-sm text-gray-500">{order.orderNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(order.total)}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {(!data?.recentOrders || data.recentOrders.length === 0) && (
                <p className="text-center text-gray-400 py-8">No recent orders</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Top Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.topProducts.map((product, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-sm font-medium">
                      {i + 1}
                    </span>
                    <p className="font-medium">{product.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{product.orders} orders</p>
                    <p className="text-sm text-gray-500">{formatCurrency(product.revenue)}</p>
                  </div>
                </div>
              ))}
              {(!data?.topProducts || data.topProducts.length === 0) && (
                <p className="text-center text-gray-400 py-8">No product data</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders by Day Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Orders Trend (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-end justify-between gap-2">
            {data?.ordersByDay?.slice(0, 7).reverse().map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.min((day.count / (Math.max(...(data?.ordersByDay?.map(d => d.count) || [1]))) * 100), 100)}%` }}
                  className="w-full bg-amber-500 rounded-t"
                />
                <span className="text-xs text-gray-500">
                  {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                </span>
              </div>
            ))}
            {(!data?.ordersByDay || data.ordersByDay.length === 0) && (
              <p className="text-center text-gray-400 w-full">No order data available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

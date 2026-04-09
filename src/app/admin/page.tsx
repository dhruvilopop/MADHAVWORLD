'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Package, Images, Mail, TrendingUp, Eye, ArrowRight, Loader2, 
  ShoppingCart, Users, DollarSign, Calendar, AlertCircle, 
  ArrowUpRight, ArrowDownRight, BarChart3, Clock, CheckCircle,
  Sparkles, FileText, Factory, Box, Bell
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Stats {
  products: number
  gallery: number
  enquiries: number
  newEnquiries: number
  orders: number
  pendingOrders: number
  customers: number
  revenue: number
  quotes: number
  lowStock: number
}

interface RecentOrder {
  id: string
  orderNumber: string
  customerName: string
  total: number
  status: string
  createdAt: string
}

interface RecentEnquiry {
  id: string
  name: string
  email: string
  subject: string | null
  message: string
  status: string
  createdAt: string
}

interface TopProduct {
  id: string
  name: string
  slug: string
  image: string
  stock: number
}

interface Activity {
  id: string
  type: string
  title: string
  time: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [recentEnquiries, setRecentEnquiries] = useState<RecentEnquiry[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/products?limit=5').then(r => r.json()),
      fetch('/api/gallery?limit=5').then(r => r.json()),
      fetch('/api/enquiries').then(r => r.json()),
      fetch('/api/admin/stats').then(r => r.json()).catch(() => null),
    ]).then(([products, gallery, enquiries, adminStats]) => {
      setStats({
        products: products.length,
        gallery: gallery.length,
        enquiries: enquiries.length,
        newEnquiries: enquiries.filter((e: RecentEnquiry) => e.status === 'new').length,
        orders: adminStats?.orders || 0,
        pendingOrders: adminStats?.pendingOrders || 0,
        customers: adminStats?.customers || 0,
        revenue: adminStats?.revenue || 0,
        quotes: adminStats?.quotes || 0,
        lowStock: adminStats?.lowStock || 0,
      })
      setTopProducts(products.slice(0, 5))
      setRecentEnquiries(enquiries.slice(0, 5))
      
      // Generate sample activities
      setActivities([
        { id: '1', type: 'order', title: 'New order #ORD-001 received', time: '2 min ago' },
        { id: '2', type: 'enquiry', title: 'New enquiry from John Doe', time: '15 min ago' },
        { id: '3', type: 'stock', title: 'Low stock alert: Leather Material', time: '1 hour ago' },
        { id: '4', type: 'quote', title: 'Quote #QT-005 accepted', time: '2 hours ago' },
        { id: '5', type: 'production', title: 'Order #ORD-098 moved to production', time: '3 hours ago' },
      ])
      
      setIsLoading(false)
    }).catch(console.error)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="w-10 h-10 text-amber-500" />
        </motion.div>
      </div>
    )
  }

  const mainStats = [
    {
      title: 'Total Revenue',
      value: `₹${(stats?.revenue || 0).toLocaleString()}`,
      change: '+12.5%',
      isUp: true,
      icon: DollarSign,
      color: 'from-emerald-500 to-green-600',
      lightColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
    {
      title: 'Total Orders',
      value: stats?.orders || 0,
      change: '+8.2%',
      isUp: true,
      icon: ShoppingCart,
      color: 'from-blue-500 to-indigo-600',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      badge: stats?.pendingOrders,
    },
    {
      title: 'Customers',
      value: stats?.customers || 0,
      change: '+5.1%',
      isUp: true,
      icon: Users,
      color: 'from-violet-500 to-purple-600',
      lightColor: 'bg-violet-50',
      textColor: 'text-violet-600',
    },
    {
      title: 'Products',
      value: stats?.products || 0,
      icon: Package,
      color: 'from-amber-500 to-orange-600',
      lightColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      badge: stats?.lowStock,
      badgeText: 'Low Stock',
    },
  ]

  const quickActions = [
    { name: 'Create Order', href: '/admin/orders/new', icon: ShoppingCart, color: 'bg-blue-500' },
    { name: 'New Quote', href: '/admin/quotes/new', icon: FileText, color: 'bg-emerald-500' },
    { name: 'Add Product', href: '/admin/products', icon: Package, color: 'bg-amber-500' },
    { name: 'Add Customer', href: '/admin/customers', icon: Users, color: 'bg-violet-500' },
    { name: 'Production', href: '/admin/production', icon: Factory, color: 'bg-rose-500' },
    { name: 'Inventory', href: '/admin/inventory', icon: Box, color: 'bg-cyan-500' },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-700'
      case 'pending': return 'bg-amber-100 text-amber-700'
      case 'confirmed': return 'bg-emerald-100 text-emerald-700'
      case 'shipped': return 'bg-violet-100 text-violet-700'
      case 'delivered': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-8 text-white"
      >
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-20 -right-20 w-64 h-64 border border-white/10 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-16 -left-16 w-48 h-48 border border-white/10 rounded-full"
          />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span className="text-amber-400 text-sm font-medium">Welcome back!</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, Admin
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            Here&apos;s what&apos;s happening with your business today. You have {stats?.newEnquiries || 0} new enquiries and {stats?.pendingOrders || 0} pending orders.
          </p>
        </div>
      </motion.div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  {stat.badge !== undefined && stat.badge > 0 && (
                    <Badge className="bg-rose-100 text-rose-600 hover:bg-rose-100">
                      {stat.badge} {stat.badgeText || 'New'}
                    </Badge>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                {stat.change && (
                  <div className="flex items-center gap-1 mt-3">
                    {stat.isUp ? (
                      <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-rose-500" />
                    )}
                    <span className={stat.isUp ? 'text-emerald-600 text-sm font-medium' : 'text-rose-600 text-sm font-medium'}>
                      {stat.change}
                    </span>
                    <span className="text-gray-400 text-sm">vs last month</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {quickActions.map((action) => (
                <Link key={action.name} href={action.href}>
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group"
                  >
                    <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 text-center">{action.name}</span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Charts & Orders */}
        <div className="lg:col-span-2 space-y-8">
          {/* Revenue Chart Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-lg font-semibold">Revenue Overview</CardTitle>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="text-xs">Week</Button>
                  <Button variant="ghost" size="sm" className="text-xs bg-amber-100 text-amber-700">Month</Button>
                  <Button variant="ghost" size="sm" className="text-xs">Year</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Revenue chart coming soon</p>
                    <p className="text-sm text-gray-400">Connect orders to see analytics</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
                <Link href="/admin/orders">
                  <Button variant="ghost" size="sm" className="gap-1 text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                    View All <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <ShoppingCart className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">{order.orderNumber}</p>
                          <p className="text-sm text-gray-500">{order.customerName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">₹{order.total.toLocaleString()}</p>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No orders yet</p>
                    <Link href="/admin/orders/new">
                      <Button className="mt-4 bg-amber-500 hover:bg-amber-600">
                        Create First Order
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-lg font-semibold">Top Products</CardTitle>
                <Link href="/admin/products">
                  <Button variant="ghost" size="sm" className="gap-1 text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                    View All <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center font-bold text-amber-600">
                        {index + 1}
                      </div>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{product.name}</p>
                        <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                      </div>
                      <Link href={`/products/${product.slug}`} target="_blank">
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column - Activity & Enquiries */}
        <div className="space-y-8">
          {/* Activity Feed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.type === 'order' ? 'bg-blue-100' :
                        activity.type === 'enquiry' ? 'bg-amber-100' :
                        activity.type === 'stock' ? 'bg-rose-100' :
                        activity.type === 'quote' ? 'bg-emerald-100' :
                        'bg-violet-100'
                      }`}>
                        {activity.type === 'order' && <ShoppingCart className="w-4 h-4 text-blue-600" />}
                        {activity.type === 'enquiry' && <Mail className="w-4 h-4 text-amber-600" />}
                        {activity.type === 'stock' && <AlertCircle className="w-4 h-4 text-rose-600" />}
                        {activity.type === 'quote' && <FileText className="w-4 h-4 text-emerald-600" />}
                        {activity.type === 'production' && <Factory className="w-4 h-4 text-violet-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700">{activity.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Enquiries */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-lg font-semibold">Recent Enquiries</CardTitle>
                <Link href="/admin/enquiries">
                  <Button variant="ghost" size="sm" className="gap-1 text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                    View All <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentEnquiries.map((enquiry) => (
                    <div key={enquiry.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-semibold text-sm">
                        {enquiry.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-900 truncate">{enquiry.name}</p>
                          {enquiry.status === 'new' && (
                            <Badge className="bg-blue-100 text-blue-700 text-xs">New</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate">{enquiry.subject || enquiry.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(enquiry.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-orange-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">This Month</p>
                    <p className="text-sm text-gray-500">Performance Summary</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4">
                    <p className="text-sm text-gray-500">Enquiries</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.enquiries || 0}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4">
                    <p className="text-sm text-gray-500">Gallery</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.gallery || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

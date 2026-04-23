'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Bell, Search, Check, Trash2, Settings, 
  Package, Users, Mail, AlertTriangle, CheckCircle
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

interface Notification {
  id: string
  type: 'order' | 'enquiry' | 'stock' | 'system'
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

const mockNotifications: Notification[] = [
  { id: '1', type: 'order', title: 'New Order Received', message: 'Order #ORD-125 has been placed by John Doe for ₹15,500', isRead: false, createdAt: '2024-01-15T10:30:00' },
  { id: '2', type: 'enquiry', title: 'New Enquiry', message: 'Sarah Smith has submitted an enquiry about custom leather products', isRead: false, createdAt: '2024-01-15T09:15:00' },
  { id: '3', type: 'stock', title: 'Low Stock Alert', message: 'Zippers (Various) is running low. Current stock: 150, Minimum: 300', isRead: false, createdAt: '2024-01-15T08:00:00' },
  { id: '4', type: 'order', title: 'Order Shipped', message: 'Order #ORD-120 has been shipped via Express Delivery', isRead: true, createdAt: '2024-01-14T16:45:00' },
  { id: '5', type: 'system', title: 'Backup Completed', message: 'Daily database backup completed successfully', isRead: true, createdAt: '2024-01-14T14:00:00' },
  { id: '6', type: 'stock', title: 'Stock Restocked', message: 'Leather Sheet (Premium) has been restocked. New stock: 500 sq ft', isRead: true, createdAt: '2024-01-14T11:30:00' },
  { id: '7', type: 'enquiry', title: 'Enquiry Resolved', message: 'Enquiry from Mike Johnson has been marked as resolved', isRead: true, createdAt: '2024-01-13T15:20:00' },
  { id: '8', type: 'order', title: 'Order Delivered', message: 'Order #ORD-115 has been delivered successfully', isRead: true, createdAt: '2024-01-13T10:00:00' },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [readFilter, setReadFilter] = useState('all')

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === 'all' || notification.type === typeFilter
    const matchesRead = readFilter === 'all' || 
      (readFilter === 'unread' && !notification.isRead) ||
      (readFilter === 'read' && notification.isRead)
    return matchesSearch && matchesType && matchesRead
  })

  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.isRead).length,
    orders: notifications.filter(n => n.type === 'order').length,
    enquiries: notifications.filter(n => n.type === 'enquiry').length,
    alerts: notifications.filter(n => n.type === 'stock').length,
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'order': return Package
      case 'enquiry': return Mail
      case 'stock': return AlertTriangle
      default: return Bell
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'order': return 'bg-blue-100 text-blue-600'
      case 'enquiry': return 'bg-amber-100 text-amber-600'
      case 'stock': return 'bg-rose-100 text-rose-600'
      default: return 'bg-violet-100 text-violet-600'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">View and manage all your notifications</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={markAllAsRead}>
            <Check className="w-4 h-4" />
            Mark All Read
          </Button>
          <Button variant="outline" className="gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: Bell, color: 'from-blue-500' },
          { label: 'Unread', value: stats.unread, icon: AlertTriangle, color: 'from-rose-500' },
          { label: 'Orders', value: stats.orders, icon: Package, color: 'from-emerald-500' },
          { label: 'Enquiries', value: stats.enquiries, icon: Mail, color: 'from-amber-500' },
          { label: 'Alerts', value: stats.alerts, icon: AlertTriangle, color: 'from-violet-500' },
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
                placeholder="Search notifications..."
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
                <SelectItem value="order">Orders</SelectItem>
                <SelectItem value="enquiry">Enquiries</SelectItem>
                <SelectItem value="stock">Stock Alerts</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
            <Select value={readFilter} onValueChange={setReadFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No notifications found</h3>
          <p className="text-gray-500 mt-1">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification, index) => {
            const TypeIcon = getTypeIcon(notification.type)
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`border-0 shadow-sm hover:shadow-md transition-all ${!notification.isRead ? 'bg-amber-50/50 border-l-4 border-l-amber-500' : ''}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getTypeColor(notification.type)}`}>
                        <TypeIcon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{notification.title}</p>
                          {!notification.isRead && (
                            <Badge className="bg-amber-100 text-amber-700 text-xs">New</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {!notification.isRead && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 gap-1"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="w-4 h-4" />
                            Mark Read
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => deleteNotification(notification.id)}
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

'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, Plus, Search, Filter, MoreVertical, Eye, Edit, 
  Trash2, Loader2, Phone, Mail, MapPin, Building, Calendar,
  DollarSign, ShoppingBag, Star, UserPlus, ArrowRight
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
import { Textarea } from '@/components/ui/textarea'

interface Customer {
  id: string
  name: string
  email: string | null
  phone: string
  address: string | null
  company: string | null
  gstNumber: string | null
  group: string
  notes: string | null
  totalOrders: number
  totalSpent: number
  lastOrderAt: string | null
  createdAt: string
}

const groupColors: Record<string, string> = {
  retail: 'bg-blue-100 text-blue-700',
  wholesale: 'bg-violet-100 text-violet-700',
  vip: 'bg-amber-100 text-amber-700',
  new: 'bg-emerald-100 text-emerald-700',
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [groupFilter, setGroupFilter] = useState('all')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    company: '',
    gstNumber: '',
    group: 'retail',
    notes: '',
  })

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/customers')
      const data = await res.json()
      setCustomers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching customers:', error)
      // Sample data
      setCustomers([
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+91 98765 43210',
          address: '123 Main St, New Delhi',
          company: 'Doe Enterprises',
          gstNumber: 'GST12345678',
          group: 'wholesale',
          notes: 'Preferred customer for bulk orders',
          totalOrders: 15,
          totalSpent: 250000,
          lastOrderAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+91 98765 43211',
          address: '456 Oak Avenue, Mumbai',
          company: null,
          gstNumber: null,
          group: 'retail',
          notes: '',
          totalOrders: 3,
          totalSpent: 45000,
          lastOrderAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          name: 'VIP Corp Ltd',
          email: 'orders@vipcorp.com',
          phone: '+91 98765 43212',
          address: '789 Business Park, Bangalore',
          company: 'VIP Corp Ltd',
          gstNumber: 'GST87654321',
          group: 'vip',
          notes: 'VIP customer - priority handling',
          totalOrders: 50,
          totalSpent: 1500000,
          lastOrderAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCustomer = async () => {
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        setShowAddModal(false)
        setFormData({
          name: '',
          email: '',
          phone: '',
          address: '',
          company: '',
          gstNumber: '',
          group: 'retail',
          notes: '',
        })
        fetchCustomers()
      }
    } catch (error) {
      console.error('Error adding customer:', error)
    }
  }

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery) ||
      (customer.email?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (customer.company?.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesGroup = groupFilter === 'all' || customer.group === groupFilter
    return matchesSearch && matchesGroup
  })

  const stats = {
    total: customers.length,
    retail: customers.filter(c => c.group === 'retail').length,
    wholesale: customers.filter(c => c.group === 'wholesale').length,
    vip: customers.filter(c => c.group === 'vip').length,
    totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 mt-1">Manage your customer relationships</p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="bg-amber-500 hover:bg-amber-600 gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Add Customer
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Customers', value: stats.total, icon: Users, color: 'from-blue-500 to-indigo-600' },
          { label: 'Retail', value: stats.retail, icon: ShoppingBag, color: 'from-cyan-500 to-blue-600' },
          { label: 'Wholesale', value: stats.wholesale, icon: Building, color: 'from-violet-500 to-purple-600' },
          { label: 'VIP', value: stats.vip, icon: Star, color: 'from-amber-500 to-orange-600' },
          { label: 'Total Revenue', value: `₹${(stats.totalRevenue / 1000).toFixed(0)}K`, icon: DollarSign, color: 'from-emerald-500 to-green-600' },
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
                placeholder="Search by name, phone, email, company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={groupFilter} onValueChange={setGroupFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Groups</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="wholesale">Wholesale</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
                <SelectItem value="new">New</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customers Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer, index) => (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg">
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                        {customer.company && (
                          <p className="text-sm text-gray-500">{customer.company}</p>
                        )}
                      </div>
                    </div>
                    <Badge className={groupColors[customer.group]}>
                      {customer.group}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {customer.phone}
                    </div>
                    {customer.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {customer.email}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500">Total Spent</p>
                      <p className="font-bold text-gray-900">₹{customer.totalSpent.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Orders</p>
                      <p className="font-bold text-gray-900">{customer.totalOrders}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedCustomer(customer)
                        setShowDetails(true)
                      }}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Customer Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Input
              placeholder="Customer Name *"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
            <Input
              placeholder="Phone Number *"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
            <Input
              placeholder="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
            <Select value={formData.group} onValueChange={(v) => setFormData(prev => ({ ...prev, group: v }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="wholesale">Wholesale</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
                <SelectItem value="new">New</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Company"
              value={formData.company}
              onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
            />
            <Input
              placeholder="GST Number"
              value={formData.gstNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, gstNumber: e.target.value }))}
            />
            <div className="col-span-2">
              <Input
                placeholder="Address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
            <div className="col-span-2">
              <Textarea
                placeholder="Notes..."
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleAddCustomer}
              disabled={!formData.name || !formData.phone}
              className="flex-1 bg-amber-500 hover:bg-amber-600"
            >
              Add Customer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Customer Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6 mt-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-2xl">
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedCustomer.name}</h3>
                  {selectedCustomer.company && (
                    <p className="text-gray-500">{selectedCustomer.company}</p>
                  )}
                  <Badge className={groupColors[selectedCustomer.group]}>
                    {selectedCustomer.group}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-700">Contact Info</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      {selectedCustomer.phone}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      {selectedCustomer.email || 'No email'}
                    </div>
                    <div className="flex items-start gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 mt-0.5" />
                      {selectedCustomer.address || 'No address'}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-700">Statistics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-500">Total Orders</p>
                      <p className="text-2xl font-bold text-gray-900">{selectedCustomer.totalOrders}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-500">Total Spent</p>
                      <p className="text-2xl font-bold text-gray-900">₹{(selectedCustomer.totalSpent / 1000).toFixed(0)}K</p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedCustomer.notes && (
                <div className="bg-amber-50 rounded-xl p-4">
                  <p className="text-sm font-medium text-amber-800 mb-1">Notes</p>
                  <p className="text-amber-700">{selectedCustomer.notes}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                <Button variant="outline" className="flex-1">
                  View Orders
                </Button>
                <Button className="flex-1 bg-amber-500 hover:bg-amber-600">
                  Create Order
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

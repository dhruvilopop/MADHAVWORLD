'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  DollarSign, TrendingUp, TrendingDown, ShoppingCart, Users,
  Calendar, Download, BarChart3, PieChart, ArrowUpRight, ArrowDownRight,
  Loader2, FileSpreadsheet
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface SalesData {
  period: string
  revenue: number
  orders: number
  customers: number
}

export default function SalesReportPage() {
  const [period, setPeriod] = useState('month')
  const [salesData, setSalesData] = useState<SalesData[]>([
    { period: 'Jan', revenue: 150000, orders: 45, customers: 32 },
    { period: 'Feb', revenue: 180000, orders: 52, customers: 38 },
    { period: 'Mar', revenue: 220000, orders: 68, customers: 45 },
    { period: 'Apr', revenue: 195000, orders: 58, customers: 42 },
    { period: 'May', revenue: 280000, orders: 85, customers: 56 },
    { period: 'Jun', revenue: 310000, orders: 92, customers: 65 },
  ])
  const [isLoading, setIsLoading] = useState(false)

  const totalRevenue = salesData.reduce((sum, d) => sum + d.revenue, 0)
  const totalOrders = salesData.reduce((sum, d) => sum + d.orders, 0)
  const totalCustomers = salesData.reduce((sum, d) => sum + d.customers, 0)
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0

  const exportToExcel = () => {
    // Generate CSV content
    const headers = ['Period', 'Revenue', 'Orders', 'Customers']
    const rows = salesData.map(d => [d.period, d.revenue.toString(), d.orders.toString(), d.customers.toString()])
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sales-report-${period}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const maxRevenue = Math.max(...salesData.map(d => d.revenue), 1)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Report</h1>
          <p className="text-gray-500 mt-1">Track revenue and sales performance</p>
        </div>
        <div className="flex gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportToExcel} className="gap-2 bg-emerald-500 hover:bg-emerald-600">
            <FileSpreadsheet className="w-4 h-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { 
            label: 'Total Revenue', 
            value: `₹${totalRevenue.toLocaleString()}`, 
            change: '+12.5%', 
            isUp: true,
            icon: DollarSign, 
            color: 'from-emerald-500 to-green-600' 
          },
          { 
            label: 'Total Orders', 
            value: totalOrders, 
            change: '+8.2%', 
            isUp: true,
            icon: ShoppingCart, 
            color: 'from-blue-500 to-indigo-600' 
          },
          { 
            label: 'New Customers', 
            value: totalCustomers, 
            change: '+15.3%', 
            isUp: true,
            icon: Users, 
            color: 'from-violet-500 to-purple-600' 
          },
          { 
            label: 'Avg Order Value', 
            value: `₹${avgOrderValue.toLocaleString()}`, 
            change: '-2.1%', 
            isUp: false,
            icon: TrendingUp, 
            color: 'from-amber-500 to-orange-600' 
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-0 shadow-sm hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <Badge className={stat.isUp ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}>
                    {stat.isUp ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                    {stat.change}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Revenue Trend</CardTitle>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="gap-1">
                <BarChart3 className="w-4 h-4" />
                Bar
              </Button>
              <Button variant="ghost" size="sm" className="gap-1">
                <PieChart className="w-4 h-4" />
                Pie
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Simple Bar Chart */}
              <div className="flex items-end gap-4 h-64 px-4">
                {salesData.map((data, index) => (
                  <motion.div
                    key={data.period}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: `${(data.revenue / maxRevenue) * 100}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="flex-1 flex flex-col items-center"
                  >
                    <div 
                      className="w-full bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-lg shadow-lg relative group cursor-pointer hover:from-amber-600 hover:to-amber-500 transition-colors"
                      style={{ height: '100%' }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        ₹{data.revenue.toLocaleString()}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              {/* Labels */}
              <div className="flex gap-4 px-4">
                {salesData.map(data => (
                  <div key={data.period} className="flex-1 text-center">
                    <p className="text-sm font-medium text-gray-600">{data.period}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Detailed Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Period</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Revenue</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Orders</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Customers</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Avg Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {salesData.map((data, index) => (
                  <motion.tr
                    key={data.period}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4 font-medium text-gray-900">{data.period}</td>
                    <td className="py-4 px-4 text-right font-semibold text-gray-900">₹{data.revenue.toLocaleString()}</td>
                    <td className="py-4 px-4 text-right text-gray-600">{data.orders}</td>
                    <td className="py-4 px-4 text-right text-gray-600">{data.customers}</td>
                    <td className="py-4 px-4 text-right text-gray-600">₹{Math.round(data.revenue / data.orders).toLocaleString()}</td>
                  </motion.tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 bg-gray-50">
                  <td className="py-4 px-4 font-bold text-gray-900">Total</td>
                  <td className="py-4 px-4 text-right font-bold text-gray-900">₹{totalRevenue.toLocaleString()}</td>
                  <td className="py-4 px-4 text-right font-bold text-gray-900">{totalOrders}</td>
                  <td className="py-4 px-4 text-right font-bold text-gray-900">{totalCustomers}</td>
                  <td className="py-4 px-4 text-right font-bold text-gray-900">₹{avgOrderValue.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

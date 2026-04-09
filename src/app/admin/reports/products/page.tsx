'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Package, TrendingUp, TrendingDown, AlertTriangle, Download,
  BarChart3, Loader2, FileSpreadsheet, Eye, StockChart
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface ProductReport {
  id: string
  name: string
  category: string
  stock: number
  lowStockAlert: number
  totalSold: number
  revenue: number
  image: string
}

export default function ProductReportPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [products, setProducts] = useState<ProductReport[]>([])

  useEffect(() => {
    loadReport()
  }, [])

  const loadReport = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/products')
      if (res.ok) {
        const data = await res.json()
        setProducts(data.slice(0, 10).map((p: {id: string; name: string; image: string; stock: number; lowStockAlert: number}) => ({
          id: p.id,
          name: p.name,
          category: 'Bags',
          stock: p.stock || 0,
          lowStockAlert: p.lowStockAlert || 10,
          totalSold: Math.floor(Math.random() * 100),
          revenue: Math.floor(Math.random() * 100000) + 10000,
          image: p.image,
        })))
      }
    } catch {
      console.error('Error loading report')
    } finally {
      setIsLoading(false)
    }
  }

  const totalStock = products.reduce((sum, p) => sum + p.stock, 0)
  const lowStockCount = products.filter(p => p.stock <= p.lowStockAlert).length
  const totalRevenue = products.reduce((sum, p) => sum + p.revenue, 0)

  const exportToExcel = () => {
    const headers = ['Product', 'Category', 'Stock', 'Status', 'Total Sold', 'Revenue']
    const rows = products.map(p => [
      p.name, 
      p.category, 
      p.stock.toString(), 
      p.stock <= p.lowStockAlert ? 'Low Stock' : 'In Stock',
      p.totalSold.toString(), 
      p.revenue.toString()
    ])
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'product-report.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Report</h1>
          <p className="text-gray-500 mt-1">Analyze product performance and stock levels</p>
        </div>
        <Button onClick={exportToExcel} className="gap-2 bg-emerald-500 hover:bg-emerald-600">
          <FileSpreadsheet className="w-4 h-4" />
          Export Excel
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Products', value: products.length, icon: Package, color: 'from-blue-500 to-indigo-600' },
          { label: 'Total Stock', value: totalStock, icon: BarChart3, color: 'from-emerald-500 to-green-600' },
          { label: 'Low Stock Items', value: lowStockCount, icon: AlertTriangle, color: 'from-amber-500 to-orange-600' },
          { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'from-violet-500 to-purple-600' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
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

      {/* Product List */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Product Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product, index) => {
                const isLowStock = product.stock <= product.lowStockAlert
                const stockPercentage = Math.min((product.stock / 100) * 100, 100)
                
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                        {isLowStock && (
                          <Badge className="bg-rose-100 text-rose-700">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Low Stock
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{product.category}</p>
                      <div className="mt-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500">Stock: {product.stock}</span>
                          <Progress value={stockPercentage} className="h-2 w-24" />
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">₹{product.revenue.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">{product.totalSold} sold</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

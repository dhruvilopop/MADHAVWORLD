'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Factory, Loader2, Package, CheckCircle, Clock, AlertTriangle,
  Calendar, User, FileText, ArrowRight, Truck
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface ProductionOrder {
  id: string
  orderNumber: string
  customerName: string
  stage: string
  progress: number
  assignedTo: string | null
  startDate: string | null
  estimatedCompletion: string | null
  notes: string | null
  total: number
  createdAt: string
}

const stages = [
  { id: 'pending', name: 'Pending', icon: Clock, color: 'bg-gray-100 text-gray-700' },
  { id: 'design', name: 'Design', icon: FileText, color: 'bg-blue-100 text-blue-700' },
  { id: 'material_prep', name: 'Material Prep', icon: Package, color: 'bg-amber-100 text-amber-700' },
  { id: 'cutting', name: 'Cutting', icon: Factory, color: 'bg-violet-100 text-violet-700' },
  { id: 'stitching', name: 'Stitching', icon: Factory, color: 'bg-rose-100 text-rose-700' },
  { id: 'finishing', name: 'Finishing', icon: CheckCircle, color: 'bg-cyan-100 text-cyan-700' },
  { id: 'quality_check', name: 'QC', icon: CheckCircle, color: 'bg-emerald-100 text-emerald-700' },
  { id: 'ready_to_ship', name: 'Ready', icon: Truck, color: 'bg-green-100 text-green-700' },
]

const stageColors: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700 border-gray-200',
  design: 'bg-blue-100 text-blue-700 border-blue-200',
  material_prep: 'bg-amber-100 text-amber-700 border-amber-200',
  cutting: 'bg-violet-100 text-violet-700 border-violet-200',
  stitching: 'bg-rose-100 text-rose-700 border-rose-200',
  finishing: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  quality_check: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  ready_to_ship: 'bg-green-100 text-green-700 border-green-200',
}

export default function ProductionPage() {
  const [orders, setOrders] = useState<ProductionOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStage, setSelectedStage] = useState<string | null>(null)

  useEffect(() => {
    fetchProduction()
  }, [])

  const fetchProduction = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/production')
      if (res.ok) {
        const data = await res.json()
        setOrders(Array.isArray(data) ? data : [])
      } else {
        // Sample data
        setOrders([
          {
            id: '1',
            orderNumber: 'ORD-001',
            customerName: 'John Doe',
            stage: 'cutting',
            progress: 45,
            assignedTo: 'Rajesh Kumar',
            startDate: new Date().toISOString(),
            estimatedCompletion: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            notes: 'Premium leather, custom handles',
            total: 15000,
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            orderNumber: 'ORD-002',
            customerName: 'Jane Smith',
            stage: 'stitching',
            progress: 70,
            assignedTo: 'Amit Singh',
            startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            estimatedCompletion: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
            notes: 'Bulk order - corporate event',
            total: 25000,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '3',
            orderNumber: 'ORD-003',
            customerName: 'Bob Wilson',
            stage: 'design',
            progress: 20,
            assignedTo: 'Priya Sharma',
            startDate: null,
            estimatedCompletion: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            notes: 'Custom design required',
            total: 8500,
            createdAt: new Date().toISOString(),
          },
          {
            id: '4',
            orderNumber: 'ORD-004',
            customerName: 'Alice Brown',
            stage: 'quality_check',
            progress: 90,
            assignedTo: 'Sunil Verma',
            startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            estimatedCompletion: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
            notes: '',
            total: 12000,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ])
      }
    } catch {
      console.error('Error fetching production')
    } finally {
      setIsLoading(false)
    }
  }

  const updateStage = async (orderId: string, newStage: string) => {
    try {
      await fetch(`/api/production/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage })
      })
      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, stage: newStage, progress: getProgressForStage(newStage) } : o
      ))
    } catch (error) {
      console.error('Error updating stage:', error)
    }
  }

  const getProgressForStage = (stage: string): number => {
    const stageIndex = stages.findIndex(s => s.id === stage)
    return Math.round((stageIndex / (stages.length - 1)) * 100)
  }

  const getStageIndex = (stage: string): number => {
    return stages.findIndex(s => s.id === stage)
  }

  const filteredOrders = selectedStage 
    ? orders.filter(o => o.stage === selectedStage)
    : orders

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.stage === 'pending').length,
    inProgress: orders.filter(o => !['pending', 'ready_to_ship'].includes(o.stage)).length,
    ready: orders.filter(o => o.stage === 'ready_to_ship').length,
    overdue: orders.filter(o => {
      if (!o.estimatedCompletion) return false
      return new Date(o.estimatedCompletion) < new Date() && o.stage !== 'ready_to_ship'
    }).length,
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Production Pipeline</h1>
          <p className="text-gray-500 mt-1">Track and manage production stages</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Calendar className="w-4 h-4" />
            Calendar View
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Orders', value: stats.total, icon: Package, color: 'from-blue-500 to-indigo-600' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'from-gray-500 to-gray-600' },
          { label: 'In Progress', value: stats.inProgress, icon: Factory, color: 'from-amber-500 to-orange-600' },
          { label: 'Ready to Ship', value: stats.ready, icon: CheckCircle, color: 'from-emerald-500 to-green-600' },
          { label: 'Overdue', value: stats.overdue, icon: AlertTriangle, color: 'from-rose-500 to-red-600' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className={`border-0 shadow-sm ${stat.label === 'Overdue' && stats.overdue > 0 ? 'ring-2 ring-rose-200' : ''}`}>
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

      {/* Pipeline Visualization */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Production Stages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 overflow-x-auto pb-4">
            {stages.map((stage, index) => {
              const count = orders.filter(o => o.stage === stage.id).length
              const isSelected = selectedStage === stage.id
              return (
                <motion.button
                  key={stage.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedStage(isSelected ? null : stage.id)}
                  className={`flex-shrink-0 flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                    isSelected 
                      ? 'border-amber-500 bg-amber-50' 
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl ${stage.color} flex items-center justify-center mb-2`}>
                    <stage.icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{stage.name}</span>
                  <span className="text-lg font-bold text-gray-900">{count}</span>
                </motion.button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              {selectedStage 
                ? `${stages.find(s => s.id === selectedStage)?.name} Orders` 
                : 'All Production Orders'}
            </CardTitle>
            {selectedStage && (
              <Button variant="ghost" size="sm" onClick={() => setSelectedStage(null)}>
                Clear Filter
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Factory className="w-12 h-12 mb-4 text-gray-300" />
              <p>No orders in production</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order, index) => {
                const currentStageIndex = getStageIndex(order.stage)
                const isOverdue = order.estimatedCompletion && 
                  new Date(order.estimatedCompletion) < new Date() && 
                  order.stage !== 'ready_to_ship'

                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-5 rounded-xl border ${isOverdue ? 'border-rose-200 bg-rose-50/50' : 'border-gray-100 bg-gray-50/50'} hover:shadow-md transition-shadow`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Order Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{order.orderNumber}</h3>
                          <Badge className={stageColors[order.stage]}>
                            {stages.find(s => s.id === order.stage)?.name}
                          </Badge>
                          {isOverdue && (
                            <Badge className="bg-rose-100 text-rose-700">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Overdue
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{order.customerName}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          {order.assignedTo && (
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {order.assignedTo}
                            </div>
                          )}
                          {order.estimatedCompletion && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Due: {new Date(order.estimatedCompletion).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="w-full md:w-48">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-500">Progress</span>
                          <span className="font-medium">{order.progress}%</span>
                        </div>
                        <Progress value={order.progress} className="h-2" />
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {currentStageIndex < stages.length - 1 && (
                          <Button
                            size="sm"
                            onClick={() => updateStage(order.id, stages[currentStageIndex + 1].id)}
                            className="bg-amber-500 hover:bg-amber-600"
                          >
                            <ArrowRight className="w-4 h-4 mr-1" />
                            Next Stage
                          </Button>
                        )}
                      </div>
                    </div>

                    {order.notes && (
                      <div className="mt-3 p-3 bg-white rounded-lg text-sm text-gray-600">
                        <FileText className="w-4 h-4 inline mr-2 text-gray-400" />
                        {order.notes}
                      </div>
                    )}
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

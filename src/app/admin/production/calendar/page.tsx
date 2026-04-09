'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ChevronLeft, ChevronRight, Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ProductionOrder {
  id: string
  orderNumber: string
  customerName: string
  stage: string
  progress: number
  estimatedCompletion: string | null
  total: number
}

const stageColors: Record<string, string> = {
  pending: 'bg-gray-500',
  design: 'bg-blue-500',
  material_prep: 'bg-amber-500',
  cutting: 'bg-violet-500',
  stitching: 'bg-rose-500',
  finishing: 'bg-cyan-500',
  quality_check: 'bg-emerald-500',
  ready_to_ship: 'bg-green-500',
}

export default function ProductionCalendarPage() {
  const [orders, setOrders] = useState<ProductionOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    loadProduction()
  }, [])

  const loadProduction = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/production')
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
      } else {
        setOrders([
          {
            id: '1',
            orderNumber: 'ORD-001',
            customerName: 'John Doe',
            stage: 'cutting',
            progress: 45,
            estimatedCompletion: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            total: 15000,
          },
          {
            id: '2',
            orderNumber: 'ORD-002',
            customerName: 'Jane Smith',
            stage: 'stitching',
            progress: 70,
            estimatedCompletion: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
            total: 25000,
          },
          {
            id: '3',
            orderNumber: 'ORD-003',
            customerName: 'Bob Wilson',
            stage: 'design',
            progress: 20,
            estimatedCompletion: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            total: 8500,
          },
        ])
      }
    } catch {
      console.error('Error loading production')
    } finally {
      setIsLoading(false)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days = []
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ day: null, date: null })
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ day, date: new Date(year, month, day) })
    }
    return days
  }

  const getOrdersForDate = (date: Date | null) => {
    if (!date) return []
    return orders.filter(order => {
      if (!order.estimatedCompletion) return false
      const orderDate = new Date(order.estimatedCompletion)
      return orderDate.toDateString() === date.toDateString()
    })
  }

  const isToday = (date: Date | null) => {
    if (!date) return false
    return date.toDateString() === new Date().toDateString()
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const days = getDaysInMonth(currentDate)
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Production Calendar</h1>
        <p className="text-gray-500 mt-1">View production deadlines in calendar format</p>
      </div>

      {/* Legend */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            {Object.entries(stageColors).slice(0, 5).map(([stage, color]) => (
              <div key={stage} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${color}`} />
                <span className="text-sm text-gray-600 capitalize">{stage.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={previousMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {dayNames.map(day => (
                <div key={day} className="p-3 text-center text-sm font-semibold text-gray-600">
                  {day}
                </div>
              ))}
              {days.map((day, index) => {
                const ordersOnDay = getOrdersForDate(day.date)
                const today = isToday(day.date)
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.01 }}
                    className={`min-h-24 p-2 rounded-lg border ${today ? 'border-amber-500 bg-amber-50' : 'border-gray-100'}`}
                  >
                    {day.day && (
                      <>
                        <div className={`text-sm font-medium mb-1 ${today ? 'text-amber-600' : 'text-gray-700'}`}>
                          {day.day}
                        </div>
                        <div className="space-y-1">
                          {ordersOnDay.slice(0, 2).map(order => (
                            <div
                              key={order.id}
                              className={`text-xs p-1 rounded ${stageColors[order.stage]} text-white truncate`}
                            >
                              {order.orderNumber}
                            </div>
                          ))}
                          {ordersOnDay.length > 2 && (
                            <div className="text-xs text-gray-500 text-center">
                              +{ordersOnDay.length - 2} more
                            </div>
                          )}
                        </div>
                      </>
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

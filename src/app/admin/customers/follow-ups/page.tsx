'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, Clock, User, Plus, CheckCircle, AlertTriangle,
  Phone, Mail, MessageSquare, Loader2, Bell
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface FollowUp {
  id: string
  customerId: string
  customerName: string
  type: string
  title: string
  description: string | null
  dueDate: string
  status: string
  completedAt: string | null
  createdAt: string
}

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [filter, setFilter] = useState('all')
  
  const [newFollowUp, setNewFollowUp] = useState({
    customerName: '',
    type: 'call',
    title: '',
    description: '',
    dueDate: '',
  })

  useEffect(() => {
    loadFollowUps()
  }, [])

  const loadFollowUps = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/follow-ups')
      if (res.ok) {
        const data = await res.json()
        setFollowUps(data)
      } else {
        setFollowUps([
          {
            id: '1',
            customerId: '1',
            customerName: 'John Doe',
            type: 'call',
            title: 'Follow up on bulk order inquiry',
            description: 'Discuss pricing for 500+ units',
            dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'pending',
            completedAt: null,
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            customerId: '2',
            customerName: 'Jane Smith',
            type: 'email',
            title: 'Send product catalog',
            description: 'Include new collection items',
            dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'pending',
            completedAt: null,
            createdAt: new Date().toISOString(),
          },
          {
            id: '3',
            customerId: '3',
            customerName: 'Bob Wilson',
            type: 'meeting',
            title: 'Discuss custom design requirements',
            description: 'Corporate branding discussion',
            dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'overdue',
            completedAt: null,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '4',
            customerId: '4',
            customerName: 'Alice Brown',
            type: 'call',
            title: 'Payment reminder',
            description: 'Outstanding invoice #INV-001',
            dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'completed',
            completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ])
      }
    } catch {
      console.error('Error loading follow-ups')
    } finally {
      setIsLoading(false)
    }
  }

  const addFollowUp = async () => {
    try {
      const res = await fetch('/api/follow-ups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFollowUp)
      })
      if (res.ok) {
        const data = await res.json()
        setFollowUps(prev => [data, ...prev])
        setShowAddDialog(false)
        setNewFollowUp({
          customerName: '',
          type: 'call',
          title: '',
          description: '',
          dueDate: '',
        })
      }
    } catch {
      console.error('Error adding follow-up')
    }
  }

  const markComplete = async (id: string) => {
    try {
      await fetch(`/api/follow-ups/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed', completedAt: new Date().toISOString() })
      })
      setFollowUps(prev => prev.map(f => 
        f.id === id ? { ...f, status: 'completed', completedAt: new Date().toISOString() } : f
      ))
    } catch {
      console.error('Error updating follow-up')
    }
  }

  const filteredFollowUps = followUps.filter(f => {
    if (filter === 'all') return true
    if (filter === 'pending') return f.status === 'pending'
    if (filter === 'overdue') return f.status === 'overdue' || (f.status === 'pending' && new Date(f.dueDate) < new Date())
    if (filter === 'completed') return f.status === 'completed'
    return true
  })

  const stats = {
    total: followUps.length,
    pending: followUps.filter(f => f.status === 'pending' && new Date(f.dueDate) >= new Date()).length,
    overdue: followUps.filter(f => f.status === 'overdue' || (f.status === 'pending' && new Date(f.dueDate) < new Date())).length,
    completed: followUps.filter(f => f.status === 'completed').length,
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'call': return Phone
      case 'email': return Mail
      case 'meeting': return Calendar
      default: return MessageSquare
    }
  }

  const getStatusBadge = (status: string, dueDate: string) => {
    const isOverdue = status !== 'completed' && new Date(dueDate) < new Date()
    if (status === 'completed') return 'bg-emerald-100 text-emerald-700'
    if (isOverdue || status === 'overdue') return 'bg-rose-100 text-rose-700'
    return 'bg-amber-100 text-amber-700'
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Follow-up Reminders</h1>
          <p className="text-gray-500 mt-1">Track customer follow-ups and callbacks</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2 bg-amber-500 hover:bg-amber-600">
          <Plus className="w-4 h-4" />
          Add Follow-up
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: Bell, color: 'from-gray-500 to-gray-600' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'from-amber-500 to-orange-600' },
          { label: 'Overdue', value: stats.overdue, icon: AlertTriangle, color: 'from-rose-500 to-red-600' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'from-emerald-500 to-green-600' },
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

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex gap-2 flex-wrap">
            {['all', 'pending', 'overdue', 'completed'].map((f) => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter(f)}
                className={filter === f ? 'bg-amber-500 hover:bg-amber-600' : ''}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Follow-ups List */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
          ) : filteredFollowUps.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Bell className="w-12 h-12 mb-4 text-gray-300" />
              <p>No follow-ups found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFollowUps.map((followUp, index) => {
                const TypeIcon = getTypeIcon(followUp.type)
                const isOverdue = followUp.status !== 'completed' && new Date(followUp.dueDate) < new Date()
                
                return (
                  <motion.div
                    key={followUp.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-5 rounded-xl border ${isOverdue ? 'border-rose-200 bg-rose-50/50' : 'border-gray-100'} hover:shadow-md transition-shadow`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        followUp.type === 'call' ? 'bg-blue-100' :
                        followUp.type === 'email' ? 'bg-violet-100' :
                        'bg-amber-100'
                      }`}>
                        <TypeIcon className={`w-6 h-6 ${
                          followUp.type === 'call' ? 'text-blue-600' :
                          followUp.type === 'email' ? 'text-violet-600' :
                          'text-amber-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{followUp.title}</h3>
                          <Badge className={getStatusBadge(followUp.status, followUp.dueDate)}>
                            {isOverdue && followUp.status !== 'completed' ? 'overdue' : followUp.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-2">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {followUp.customerName}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(followUp.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                        {followUp.description && (
                          <p className="text-sm text-gray-600">{followUp.description}</p>
                        )}
                      </div>
                      {followUp.status !== 'completed' && (
                        <Button
                          size="sm"
                          onClick={() => markComplete(followUp.id)}
                          className="gap-1 bg-emerald-500 hover:bg-emerald-600"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Complete
                        </Button>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Follow-up Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Follow-up Reminder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Customer Name</label>
              <Input
                value={newFollowUp.customerName}
                onChange={(e) => setNewFollowUp(prev => ({ ...prev, customerName: e.target.value }))}
                placeholder="Enter customer name"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Type</label>
              <Select value={newFollowUp.type} onValueChange={(v) => setNewFollowUp(prev => ({ ...prev, type: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Phone Call</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Title</label>
              <Input
                value={newFollowUp.title}
                onChange={(e) => setNewFollowUp(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter follow-up title"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Description</label>
              <Textarea
                value={newFollowUp.description}
                onChange={(e) => setNewFollowUp(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter description (optional)"
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Due Date</label>
              <Input
                type="datetime-local"
                value={newFollowUp.dueDate}
                onChange={(e) => setNewFollowUp(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button className="flex-1 bg-amber-500 hover:bg-amber-600" onClick={addFollowUp}>
                Add Follow-up
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

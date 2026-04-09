'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Eye, Trash2, Loader2, Mail, Phone, Calendar, MessageSquare, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import { useToast } from '@/hooks/use-toast'

interface Enquiry {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string | null
  message: string
  status: string
  createdAt: string
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-500',
  read: 'bg-amber-500',
  replied: 'bg-green-500',
  closed: 'bg-gray-500',
}

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchEnquiries()
  }, [])

  const fetchEnquiries = async () => {
    try {
      const res = await fetch('/api/enquiries')
      const data = await res.json()
      setEnquiries(data)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredEnquiries = enquiries.filter(e => {
    const matchesSearch = 
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.subject?.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus = !statusFilter || e.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleStatusChange = async (id: string, status: string) => {
    setIsUpdating(true)
    try {
      const res = await fetch('/api/enquiries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      })
      if (res.ok) {
        toast({ title: 'Status updated!' })
        fetchEnquiries()
        if (selectedEnquiry?.id === id) {
          setSelectedEnquiry({ ...selectedEnquiry, status })
        }
      }
    } catch {
      toast({ title: 'Error updating status', variant: 'destructive' })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this enquiry?')) return

    try {
      const res = await fetch(`/api/enquiries?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: 'Enquiry deleted!' })
        fetchEnquiries()
        setSelectedEnquiry(null)
      }
    } catch {
      toast({ title: 'Error deleting enquiry', variant: 'destructive' })
    }
  }

  // Stats
  const stats = {
    total: enquiries.length,
    new: enquiries.filter(e => e.status === 'new').length,
    read: enquiries.filter(e => e.status === 'read').length,
    replied: enquiries.filter(e => e.status === 'replied').length,
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'bg-gray-500' },
          { label: 'New', value: stats.new, color: 'bg-blue-500' },
          { label: 'Read', value: stats.read, color: 'bg-amber-500' },
          { label: 'Replied', value: stats.replied, color: 'bg-green-500' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search enquiries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? null : v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="read">Read</SelectItem>
            <SelectItem value="replied">Replied</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Enquiries List */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* List */}
        <Card className="lg:max-h-[600px] overflow-hidden flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Enquiries ({filteredEnquiries.length})</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0">
            <div className="divide-y">
              {filteredEnquiries.map((enquiry) => (
                <motion.button
                  key={enquiry.id}
                  onClick={() => {
                    setSelectedEnquiry(enquiry)
                    if (enquiry.status === 'new') {
                      handleStatusChange(enquiry.id, 'read')
                    }
                  }}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                    selectedEnquiry?.id === enquiry.id ? 'bg-amber-50' : ''
                  }`}
                  whileHover={{ x: 4 }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-amber-700 font-semibold">
                        {enquiry.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium truncate">{enquiry.name}</span>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs text-white ${statusColors[enquiry.status]}`}
                        >
                          {enquiry.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {enquiry.subject || enquiry.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(enquiry.createdAt).toLocaleDateString()} at{' '}
                        {new Date(enquiry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
              {filteredEnquiries.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No enquiries found
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Detail View */}
        <Card className="lg:max-h-[600px] overflow-hidden flex flex-col">
          {selectedEnquiry ? (
            <>
              <CardHeader className="pb-2 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Enquiry Details</CardTitle>
                  <div className="flex items-center gap-2">
                    <Select
                      value={selectedEnquiry.status}
                      onValueChange={(v) => handleStatusChange(selectedEnquiry.id, v)}
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="read">Read</SelectItem>
                        <SelectItem value="replied">Replied</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(selectedEnquiry.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                    <span className="text-amber-700 font-bold text-2xl">
                      {selectedEnquiry.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedEnquiry.name}</h3>
                    <Badge 
                      className={`text-white ${statusColors[selectedEnquiry.status]}`}
                    >
                      {selectedEnquiry.status}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <a href={`mailto:${selectedEnquiry.email}`} className="hover:text-amber-600">
                      {selectedEnquiry.email}
                    </a>
                  </div>
                  {selectedEnquiry.phone && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <a href={`tel:${selectedEnquiry.phone}`} className="hover:text-amber-600">
                        {selectedEnquiry.phone}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-gray-600">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    {new Date(selectedEnquiry.createdAt).toLocaleString()}
                  </div>
                </div>

                {selectedEnquiry.subject && (
                  <div>
                    <h4 className="font-semibold mb-1">Subject</h4>
                    <p className="text-gray-600">{selectedEnquiry.subject}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold mb-1">Message</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedEnquiry.message}</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <a href={`mailto:${selectedEnquiry.email}?subject=Re: ${selectedEnquiry.subject || 'Your Enquiry'}`}>
                    <Button className="bg-amber-600 hover:bg-amber-700 gap-2">
                      <Mail className="w-4 h-4" />
                      Reply via Email
                    </Button>
                  </a>
                  {selectedEnquiry.phone && (
                    <a href={`tel:${selectedEnquiry.phone}`}>
                      <Button variant="outline" className="gap-2">
                        <Phone className="w-4 h-4" />
                        Call
                      </Button>
                    </a>
                  )}
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Select an enquiry to view details</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}

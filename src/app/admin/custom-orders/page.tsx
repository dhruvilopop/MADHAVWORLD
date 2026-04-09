'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, Trash2, Search, Loader2, Palette, Mail, Phone, Calendar, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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

interface CustomInquiry {
  id: string
  name: string
  email: string
  phone: string
  style: string
  color: string
  material: string
  handleType: string
  size: string
  print: string
  quantity: number
  customNotes: string | null
  status: string
  createdAt: string
}

const statusColors: Record<string, string> = {
  new: 'bg-rose-100 text-rose-700',
  contacted: 'bg-sky-100 text-sky-700',
  quoted: 'bg-amber-100 text-amber-700',
  closed: 'bg-emerald-100 text-emerald-700',
}

export default function CustomOrdersAdmin() {
  const [inquiries, setInquiries] = useState<CustomInquiry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedInquiry, setSelectedInquiry] = useState<CustomInquiry | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchInquiries()
  }, [statusFilter])

  const fetchInquiries = async () => {
    try {
      const url = statusFilter !== 'all' ? `/api/custom-inquiry?status=${statusFilter}` : '/api/custom-inquiry'
      const res = await fetch(url)
      const data = await res.json()
      // Ensure we have an array
      if (Array.isArray(data)) {
        setInquiries(data)
      } else {
        setInquiries([])
      }
    } catch (error) {
      console.error(error)
      setInquiries([])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredInquiries = inquiries.filter(i =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/custom-inquiry', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      })
      if (res.ok) {
        toast({ title: 'Status updated!' })
        fetchInquiries()
      }
    } catch {
      toast({ title: 'Error updating status', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) return

    try {
      const res = await fetch(`/api/custom-inquiry?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: 'Inquiry deleted!' })
        fetchInquiries()
      }
    } catch {
      toast({ title: 'Error deleting inquiry', variant: 'destructive' })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['new', 'contacted', 'quoted', 'closed'].map((status) => {
          const count = inquiries.filter(i => i.status === status).length
          return (
            <Card key={status}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 capitalize">{status}</p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${statusColors[status]}`}>
                    <Palette className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="quoted">Quoted</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Inquiries List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredInquiries.map((inquiry, index) => (
            <motion.div
              key={inquiry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-rose-100 to-pink-100 rounded-xl flex items-center justify-center">
                        <Palette className="w-6 h-6 text-rose-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-gray-900">{inquiry.name}</h3>
                          <Badge className={statusColors[inquiry.status]}>
                            {inquiry.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {inquiry.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {inquiry.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(inquiry.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="outline" className="capitalize">{inquiry.style}</Badge>
                          <Badge variant="outline">{inquiry.color}</Badge>
                          <Badge variant="outline">{inquiry.material}</Badge>
                          <Badge variant="outline">Qty: {inquiry.quantity}</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Select
                        value={inquiry.status}
                        onValueChange={(value) => handleStatusUpdate(inquiry.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="quoted">Quoted</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedInquiry(inquiry)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(inquiry.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredInquiries.length === 0 && (
        <div className="text-center py-12">
          <Palette className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No custom orders found</p>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedInquiry} onOpenChange={() => setSelectedInquiry(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Custom Order Details</DialogTitle>
          </DialogHeader>
          {selectedInquiry && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Customer Information</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{selectedInquiry.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <a href={`mailto:${selectedInquiry.email}`} className="text-rose-600 hover:underline">
                      {selectedInquiry.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <a href={`tel:${selectedInquiry.phone}`} className="text-rose-600 hover:underline">
                      {selectedInquiry.phone}
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p>{new Date(selectedInquiry.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Bag Configuration */}
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Bag Configuration</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Style</p>
                    <p className="font-medium capitalize">{selectedInquiry.style}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Color</p>
                    <p className="font-medium">{selectedInquiry.color}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Material</p>
                    <p className="font-medium">{selectedInquiry.material}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Handle Type</p>
                    <p className="font-medium">{selectedInquiry.handleType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Size</p>
                    <p className="font-medium">{selectedInquiry.size}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Print</p>
                    <p className="font-medium">{selectedInquiry.print}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Quantity</p>
                    <p className="font-medium">{selectedInquiry.quantity}</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedInquiry.customNotes && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Additional Notes</h4>
                  <p className="text-gray-600">{selectedInquiry.customNotes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <a href={`mailto:${selectedInquiry.email}`} className="flex-1">
                  <Button className="w-full bg-rose-500 hover:bg-rose-600">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                </a>
                <a href={`tel:${selectedInquiry.phone}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

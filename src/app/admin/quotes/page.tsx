'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  FileText, Plus, Search, Eye, Edit, Download, Copy, 
  Loader2, Send, CheckCircle, DollarSign,
  ArrowRight, Sparkles
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
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

interface QuoteItem {
  id: string
  productName: string
  quantity: number
  price: number
  total: number
}

interface Quote {
  id: string
  quoteNumber: string
  customerName: string
  customerEmail: string | null
  customerPhone: string
  subtotal: number
  tax: number
  discount: number
  total: number
  status: string
  validUntil: string | null
  createdAt: string
  QuoteItem?: QuoteItem[]
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  accepted: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-rose-100 text-rose-700',
  expired: 'bg-amber-100 text-amber-700',
  converted: 'bg-violet-100 text-violet-700',
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchQuotes()
  }, [])

  const fetchQuotes = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/quotes')
      const data = await res.json()
      setQuotes(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching quotes:', error)
      setQuotes([])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = 
      quote.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: quotes.length,
    draft: quotes.filter(q => q.status === 'draft').length,
    sent: quotes.filter(q => q.status === 'sent').length,
    accepted: quotes.filter(q => q.status === 'accepted').length,
    totalValue: quotes.reduce((sum, q) => sum + q.total, 0),
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quotes</h1>
          <p className="text-gray-500 mt-1">Create and manage quotations for customers</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Sparkles className="w-4 h-4" />
            Templates
          </Button>
          <Link href="/admin/quotes/new">
            <Button className="bg-amber-500 hover:bg-amber-600 gap-2">
              <Plus className="w-4 h-4" />
              New Quote
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Quotes', value: stats.total, icon: FileText, color: 'from-blue-500' },
          { label: 'Drafts', value: stats.draft, icon: Edit, color: 'from-gray-500' },
          { label: 'Sent', value: stats.sent, icon: Send, color: 'from-blue-500' },
          { label: 'Accepted', value: stats.accepted, icon: CheckCircle, color: 'from-emerald-500' },
          { label: 'Total Value', value: `₹${(stats.totalValue / 1000).toFixed(0)}K`, icon: DollarSign, color: 'from-amber-500' },
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
                placeholder="Search quotes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quotes List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : filteredQuotes.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No quotes found</h3>
          <p className="text-gray-500 mt-1">Create your first quote to get started</p>
          <Link href="/admin/quotes/new">
            <Button className="mt-4 bg-amber-500 hover:bg-amber-600 gap-2">
              <Plus className="w-4 h-4" />
              Create Quote
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuotes.map((quote, index) => (
            <motion.div
              key={quote.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`/admin/quotes/${quote.id}`}>
                <Card className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-amber-200">
                  <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">{quote.quoteNumber}</p>
                            <Badge className={statusColors[quote.status]}>{quote.status}</Badge>
                          </div>
                          <p className="text-sm text-gray-500">{quote.customerName}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Amount</p>
                          <p className="font-bold text-gray-900">₹{quote.total.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Created</p>
                          <p className="text-gray-700">{new Date(quote.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-amber-500 text-sm font-medium">View Details →</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

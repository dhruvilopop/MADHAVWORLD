'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Mail, TrendingUp, CheckCircle, Clock, Download,
  Loader2, FileSpreadsheet, Users, MessageSquare
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface InquiryReport {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string | null
  message: string
  status: string
  createdAt: string
}

export default function InquiryReportPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [inquiries, setInquiries] = useState<InquiryReport[]>([])

  useEffect(() => {
    loadReport()
  }, [])

  const loadReport = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/enquiries')
      if (res.ok) {
        const data = await res.json()
        setInquiries(data)
      }
    } catch {
      console.error('Error loading report')
    } finally {
      setIsLoading(false)
    }
  }

  const totalInquiries = inquiries.length
  const newInquiries = inquiries.filter(i => i.status === 'new').length
  const resolvedInquiries = inquiries.filter(i => i.status === 'resolved' || i.status === 'replied').length
  const conversionRate = totalInquiries > 0 ? Math.round((resolvedInquiries / totalInquiries) * 100) : 0

  const exportToExcel = () => {
    const headers = ['Name', 'Email', 'Phone', 'Subject', 'Message', 'Status', 'Date']
    const rows = inquiries.map(i => [
      i.name, 
      i.email, 
      i.phone || '', 
      i.subject || '', 
      `"${i.message.replace(/"/g, '""')}"`, 
      i.status,
      new Date(i.createdAt).toLocaleDateString()
    ])
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'inquiry-report.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-700'
      case 'replied': return 'bg-amber-100 text-amber-700'
      case 'resolved': return 'bg-emerald-100 text-emerald-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  // Group by month
  const inquiriesByMonth = inquiries.reduce((acc, inquiry) => {
    const month = new Date(inquiry.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' })
    acc[month] = (acc[month] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inquiry Report</h1>
          <p className="text-gray-500 mt-1">Track inquiry conversion and response rates</p>
        </div>
        <Button onClick={exportToExcel} className="gap-2 bg-emerald-500 hover:bg-emerald-600">
          <FileSpreadsheet className="w-4 h-4" />
          Export Excel
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Inquiries', value: totalInquiries, icon: Mail, color: 'from-blue-500 to-indigo-600' },
          { label: 'New', value: newInquiries, icon: Clock, color: 'from-amber-500 to-orange-600' },
          { label: 'Resolved', value: resolvedInquiries, icon: CheckCircle, color: 'from-emerald-500 to-green-600' },
          { label: 'Conversion Rate', value: `${conversionRate}%`, icon: TrendingUp, color: 'from-violet-500 to-purple-600' },
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

      {/* Monthly Trend */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Monthly Inquiry Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4 h-40">
            {Object.entries(inquiriesByMonth).slice(-6).map(([month, count], index) => {
              const maxCount = Math.max(...Object.values(inquiriesByMonth), 1)
              const height = (count / maxCount) * 100
              return (
                <motion.div
                  key={month}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: `${height}%` }}
                  transition={{ delay: index * 0.1 }}
                  className="flex-1 flex flex-col justify-end"
                >
                  <div className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg min-h-[20px] relative group">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {count} inquiries
                    </div>
                  </div>
                  <p className="text-xs text-center mt-2 text-gray-500">{month}</p>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Inquiry List */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Inquiries</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
          ) : inquiries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Mail className="w-12 h-12 mb-4 text-gray-300" />
              <p>No inquiries yet</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {inquiries.slice(0, 10).map((inquiry, index) => (
                <motion.div
                  key={inquiry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{inquiry.name}</h3>
                          <Badge className={getStatusBadge(inquiry.status)}>
                            {inquiry.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">{inquiry.email}</p>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {inquiry.subject || inquiry.message}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">
                        {new Date(inquiry.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

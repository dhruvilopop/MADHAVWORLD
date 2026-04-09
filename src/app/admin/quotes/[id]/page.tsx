'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Download, Printer, Send, Edit, Copy, Loader2,
  Building2, Mail, Phone, MapPin, Calendar, Clock, FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'

interface QuoteItem {
  id: string
  productId: string | null
  productName: string
  quantity: number
  price: number
  total: number
  isCustom: boolean
  customSpecs: string | null
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
  validUntil: string | null
  status: string
  notes: string | null
  terms: string | null
  createdAt: string
  QuoteItem: QuoteItem[]
}

interface SiteSettings {
  companyName: string
  companyLogo: string | null
  address: string | null
  phone: string | null
  email: string | null
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 border-gray-200',
  sent: 'bg-blue-100 text-blue-700 border-blue-200',
  accepted: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-100 text-rose-700 border-rose-200',
  expired: 'bg-amber-100 text-amber-700 border-amber-200',
  converted: 'bg-violet-100 text-violet-700 border-violet-200',
}

export default function QuoteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const printRef = useRef<HTMLDivElement>(null)
  
  const [quote, setQuote] = useState<Quote | null>(null)
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [params.id])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [quoteRes, settingsRes] = await Promise.all([
        fetch(`/api/quotes/${params.id}`),
        fetch('/api/site-settings')
      ])
      
      if (quoteRes.ok) {
        const quoteData = await quoteRes.json()
        setQuote(quoteData)
      }
      
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json()
        setSettings(settingsData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    setIsDownloading(true)
    try {
      const response = await fetch(`/api/quotes/${params.id}/pdf`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${quote?.quoteNumber || 'quote'}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error downloading PDF:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    )
  }

  if (!quote) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900">Quote Not Found</h2>
        <p className="text-gray-500 mt-2">The quote you're looking for doesn't exist.</p>
        <Link href="/admin/quotes">
          <Button className="mt-4 bg-amber-500 hover:bg-amber-600">
            Back to Quotes
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/admin/quotes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{quote.quoteNumber}</h1>
            <p className="text-gray-500 mt-1">Quote for {quote.customerName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={`${statusColors[quote.status]} border px-3 py-1`}>
            {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
          </Badge>
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" />
            Print
          </Button>
          <Button 
            onClick={handleDownloadPDF} 
            disabled={isDownloading}
            className="bg-amber-500 hover:bg-amber-600 gap-2"
          >
            {isDownloading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Downloading...</>
            ) : (
              <><Download className="w-4 h-4" /> Download PDF</>
            )}
          </Button>
        </div>
      </div>

      {/* Quote Document */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-xl rounded-xl overflow-hidden print:shadow-none print:rounded-none"
      >
        <div ref={printRef} className="p-8 md:p-12 print:p-0">
          {/* Company Header */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 pb-8 border-b-2 border-amber-500">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                {settings?.companyLogo ? (
                  <Image 
                    src={settings.companyLogo} 
                    alt="Company Logo" 
                    width={80} 
                    height={80}
                    className="rounded-xl"
                  />
                ) : (
                  <Building2 className="w-10 h-10 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {settings?.companyName || 'Madhav World Bags Industry'}
                </h2>
                <p className="text-gray-500 text-sm">Premium Quality Bags Manufacturer</p>
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="flex items-center justify-end gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                {settings?.address || 'Industrial Area, India'}
              </div>
              <div className="flex items-center justify-end gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                {settings?.phone || '+91 98765 43210'}
              </div>
              <div className="flex items-center justify-end gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                {settings?.email || 'info@madhavworldbags.com'}
              </div>
            </div>
          </div>

          {/* Quote Title */}
          <div className="py-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 tracking-wide">QUOTATION</h1>
            <div className="mt-4 inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full">
              <FileText className="w-4 h-4" />
              <span className="font-semibold">{quote.quoteNumber}</span>
            </div>
          </div>

          {/* Customer & Quote Info */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Bill To</h3>
                <div className="space-y-2">
                  <p className="text-xl font-semibold text-gray-900">{quote.customerName}</p>
                  {quote.customerEmail && (
                    <p className="text-gray-600">{quote.customerEmail}</p>
                  )}
                  <p className="text-gray-600">{quote.customerPhone}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Quote Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quote Date:</span>
                    <span className="font-medium text-gray-900">{formatDate(quote.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Valid Until:</span>
                    <span className="font-medium text-gray-900">{formatDate(quote.validUntil)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge className={statusColors[quote.status]}>
                      {quote.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quote Items Table */}
          <div className="mb-8 overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                  <th className="px-6 py-4 text-left font-semibold">#</th>
                  <th className="px-6 py-4 text-left font-semibold">Product</th>
                  <th className="px-6 py-4 text-center font-semibold">Qty</th>
                  <th className="px-6 py-4 text-right font-semibold">Unit Price</th>
                  <th className="px-6 py-4 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {quote.QuoteItem.map((item, index) => (
                  <tr 
                    key={item.id} 
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="px-6 py-4 text-gray-600">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{item.productName}</p>
                        {item.customSpecs && (
                          <p className="text-sm text-gray-500">{item.customSpecs}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-700">{item.quantity}</td>
                    <td className="px-6 py-4 text-right text-gray-700">{formatCurrency(item.price)}</td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-full md:w-80 space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>{formatCurrency(quote.subtotal)}</span>
              </div>
              {quote.tax > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Tax (GST):</span>
                  <span>{formatCurrency(quote.tax)}</span>
                </div>
              )}
              {quote.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount:</span>
                  <span>-{formatCurrency(quote.discount)}</span>
                </div>
              )}
              <div className="pt-3 border-t-2 border-amber-500">
                <div className="flex justify-between">
                  <span className="text-lg font-bold text-gray-900">Total:</span>
                  <span className="text-2xl font-bold text-amber-600">{formatCurrency(quote.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes & Terms */}
          <div className="grid md:grid-cols-2 gap-8 pt-8 border-t">
            {quote.notes && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Notes</h3>
                <p className="text-gray-700 whitespace-pre-line">{quote.notes}</p>
              </div>
            )}
            {quote.terms && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Terms & Conditions</h3>
                <p className="text-gray-700 whitespace-pre-line text-sm">{quote.terms}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t text-center">
            <p className="text-gray-500 text-sm">
              Thank you for your business! For any queries, please contact us at {settings?.email || 'info@madhavworldbags.com'}
            </p>
            <div className="mt-4 flex justify-center gap-8 text-sm text-gray-400">
              <span>GSTIN: 09XXXXXXXXXX</span>
              <span>|</span>
              <span>PAN: XXXXXXXXX</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center print:hidden">
        <Button variant="outline" className="gap-2">
          <Send className="w-4 h-4" />
          Send to Customer
        </Button>
        <Button variant="outline" className="gap-2">
          <Copy className="w-4 h-4" />
          Duplicate Quote
        </Button>
        <Button variant="outline" className="gap-2">
          <Edit className="w-4 h-4" />
          Edit Quote
        </Button>
      </div>
    </div>
  )
}

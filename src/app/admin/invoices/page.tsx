'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, FileText, Download, Eye, Calculator, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

interface InvoiceItem {
  id: string
  productName: string
  description?: string
  hsnCode?: string
  quantity: number
  unit: string
  rate: number
  discount: number
  taxableValue: number
  cgstRate: number
  sgstRate: number
  igstRate: number
  cgstAmount: number
  sgstAmount: number
  igstAmount: number
  total: number
}

interface Invoice {
  id: string
  invoiceNumber: string
  customerName: string
  customerEmail?: string
  customerPhone: string
  customerAddress?: string
  customerGstin?: string
  companyName: string
  companyAddress: string
  companyPhone: string
  companyEmail?: string
  companyGstin?: string
  invoiceDate: string
  dueDate?: string
  subtotal: number
  discount: number
  cgstAmount: number
  sgstAmount: number
  igstAmount: number
  totalTax: number
  roundOff: number
  total: number
  amountInWords?: string
  bankName?: string
  bankAccount?: string
  bankIfsc?: string
  notes?: string
  terms?: string
  status: string
  InvoiceItem: InvoiceItem[]
}

interface Product {
  id: string
  name: string
  price: number | null
}

interface Settings {
  companyName: string
  companyLogo?: string
  address?: string
  phone?: string
  email?: string
}

export default function InvoicesAdminPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    customerGstin: '',
    companyName: 'Madhav World Bags Industry',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    companyGstin: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    placeOfSupply: 'Gujarat',
    discount: 0,
    cgstRate: 9,
    sgstRate: 9,
    igstRate: 0,
    roundOff: 0,
    bankName: '',
    bankAccount: '',
    bankIfsc: '',
    notes: '',
    terms: 'Payment is due within 30 days.',
  })

  const [items, setItems] = useState<[{
    productName: string
    description: string
    hsnCode: string
    quantity: number
    unit: string
    rate: number
    discount: number
    cgstRate: number
    sgstRate: number
    igstRate: number
  }]>([{
    productName: '',
    description: '',
    hsnCode: '',
    quantity: 1,
    unit: 'PCS',
    rate: 0,
    discount: 0,
    cgstRate: 9,
    sgstRate: 9,
    igstRate: 0
  }])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [invoicesRes, productsRes, settingsRes] = await Promise.all([
        fetch('/api/invoices'),
        fetch('/api/products?all=true'),
        fetch('/api/settings')
      ])
      
      const invoicesData = await invoicesRes.json()
      const productsData = await productsRes.json()
      const settingsData = await settingsRes.json()
      
      setInvoices(Array.isArray(invoicesData) ? invoicesData : [])
      setProducts(Array.isArray(productsData) ? productsData : [])
      setSettings(settingsData)
      
      if (settingsData) {
        setFormData(prev => ({
          ...prev,
          companyName: settingsData.companyName || 'Madhav World Bags Industry',
          companyAddress: settingsData.address || '',
          companyPhone: settingsData.phone || '',
          companyEmail: settingsData.email || ''
        }))
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateTotals = () => {
    let subtotal = 0
    let totalCgst = 0
    let totalSgst = 0
    let totalIgst = 0

    items.forEach(item => {
      const taxableValue = item.quantity * item.rate - item.discount
      subtotal += taxableValue
      totalCgst += taxableValue * item.cgstRate / 100
      totalSgst += taxableValue * item.sgstRate / 100
      totalIgst += taxableValue * item.igstRate / 100
    })

    const total = subtotal - formData.discount + totalCgst + totalSgst + totalIgst + formData.roundOff

    return { subtotal, totalCgst, totalSgst, totalIgst, total }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const totals = calculateTotals()
    
    try {
      const payload = {
        ...formData,
        items: items.map(item => ({
          ...item,
          cgstRate: item.igstRate > 0 ? 0 : item.cgstRate,
          sgstRate: item.igstRate > 0 ? 0 : item.sgstRate
        }))
      }

      const url = '/api/invoices'
      const method = editingInvoice ? 'PUT' : 'POST'
      if (editingInvoice) {
        (payload as { id?: string }).id = editingInvoice.id
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        const savedInvoice = await res.json()
        toast({ title: editingInvoice ? 'Invoice updated!' : 'Invoice created!' })
        setShowForm(false)
        setEditingInvoice(null)
        fetchData()
      }
    } catch (error) {
      toast({ title: 'Error saving invoice', variant: 'destructive' })
    }
  }

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice)
    setFormData({
      customerName: invoice.customerName,
      customerEmail: invoice.customerEmail || '',
      customerPhone: invoice.customerPhone,
      customerAddress: invoice.customerAddress || '',
      customerGstin: invoice.customerGstin || '',
      companyName: invoice.companyName,
      companyAddress: invoice.companyAddress,
      companyPhone: invoice.companyPhone,
      companyEmail: invoice.companyEmail || '',
      companyGstin: invoice.companyGstin || '',
      invoiceDate: new Date(invoice.invoiceDate).toISOString().split('T')[0],
      dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '',
      placeOfSupply: '',
      discount: invoice.discount,
      cgstRate: invoice.cgstAmount > 0 ? (invoice.cgstAmount / invoice.subtotal * 100) : 0,
      sgstRate: invoice.sgstAmount > 0 ? (invoice.sgstAmount / invoice.subtotal * 100) : 0,
      igstRate: invoice.igstAmount > 0 ? (invoice.igstAmount / invoice.subtotal * 100) : 0,
      roundOff: invoice.roundOff,
      bankName: invoice.bankName || '',
      bankAccount: invoice.bankAccount || '',
      bankIfsc: invoice.bankIfsc || '',
      notes: invoice.notes || '',
      terms: invoice.terms || '',
    })
    setItems(invoice.InvoiceItem.map(item => ({
      productName: item.productName,
      description: item.description || '',
      hsnCode: item.hsnCode || '',
      quantity: item.quantity,
      unit: item.unit,
      rate: item.rate,
      discount: item.discount,
      cgstRate: item.cgstRate,
      sgstRate: item.sgstRate,
      igstRate: item.igstRate
    })))
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return
    try {
      const res = await fetch(`/api/invoices?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: 'Invoice deleted!' })
        fetchData()
      }
    } catch (error) {
      toast({ title: 'Error deleting invoice', variant: 'destructive' })
    }
  }

  const handlePreview = (invoice: Invoice) => {
    setPreviewInvoice(invoice)
    setShowPreview(true)
  }

  const addItem = () => {
    setItems([...items, {
      productName: '',
      description: '',
      hsnCode: '',
      quantity: 1,
      unit: 'PCS',
      rate: 0,
      discount: 0,
      cgstRate: formData.igstRate > 0 ? 0 : formData.cgstRate,
      sgstRate: formData.igstRate > 0 ? 0 : formData.sgstRate,
      igstRate: formData.igstRate
    }])
  }

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items]
    ;(newItems[index] as Record<string, string | number>)[field] = value
    setItems(newItems)
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const printInvoice = () => {
    window.print()
  }

  const totals = calculateTotals()

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoices / Bills</h1>
          <p className="text-gray-500 mt-1">Create and manage GST invoices</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditingInvoice(null); }} className="bg-amber-500 hover:bg-amber-600">
          <Plus className="w-4 h-4 mr-2" /> Create Invoice
        </Button>
      </div>

      {/* Invoices List */}
      <div className="grid gap-4">
        {invoices.map((invoice) => (
          <Card key={invoice.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{invoice.invoiceNumber}</p>
                    <p className="text-sm text-gray-500">{invoice.customerName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">₹{invoice.total.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">{new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={invoice.status === 'paid' ? 'default' : invoice.status === 'cancelled' ? 'destructive' : 'secondary'}>
                    {invoice.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => handlePreview(invoice)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(invoice)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(invoice.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {invoices.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No invoices yet. Create your first invoice!</p>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            {/* Customer Details */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Customer Details</h3>
                <Input
                  placeholder="Customer Name *"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  required
                />
                <Input
                  placeholder="Phone *"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  required
                />
                <Input
                  placeholder="Email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                />
                <Textarea
                  placeholder="Address"
                  value={formData.customerAddress}
                  onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                  rows={2}
                />
                <Input
                  placeholder="Customer GSTIN"
                  value={formData.customerGstin}
                  onChange={(e) => setFormData({ ...formData, customerGstin: e.target.value })}
                />
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Company Details</h3>
                <Input
                  placeholder="Company Name *"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  required
                />
                <Textarea
                  placeholder="Company Address *"
                  value={formData.companyAddress}
                  onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                  rows={2}
                  required
                />
                <Input
                  placeholder="Phone"
                  value={formData.companyPhone}
                  onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
                />
                <Input
                  placeholder="Company GSTIN"
                  value={formData.companyGstin}
                  onChange={(e) => setFormData({ ...formData, companyGstin: e.target.value })}
                />
              </div>
            </div>

            {/* Invoice Details */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Invoice Date</Label>
                <Input
                  type="date"
                  value={formData.invoiceDate}
                  onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                />
              </div>
              <div>
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
              <div>
                <Label>Place of Supply</Label>
                <Input
                  placeholder="Gujarat"
                  value={formData.placeOfSupply}
                  onChange={(e) => setFormData({ ...formData, placeOfSupply: e.target.value })}
                />
              </div>
            </div>

            {/* Items */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Items</h3>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="w-4 h-4 mr-1" /> Add Item
                </Button>
              </div>
              
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 p-3 bg-gray-50 rounded-lg">
                    <div className="col-span-3">
                      <Input
                        placeholder="Product Name"
                        value={item.productName}
                        onChange={(e) => updateItem(index, 'productName', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-span-1">
                      <Input
                        placeholder="HSN"
                        value={item.hsnCode}
                        onChange={(e) => updateItem(index, 'hsnCode', e.target.value)}
                      />
                    </div>
                    <div className="col-span-1">
                      <Input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        required
                      />
                    </div>
                    <div className="col-span-1">
                      <Select value={item.unit} onValueChange={(v) => updateItem(index, 'unit', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PCS">PCS</SelectItem>
                          <SelectItem value="KG">KG</SelectItem>
                          <SelectItem value="MTR">MTR</SelectItem>
                          <SelectItem value="SET">SET</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        placeholder="Rate"
                        value={item.rate}
                        onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                        required
                      />
                    </div>
                    <div className="col-span-1">
                      <Input
                        type="number"
                        placeholder="Disc"
                        value={item.discount}
                        onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-1">
                      <Input
                        type="number"
                        placeholder="CGST%"
                        value={formData.igstRate > 0 ? 0 : item.cgstRate}
                        onChange={(e) => updateItem(index, 'cgstRate', parseFloat(e.target.value) || 0)}
                        disabled={formData.igstRate > 0}
                      />
                    </div>
                    <div className="col-span-1">
                      <Input
                        type="number"
                        placeholder="SGST%"
                        value={formData.igstRate > 0 ? 0 : item.sgstRate}
                        onChange={(e) => updateItem(index, 'sgstRate', parseFloat(e.target.value) || 0)}
                        disabled={formData.igstRate > 0}
                      />
                    </div>
                    <div className="col-span-1">
                      <Input
                        type="number"
                        placeholder="IGST%"
                        value={item.igstRate}
                        onChange={(e) => updateItem(index, 'igstRate', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-0 flex items-center">
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* GST Type */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>GST Type</Label>
                <Select 
                  value={formData.igstRate > 0 ? 'igst' : 'cgst_sgst'} 
                  onValueChange={(v) => {
                    if (v === 'igst') {
                      setFormData({ ...formData, igstRate: 18, cgstRate: 0, sgstRate: 0 })
                      setItems(items.map(item => ({ ...item, igstRate: 18, cgstRate: 0, sgstRate: 0 })))
                    } else {
                      setFormData({ ...formData, igstRate: 0, cgstRate: 9, sgstRate: 9 })
                      setItems(items.map(item => ({ ...item, igstRate: 0, cgstRate: 9, sgstRate: 9 })))
                    }
                  }}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cgst_sgst">CGST + SGST (Local)</SelectItem>
                    <SelectItem value="igst">IGST (Inter-state)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Discount</Label>
                <Input
                  type="number"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            {/* Bank Details */}
            <div className="grid md:grid-cols-3 gap-4">
              <Input
                placeholder="Bank Name"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              />
              <Input
                placeholder="Bank Account"
                value={formData.bankAccount}
                onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
              />
              <Input
                placeholder="IFSC Code"
                value={formData.bankIfsc}
                onChange={(e) => setFormData({ ...formData, bankIfsc: e.target.value })}
              />
            </div>

            {/* Notes & Terms */}
            <div className="grid md:grid-cols-2 gap-4">
              <Textarea
                placeholder="Notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
              <Textarea
                placeholder="Terms & Conditions"
                value={formData.terms}
                onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                rows={2}
              />
            </div>

            {/* Totals */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="text-right font-medium">₹{totals.subtotal.toFixed(2)}</span>
                <span className="text-gray-600">Discount:</span>
                <span className="text-right font-medium">₹{formData.discount.toFixed(2)}</span>
                {totals.totalCgst > 0 && (
                  <>
                    <span className="text-gray-600">CGST:</span>
                    <span className="text-right font-medium">₹{totals.totalCgst.toFixed(2)}</span>
                  </>
                )}
                {totals.totalSgst > 0 && (
                  <>
                    <span className="text-gray-600">SGST:</span>
                    <span className="text-right font-medium">₹{totals.totalSgst.toFixed(2)}</span>
                  </>
                )}
                {totals.totalIgst > 0 && (
                  <>
                    <span className="text-gray-600">IGST:</span>
                    <span className="text-right font-medium">₹{totals.totalIgst.toFixed(2)}</span>
                  </>
                )}
                <span className="text-gray-900 font-bold text-lg">Total:</span>
                <span className="text-right font-bold text-lg text-amber-600">₹{totals.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600">
                {editingInvoice ? 'Update' : 'Create'} Invoice
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Invoice Preview</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={printInvoice}>
                  <Printer className="w-4 h-4 mr-1" /> Print
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {previewInvoice && (
            <div className="mt-4 bg-white p-6 border rounded-lg" id="invoice-preview">
              {/* Header */}
              <div className="flex items-start justify-between border-b pb-4 mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{previewInvoice.companyName}</h2>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{previewInvoice.companyAddress}</p>
                  <p className="text-sm text-gray-600">{previewInvoice.companyPhone}</p>
                  {previewInvoice.companyGstin && (
                    <p className="text-sm text-gray-600">GSTIN: {previewInvoice.companyGstin}</p>
                  )}
                </div>
                <div className="text-right">
                  <h3 className="text-xl font-bold text-amber-600">TAX INVOICE</h3>
                  <p className="text-gray-900 font-semibold">{previewInvoice.invoiceNumber}</p>
                  <p className="text-sm text-gray-600">Date: {new Date(previewInvoice.invoiceDate).toLocaleDateString()}</p>
                  {previewInvoice.dueDate && (
                    <p className="text-sm text-gray-600">Due: {new Date(previewInvoice.dueDate).toLocaleDateString()}</p>
                  )}
                </div>
              </div>

              {/* Bill To */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-1">Bill To:</h4>
                <p className="font-semibold">{previewInvoice.customerName}</p>
                {previewInvoice.customerAddress && (
                  <p className="text-sm text-gray-600 whitespace-pre-line">{previewInvoice.customerAddress}</p>
                )}
                <p className="text-sm text-gray-600">{previewInvoice.customerPhone}</p>
                {previewInvoice.customerGstin && (
                  <p className="text-sm text-gray-600">GSTIN: {previewInvoice.customerGstin}</p>
                )}
              </div>

              {/* Items Table */}
              <table className="w-full mb-6 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-2">#</th>
                    <th className="text-left p-2">Item</th>
                    <th className="text-center p-2">HSN</th>
                    <th className="text-center p-2">Qty</th>
                    <th className="text-right p-2">Rate</th>
                    <th className="text-right p-2">Taxable</th>
                    {previewInvoice.cgstAmount > 0 && <th className="text-right p-2">CGST</th>}
                    {previewInvoice.sgstAmount > 0 && <th className="text-right p-2">SGST</th>}
                    {previewInvoice.igstAmount > 0 && <th className="text-right p-2">IGST</th>}
                    <th className="text-right p-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {previewInvoice.InvoiceItem.map((item, i) => (
                    <tr key={item.id} className="border-b">
                      <td className="p-2">{i + 1}</td>
                      <td className="p-2">{item.productName}</td>
                      <td className="text-center p-2">{item.hsnCode || '-'}</td>
                      <td className="text-center p-2">{item.quantity} {item.unit}</td>
                      <td className="text-right p-2">₹{item.rate.toFixed(2)}</td>
                      <td className="text-right p-2">₹{item.taxableValue.toFixed(2)}</td>
                      {previewInvoice.cgstAmount > 0 && (
                        <td className="text-right p-2">{item.cgstRate}%<br/>₹{item.cgstAmount.toFixed(2)}</td>
                      )}
                      {previewInvoice.sgstAmount > 0 && (
                        <td className="text-right p-2">{item.sgstRate}%<br/>₹{item.sgstAmount.toFixed(2)}</td>
                      )}
                      {previewInvoice.igstAmount > 0 && (
                        <td className="text-right p-2">{item.igstRate}%<br/>₹{item.igstAmount.toFixed(2)}</td>
                      )}
                      <td className="text-right p-2 font-medium">₹{item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-1">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{previewInvoice.subtotal.toFixed(2)}</span>
                  </div>
                  {previewInvoice.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-₹{previewInvoice.discount.toFixed(2)}</span>
                    </div>
                  )}
                  {previewInvoice.cgstAmount > 0 && (
                    <div className="flex justify-between">
                      <span>CGST:</span>
                      <span>₹{previewInvoice.cgstAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {previewInvoice.sgstAmount > 0 && (
                    <div className="flex justify-between">
                      <span>SGST:</span>
                      <span>₹{previewInvoice.sgstAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {previewInvoice.igstAmount > 0 && (
                    <div className="flex justify-between">
                      <span>IGST:</span>
                      <span>₹{previewInvoice.igstAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span className="text-amber-600">₹{previewInvoice.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Amount in Words */}
              {previewInvoice.amountInWords && (
                <p className="mt-4 text-sm text-gray-600">
                  <strong>Amount in Words:</strong> {previewInvoice.amountInWords}
                </p>
              )}

              {/* Bank Details */}
              {previewInvoice.bankName && (
                <div className="mt-6 p-4 bg-gray-50 rounded">
                  <h4 className="font-semibold mb-2">Bank Details</h4>
                  <p className="text-sm">Bank: {previewInvoice.bankName}</p>
                  <p className="text-sm">A/C: {previewInvoice.bankAccount}</p>
                  <p className="text-sm">IFSC: {previewInvoice.bankIfsc}</p>
                </div>
              )}

              {/* Terms */}
              {previewInvoice.terms && (
                <p className="mt-4 text-xs text-gray-500">{previewInvoice.terms}</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

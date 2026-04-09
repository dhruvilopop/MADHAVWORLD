'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Save, Loader2, Plus, Trash2, Calendar,
  FileText, DollarSign, User
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Product {
  id: string
  name: string
  price: number | null
}

interface Customer {
  id: string
  name: string
  phone: string
  email: string | null
  company: string | null
}

export default function NewQuotePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    items: [{ productId: '', productName: '', quantity: 1, price: 0 }],
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0,
    validUntil: '',
    notes: '',
    terms: 'Payment: 50% advance, 50% on delivery\nDelivery: Within 15-20 working days\nPrices valid for 30 days',
  })

  useEffect(() => {
    fetchProducts()
    fetchCustomers()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers')
      const data = await res.json()
      setCustomers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId)
    if (customer) {
      setFormData(prev => ({
        ...prev,
        customerId: customer.id,
        customerName: customer.name,
        customerEmail: customer.email || '',
        customerPhone: customer.phone,
      }))
    }
  }

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...formData.items]
    
    if (field === 'productId') {
      const product = products.find(p => p.id === value)
      if (product) {
        newItems[index] = {
          ...newItems[index],
          productId: value,
          productName: product.name,
          price: product.price || 0,
        }
      }
    } else {
      (newItems[index] as Record<string, unknown>)[field] = value
    }
    
    setFormData(prev => ({ ...prev, items: newItems }))
    calculateTotal(newItems, formData.tax, formData.discount)
  }

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', productName: '', quantity: 1, price: 0 }]
    }))
  }

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index)
      setFormData(prev => ({ ...prev, items: newItems }))
      calculateTotal(newItems, formData.tax, formData.discount)
    }
  }

  const calculateTotal = (items: typeof formData.items, tax: number, discount: number) => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const total = subtotal + tax - discount
    setFormData(prev => ({ ...prev, subtotal, total }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (res.ok) {
        router.push('/admin/quotes')
      }
    } catch (error) {
      console.error('Error creating quote:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/quotes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New Quote</h1>
          <p className="text-gray-500 mt-1">Create a new quotation</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-amber-500" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Select Customer</Label>
                    <Select onValueChange={handleCustomerSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Search or select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map(customer => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name} - {customer.phone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Or Enter Name *</Label>
                    <Input
                      value={formData.customerName}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                      placeholder="Customer name"
                      required
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Phone *</Label>
                    <Input
                      value={formData.customerPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Valid Until</Label>
                    <Input
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quote Items */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-500" />
                  Quote Items
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.items.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid md:grid-cols-12 gap-3 items-end p-4 bg-gray-50 rounded-xl"
                  >
                    <div className="md:col-span-5 space-y-2">
                      <Label>Product</Label>
                      <Select
                        value={item.productId}
                        onValueChange={(value) => handleItemChange(index, 'productId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map(product => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} {product.price && `- ₹${product.price}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label>Qty</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label>Price</Label>
                      <Input
                        type="number"
                        value={item.price}
                        onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label>Total</Label>
                      <div className="h-10 px-3 py-2 bg-white rounded-md border font-medium">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                    <div className="md:col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                        disabled={formData.items.length === 1}
                        className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addItem}
                  className="w-full border-dashed"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </CardContent>
            </Card>

            {/* Notes & Terms */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Notes & Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes for the customer..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Terms & Conditions</Label>
                  <Textarea
                    value={formData.terms}
                    onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quote Summary */}
            <Card className="border-0 shadow-sm sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-amber-500" />
                  Quote Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{formData.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tax</span>
                    <Input
                      type="number"
                      value={formData.tax}
                      onChange={(e) => {
                        const tax = parseFloat(e.target.value) || 0
                        setFormData(prev => ({ ...prev, tax }))
                        calculateTotal(formData.items, tax, formData.discount)
                      }}
                      className="w-24 text-right"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Discount</span>
                    <Input
                      type="number"
                      value={formData.discount}
                      onChange={(e) => {
                        const discount = parseFloat(e.target.value) || 0
                        setFormData(prev => ({ ...prev, discount }))
                        calculateTotal(formData.items, formData.tax, discount)
                      }}
                      className="w-24 text-right"
                    />
                  </div>
                  <div className="border-t pt-3 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-amber-600">₹{formData.total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <Button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-600"
                    disabled={isLoading || !formData.customerName || !formData.customerPhone}
                  >
                    {isLoading ? (
                      <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Creating...</>
                    ) : (
                      <><Save className="w-4 h-4 mr-2" /> Create Quote</>
                    )}
                  </Button>
                  <Link href="/admin/quotes">
                    <Button type="button" variant="outline" className="w-full">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}

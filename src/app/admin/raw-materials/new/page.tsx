'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Package, Save, X, ArrowLeft
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

interface Category {
  id: string
  name: string
}

interface Supplier {
  id: string
  name: string
}

export default function NewRawMaterialPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    supplierId: '',
    size: '',
    width: '',
    gsm: '',
    weightPerBag: '',
    bagsPerKg: '',
    thickness: '',
    unit: 'kg',
    currentStock: '0',
    minStockLevel: '0',
    maxStockLevel: '',
    reorderPoint: '',
    reorderQuantity: '',
    unitCost: '0',
    warehouseLocation: '',
    batchNumber: '',
    barcode: '',
    description: '',
  })

  useEffect(() => {
    fetchCategories()
    fetchSuppliers()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/raw-materials/categories')
      const data = await res.json()
      setCategories(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchSuppliers = async () => {
    try {
      const res = await fetch('/api/suppliers')
      const data = await res.json()
      setSuppliers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching suppliers:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/raw-materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        router.push('/admin/raw-materials')
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to create material')
      }
    } catch (error) {
      console.error('Error creating material:', error)
      alert('Failed to create material')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Raw Material</h1>
          <p className="text-gray-500">Add a new raw material to inventory</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-500" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Material Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Cotton Fabric"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.categoryId} onValueChange={(v) => handleChange('categoryId', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Select value={formData.supplierId} onValueChange={(v) => handleChange('supplierId', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map(sup => (
                    <SelectItem key={sup.id} value={sup.id}>{sup.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select value={formData.unit} onValueChange={(v) => handleChange('unit', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">Kilograms (kg)</SelectItem>
                  <SelectItem value="meters">Meters</SelectItem>
                  <SelectItem value="pieces">Pieces</SelectItem>
                  <SelectItem value="liters">Liters</SelectItem>
                  <SelectItem value="rolls">Rolls</SelectItem>
                  <SelectItem value="sheets">Sheets</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Specifications */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Specifications</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="size">Size (Length)</Label>
              <Input
                id="size"
                type="number"
                step="0.01"
                value={formData.size}
                onChange={(e) => handleChange('size', e.target.value)}
                placeholder="e.g., 100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                type="number"
                step="0.01"
                value={formData.width}
                onChange={(e) => handleChange('width', e.target.value)}
                placeholder="e.g., 54"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gsm">GSM</Label>
              <Input
                id="gsm"
                type="number"
                step="0.1"
                value={formData.gsm}
                onChange={(e) => handleChange('gsm', e.target.value)}
                placeholder="e.g., 180"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weightPerBag">Weight Per Bag (kg)</Label>
              <Input
                id="weightPerBag"
                type="number"
                step="0.001"
                value={formData.weightPerBag}
                onChange={(e) => handleChange('weightPerBag', e.target.value)}
                placeholder="e.g., 0.5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bagsPerKg">Bags Per Kg</Label>
              <Input
                id="bagsPerKg"
                type="number"
                step="0.1"
                value={formData.bagsPerKg}
                onChange={(e) => handleChange('bagsPerKg', e.target.value)}
                placeholder="e.g., 2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="thickness">Thickness (microns)</Label>
              <Input
                id="thickness"
                type="number"
                step="1"
                value={formData.thickness}
                onChange={(e) => handleChange('thickness', e.target.value)}
                placeholder="e.g., 50"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stock & Cost */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Stock & Cost</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentStock">Current Stock *</Label>
              <Input
                id="currentStock"
                type="number"
                step="0.01"
                value={formData.currentStock}
                onChange={(e) => handleChange('currentStock', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minStockLevel">Min Stock Level *</Label>
              <Input
                id="minStockLevel"
                type="number"
                step="0.01"
                value={formData.minStockLevel}
                onChange={(e) => handleChange('minStockLevel', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxStockLevel">Max Stock Level</Label>
              <Input
                id="maxStockLevel"
                type="number"
                step="0.01"
                value={formData.maxStockLevel}
                onChange={(e) => handleChange('maxStockLevel', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unitCost">Unit Cost (₹) *</Label>
              <Input
                id="unitCost"
                type="number"
                step="0.01"
                value={formData.unitCost}
                onChange={(e) => handleChange('unitCost', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reorderPoint">Reorder Point</Label>
              <Input
                id="reorderPoint"
                type="number"
                step="0.01"
                value={formData.reorderPoint}
                onChange={(e) => handleChange('reorderPoint', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reorderQuantity">Reorder Quantity</Label>
              <Input
                id="reorderQuantity"
                type="number"
                step="0.01"
                value={formData.reorderQuantity}
                onChange={(e) => handleChange('reorderQuantity', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="warehouseLocation">Warehouse Location</Label>
              <Input
                id="warehouseLocation"
                value={formData.warehouseLocation}
                onChange={(e) => handleChange('warehouseLocation', e.target.value)}
                placeholder="e.g., Warehouse A, Shelf 3"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="batchNumber">Batch Number</Label>
              <Input
                id="batchNumber"
                value={formData.batchNumber}
                onChange={(e) => handleChange('batchNumber', e.target.value)}
                placeholder="e.g., LOT-2024-001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode</Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) => handleChange('barcode', e.target.value)}
                placeholder="Barcode number"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Additional notes about this material..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit" className="bg-amber-500 hover:bg-amber-600" disabled={isSubmitting}>
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Material'}
          </Button>
        </div>
      </form>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Factory, Save, X, ArrowLeft, Plus, Trash2, Calculator
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

interface RawMaterial {
  id: string
  name: string
  unit: string
  currentStock: number
  unitCost: number
  bagsPerKg?: number | null
}

interface MaterialItem {
  rawMaterialId: string
  quantityPlanned: string
  quantityUsed: string
  quantityWasted: string
  notes: string
}

export default function NewProductionPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([])
  const [materialItems, setMaterialItems] = useState<MaterialItem[]>([{
    rawMaterialId: '',
    quantityPlanned: '',
    quantityUsed: '',
    quantityWasted: '0',
    notes: ''
  }])
  const [calculatedCost, setCalculatedCost] = useState({
    materialCost: 0,
    costPerPiece: 0
  })
  const [formData, setFormData] = useState({
    productName: '',
    size: '',
    width: '',
    height: '',
    gsm: '',
    bagsPerKg: '',
    color: '',
    design: '',
    quantityProduced: '',
    quantityRejected: '0',
    laborCost: '0',
    overheadCost: '0',
    workerName: '',
    batchNumber: '',
    shift: '',
    qualityStatus: 'pending',
    qualityNotes: '',
    wasteQuantity: '0',
    wasteReason: '',
    notes: '',
  })

  useEffect(() => {
    fetchRawMaterials()
  }, [])

  const fetchRawMaterials = async () => {
    try {
      const res = await fetch('/api/raw-materials')
      const data = await res.json()
      setRawMaterials(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching raw materials:', error)
    }
  }

  // Calculate costs when materials or quantity change
  useEffect(() => {
    let materialCost = 0
    for (const item of materialItems) {
      if (item.rawMaterialId && item.quantityUsed) {
        const material = rawMaterials.find(m => m.id === item.rawMaterialId)
        if (material) {
          materialCost += parseFloat(item.quantityUsed) * material.unitCost
        }
      }
    }
    
    const laborCost = parseFloat(formData.laborCost) || 0
    const overheadCost = parseFloat(formData.overheadCost) || 0
    const totalCost = materialCost + laborCost + overheadCost
    const quantityProduced = parseInt(formData.quantityProduced) || 1
    const costPerPiece = totalCost / quantityProduced
    
    setCalculatedCost({ materialCost, costPerPiece })
  }, [materialItems, formData.quantityProduced, formData.laborCost, formData.overheadCost, rawMaterials])

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleMaterialChange = (index: number, field: string, value: string) => {
    setMaterialItems(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const addMaterialItem = () => {
    setMaterialItems(prev => [...prev, {
      rawMaterialId: '',
      quantityPlanned: '',
      quantityUsed: '',
      quantityWasted: '0',
      notes: ''
    }])
  }

  const removeMaterialItem = (index: number) => {
    if (materialItems.length > 1) {
      setMaterialItems(prev => prev.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/production', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          rawMaterials: materialItems.filter(m => m.rawMaterialId && m.quantityUsed)
        })
      })

      if (res.ok) {
        router.push('/admin/production')
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to create production entry')
      }
    } catch (error) {
      console.error('Error creating production:', error)
      alert('Failed to create production entry')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Production Entry</h1>
          <p className="text-gray-500">Record production and auto-deduct raw materials</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Info */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Factory className="w-5 h-5 text-amber-500" />
              Product Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="productName">Product Name *</Label>
              <Input
                id="productName"
                value={formData.productName}
                onChange={(e) => handleFormChange('productName', e.target.value)}
                placeholder="e.g., Premium Leather Handbag"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantityProduced">Quantity Produced *</Label>
              <Input
                id="quantityProduced"
                type="number"
                value={formData.quantityProduced}
                onChange={(e) => handleFormChange('quantityProduced', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="size">Size</Label>
              <Input
                id="size"
                type="number"
                step="0.01"
                value={formData.size}
                onChange={(e) => handleFormChange('size', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                type="number"
                step="0.01"
                value={formData.width}
                onChange={(e) => handleFormChange('width', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                type="number"
                step="0.01"
                value={formData.height}
                onChange={(e) => handleFormChange('height', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gsm">GSM</Label>
              <Input
                id="gsm"
                type="number"
                step="0.1"
                value={formData.gsm}
                onChange={(e) => handleFormChange('gsm', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bagsPerKg">Bags Per Kg</Label>
              <Input
                id="bagsPerKg"
                type="number"
                step="0.1"
                value={formData.bagsPerKg}
                onChange={(e) => handleFormChange('bagsPerKg', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) => handleFormChange('color', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="design">Design</Label>
              <Input
                id="design"
                value={formData.design}
                onChange={(e) => handleFormChange('design', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Raw Materials Used */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-amber-500" />
                Raw Materials Used
              </CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addMaterialItem}>
                <Plus className="w-4 h-4 mr-1" />
                Add Material
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {materialItems.map((item, index) => {
              const material = rawMaterials.find(m => m.id === item.rawMaterialId)
              return (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-xs">Material</Label>
                    <Select 
                      value={item.rawMaterialId} 
                      onValueChange={(v) => handleMaterialChange(index, 'rawMaterialId', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select material" />
                      </SelectTrigger>
                      <SelectContent>
                        {rawMaterials.map(m => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name} (Stock: {m.currentStock} {m.unit})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Planned Qty</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.quantityPlanned}
                      onChange={(e) => handleMaterialChange(index, 'quantityPlanned', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Used Qty *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.quantityUsed}
                      onChange={(e) => handleMaterialChange(index, 'quantityUsed', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Wasted</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.quantityWasted}
                      onChange={(e) => handleMaterialChange(index, 'quantityWasted', e.target.value)}
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs">Cost</Label>
                      <div className="h-10 px-3 bg-white border rounded flex items-center text-sm font-medium">
                        ₹{material && item.quantityUsed ? (parseFloat(item.quantityUsed) * material.unitCost).toFixed(2) : '0.00'}
                      </div>
                    </div>
                    {materialItems.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        className="text-red-500"
                        onClick={() => removeMaterialItem(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
            
            {/* Cost Summary */}
            <div className="mt-4 p-4 bg-amber-50 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Material Cost</p>
                  <p className="text-lg font-bold text-gray-900">₹{calculatedCost.materialCost.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Cost Per Piece</p>
                  <p className="text-lg font-bold text-amber-600">₹{calculatedCost.costPerPiece.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Production Details */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Production Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workerName">Worker Name</Label>
              <Input
                id="workerName"
                value={formData.workerName}
                onChange={(e) => handleFormChange('workerName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="batchNumber">Batch Number</Label>
              <Input
                id="batchNumber"
                value={formData.batchNumber}
                onChange={(e) => handleFormChange('batchNumber', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shift">Shift</Label>
              <Select value={formData.shift} onValueChange={(v) => handleFormChange('shift', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select shift" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="afternoon">Afternoon</SelectItem>
                  <SelectItem value="night">Night</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantityRejected">Rejected Quantity</Label>
              <Input
                id="quantityRejected"
                type="number"
                value={formData.quantityRejected}
                onChange={(e) => handleFormChange('quantityRejected', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="laborCost">Labor Cost (₹)</Label>
              <Input
                id="laborCost"
                type="number"
                step="0.01"
                value={formData.laborCost}
                onChange={(e) => handleFormChange('laborCost', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="overheadCost">Overhead Cost (₹)</Label>
              <Input
                id="overheadCost"
                type="number"
                step="0.01"
                value={formData.overheadCost}
                onChange={(e) => handleFormChange('overheadCost', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qualityStatus">Quality Status</Label>
              <Select value={formData.qualityStatus} onValueChange={(v) => handleFormChange('qualityStatus', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="passed">Passed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="rework">Rework Required</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="wasteQuantity">Waste Quantity</Label>
              <Input
                id="wasteQuantity"
                type="number"
                step="0.01"
                value={formData.wasteQuantity}
                onChange={(e) => handleFormChange('wasteQuantity', e.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-4">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleFormChange('notes', e.target.value)}
                rows={2}
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
            {isSubmitting ? 'Saving...' : 'Save Production Entry'}
          </Button>
        </div>
      </form>
    </div>
  )
}

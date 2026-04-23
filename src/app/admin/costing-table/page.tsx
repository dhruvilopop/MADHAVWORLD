'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Database,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Save,
  Calculator,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface CostingEntry {
  id: string
  sizeWidth: number
  sizeHeight: number
  gsm: number
  weightPerBag: number
  bagsPerKg: number
  areaSqm: number | null
  materialType: string | null
  costPerBag: number | null
  sellingPrice: number | null
  notes: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const defaultFormData = {
  sizeWidth: '',
  sizeHeight: '',
  gsm: '',
  weightPerBag: '',
  materialType: '',
  costPerBag: '',
  sellingPrice: '',
  notes: ''
}

export default function CostingTablePage() {
  const [entries, setEntries] = useState<CostingEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterGsm, setFilterGsm] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingEntry, setEditingEntry] = useState<CostingEntry | null>(null)
  const [formData, setFormData] = useState(defaultFormData)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  
  // Bulk import state
  const [showBulkImport, setShowBulkImport] = useState(false)
  const [bulkData, setBulkData] = useState('')

  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = async () => {
    try {
      const res = await fetch('/api/costing-table')
      const data = await res.json()
      setEntries(data)
    } catch (error) {
      console.error('Error fetching costing table:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get unique GSM values for filter
  const gsmOptions = [...new Set(entries.map(e => e.gsm))].sort((a, b) => a - b)

  // Filter entries
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = 
      entry.sizeWidth.toString().includes(searchQuery) ||
      entry.sizeHeight.toString().includes(searchQuery) ||
      entry.gsm.toString().includes(searchQuery) ||
      entry.materialType?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesGsm = filterGsm === 'all' || entry.gsm.toString() === filterGsm
    
    return matchesSearch && matchesGsm
  })

  // Group entries by GSM for table display
  const groupedByGsm = filteredEntries.reduce((acc, entry) => {
    const key = entry.gsm
    if (!acc[key]) acc[key] = []
    acc[key].push(entry)
    return acc
  }, {} as Record<number, CostingEntry[]>)

  const handleOpenModal = (entry?: CostingEntry) => {
    if (entry) {
      setEditingEntry(entry)
      setFormData({
        sizeWidth: entry.sizeWidth.toString(),
        sizeHeight: entry.sizeHeight.toString(),
        gsm: entry.gsm.toString(),
        weightPerBag: entry.weightPerBag.toString(),
        materialType: entry.materialType || '',
        costPerBag: entry.costPerBag?.toString() || '',
        sellingPrice: entry.sellingPrice?.toString() || '',
        notes: entry.notes || ''
      })
    } else {
      setEditingEntry(null)
      setFormData(defaultFormData)
    }
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formData.sizeWidth || !formData.sizeHeight || !formData.gsm || !formData.weightPerBag) {
      return
    }

    setSaving(true)
    try {
      const url = editingEntry 
        ? `/api/costing-table/${editingEntry.id}`
        : '/api/costing-table'
      
      const method = editingEntry ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        await fetchEntries()
        setShowModal(false)
        setFormData(defaultFormData)
        setEditingEntry(null)
      }
    } catch (error) {
      console.error('Error saving entry:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/costing-table/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setEntries(entries.filter(e => e.id !== id))
        setDeleteConfirm(null)
      }
    } catch (error) {
      console.error('Error deleting entry:', error)
    }
  }

  // Bulk import from table format
  const handleBulkImport = async () => {
    if (!bulkData.trim()) return

    setSaving(true)
    try {
      // Parse the bulk data - expect format: width,height,gsm,weightPerBag per line
      const lines = bulkData.trim().split('\n')
      const entries = lines.map(line => {
        const parts = line.split(',').map(p => p.trim())
        return {
          sizeWidth: parseFloat(parts[0]) || 0,
          sizeHeight: parseFloat(parts[1]) || 0,
          gsm: parseFloat(parts[2]) || 0,
          weightPerBag: parseFloat(parts[3]) || 0,
          materialType: parts[4] || null,
          costPerBag: parts[5] ? parseFloat(parts[5]) : null,
          sellingPrice: parts[6] ? parseFloat(parts[6]) : null
        }
      }).filter(e => e.sizeWidth > 0 && e.sizeHeight > 0 && e.gsm > 0 && e.weightPerBag > 0)

      if (entries.length === 0) {
        alert('No valid entries found')
        return
      }

      const res = await fetch('/api/costing-table', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries })
      })

      if (res.ok) {
        await fetchEntries()
        setShowBulkImport(false)
        setBulkData('')
      }
    } catch (error) {
      console.error('Error bulk importing:', error)
    } finally {
      setSaving(false)
    }
  }

  // Calculate bags per kg
  const calculateBagsPerKg = (weightPerBag: number) => {
    if (weightPerBag <= 0) return 0
    return (1000 / weightPerBag).toFixed(2)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Database className="w-7 h-7 text-amber-500" />
            Costing Table
          </h1>
          <p className="text-gray-500 mt-1">
            Manage bag specifications, weights, and costing calculations
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowBulkImport(true)}
            className="gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Bulk Import
          </Button>
          <Button
            onClick={() => handleOpenModal()}
            className="bg-amber-500 hover:bg-amber-600 gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Entry
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Database className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Entries</p>
                <p className="text-xl font-bold">{entries.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calculator className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">GSM Variants</p>
                <p className="text-xl font-bold">{gsmOptions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Size Variants</p>
                <p className="text-xl font-bold">
                  {new Set(entries.map(e => `${e.sizeWidth}x${e.sizeHeight}`)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileSpreadsheet className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">With Pricing</p>
                <p className="text-xl font-bold">
                  {entries.filter(e => e.sellingPrice && e.sellingPrice > 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by size, GSM, or material..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterGsm} onValueChange={setFilterGsm}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by GSM" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All GSM</SelectItem>
                {gsmOptions.map(gsm => (
                  <SelectItem key={gsm} value={gsm.toString()}>
                    {gsm} GSM
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Costing Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Specifications Table</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(groupedByGsm).length === 0 ? (
            <div className="text-center py-12">
              <Database className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No entries found</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || filterGsm !== 'all' 
                  ? 'Try adjusting your filters'
                  : 'Add your first costing entry to get started'}
              </p>
              {!searchQuery && filterGsm === 'all' && (
                <Button onClick={() => handleOpenModal()} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Entry
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              {Object.entries(groupedByGsm).map(([gsm, gsmEntries]) => (
                <div key={gsm} className="mb-6 last:mb-0">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                      {gsm} GSM
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {gsmEntries.length} size{gsmEntries.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="font-semibold">Size (W x H)</TableHead>
                          <TableHead className="font-semibold">Width (inch)</TableHead>
                          <TableHead className="font-semibold">Height (inch)</TableHead>
                          <TableHead className="font-semibold">Weight/Bag (gm)</TableHead>
                          <TableHead className="font-semibold">Bags/KG</TableHead>
                          <TableHead className="font-semibold">Cost/Bag</TableHead>
                          <TableHead className="font-semibold">Price/Bag</TableHead>
                          <TableHead className="font-semibold text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {gsmEntries.map((entry) => (
                          <TableRow key={entry.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium">
                              {entry.sizeWidth} x {entry.sizeHeight}
                            </TableCell>
                            <TableCell>{entry.sizeWidth}</TableCell>
                            <TableCell>{entry.sizeHeight}</TableCell>
                            <TableCell>{entry.weightPerBag}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-mono">
                                {entry.bagsPerKg.toFixed(2)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {entry.costPerBag ? `₹${entry.costPerBag.toFixed(2)}` : '-'}
                            </TableCell>
                            <TableCell>
                              {entry.sellingPrice ? (
                                <span className="text-green-600 font-medium">
                                  ₹{entry.sellingPrice.toFixed(2)}
                                </span>
                              ) : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenModal(entry)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeleteConfirm(entry.id)}
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingEntry ? 'Edit Entry' : 'Add New Entry'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Width (inch) *
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.sizeWidth}
                  onChange={(e) => setFormData({ ...formData, sizeWidth: e.target.value })}
                  placeholder="e.g., 10"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Height (inch) *
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.sizeHeight}
                  onChange={(e) => setFormData({ ...formData, sizeHeight: e.target.value })}
                  placeholder="e.g., 12"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  GSM *
                </label>
                <Input
                  type="number"
                  step="1"
                  value={formData.gsm}
                  onChange={(e) => setFormData({ ...formData, gsm: e.target.value })}
                  placeholder="e.g., 60"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Weight/Bag (gm) *
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.weightPerBag}
                  onChange={(e) => setFormData({ ...formData, weightPerBag: e.target.value })}
                  placeholder="e.g., 8"
                />
              </div>
            </div>
            {formData.weightPerBag && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-2 text-amber-700">
                  <Calculator className="w-4 h-4" />
                  <span className="font-medium">Bags per KG:</span>
                  <span className="font-mono text-lg">
                    {calculateBagsPerKg(parseFloat(formData.weightPerBag) || 0)}
                  </span>
                </div>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Material Type
              </label>
              <Input
                value={formData.materialType}
                onChange={(e) => setFormData({ ...formData, materialType: e.target.value })}
                placeholder="e.g., LDPE, HDPE, PP"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Cost/Bag (₹)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.costPerBag}
                  onChange={(e) => setFormData({ ...formData, costPerBag: e.target.value })}
                  placeholder="e.g., 0.50"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Selling Price/Bag (₹)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                  placeholder="e.g., 1.00"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Notes
              </label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !formData.sizeWidth || !formData.sizeHeight || !formData.gsm || !formData.weightPerBag}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {editingEntry ? 'Update' : 'Add Entry'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Import Modal */}
      <Dialog open={showBulkImport} onOpenChange={setShowBulkImport}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Bulk Import Costing Data</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">
                <strong>Format:</strong> Enter one entry per line with comma-separated values:
              </p>
              <code className="text-xs bg-blue-100 px-2 py-1 rounded mt-1 block">
                width, height, gsm, weightPerBag, materialType, costPerBag, sellingPrice
              </code>
              <p className="text-xs text-blue-600 mt-2">
                Example: 10,12,60,8,LDPE,0.50,1.00
              </p>
            </div>
            <Textarea
              value={bulkData}
              onChange={(e) => setBulkData(e.target.value)}
              placeholder="10,12,60,8,LDPE,0.50,1.00
14,16,60,13,LDPE,0.75,1.50
8,10,80,15,HDPE,0.80,1.60"
              rows={10}
              className="font-mono text-sm"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkImport(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBulkImport}
              disabled={saving || !bulkData.trim()}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <FileSpreadsheet className="w-4 h-4 mr-2" />
              )}
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Confirm Delete
            </DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">
            Are you sure you want to delete this costing entry? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

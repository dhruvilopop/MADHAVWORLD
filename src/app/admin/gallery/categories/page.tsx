'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, FolderOpen, GripVertical, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

interface GalleryCategory {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  sortOrder: number
  isActive: boolean
  createdAt: string
}

export default function GalleryCategoriesAdminPage() {
  const [categories, setCategories] = useState<GalleryCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<GalleryCategory | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    sortOrder: 0,
    isActive: true
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/gallery-categories')
      const data = await res.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = '/api/gallery-categories'
      const method = editingCategory ? 'PUT' : 'POST'
      const body = editingCategory 
        ? { ...formData, id: editingCategory.id } 
        : formData

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        toast({ title: editingCategory ? 'Category updated!' : 'Category created!' })
        setShowForm(false)
        setEditingCategory(null)
        setFormData({ name: '', description: '', image: '', sortOrder: 0, isActive: true })
        fetchCategories()
      }
    } catch (error) {
      toast({ title: 'Error saving category', variant: 'destructive' })
    }
  }

  const handleEdit = (category: GalleryCategory) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      image: category.image || '',
      sortOrder: category.sortOrder,
      isActive: category.isActive
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return
    try {
      const res = await fetch(`/api/gallery-categories?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: 'Category deleted!' })
        fetchCategories()
      }
    } catch (error) {
      toast({ title: 'Error deleting category', variant: 'destructive' })
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gallery Categories</h1>
          <p className="text-gray-500 mt-1">Organize your gallery images into categories</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditingCategory(null); }} className="bg-amber-500 hover:bg-amber-600">
          <Plus className="w-4 h-4 mr-2" /> Add Category
        </Button>
      </div>

      {/* Categories Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className={!category.isActive ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{category.name}</h3>
                      <Badge variant={category.isActive ? 'default' : 'secondary'} className="ml-2">
                        {category.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                      {category.description || 'No description'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Order: {category.sortOrder}</span>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(category)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(category.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No categories yet. Create your first category!</p>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'New Category'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Category Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Cover Image URL</Label>
              <Input
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Active</span>
                </label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-amber-500 hover:bg-amber-600">
                {editingCategory ? 'Update' : 'Create'} Category
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

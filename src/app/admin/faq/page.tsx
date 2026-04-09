'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, GripVertical, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

interface FAQ {
  id: string
  question: string
  answer: string
  category: string | null
  sortOrder: number
  isActive: boolean
  createdAt: string
}

export default function FAQAdminPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: '',
    sortOrder: 0,
    isActive: true
  })

  useEffect(() => {
    fetchFaqs()
  }, [])

  const fetchFaqs = async () => {
    try {
      const res = await fetch('/api/faq')
      const data = await res.json()
      setFaqs(data)
    } catch (error) {
      console.error('Error fetching FAQs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = '/api/faq'
      const method = editingFaq ? 'PUT' : 'POST'
      const body = editingFaq ? { ...formData, id: editingFaq.id } : formData

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        toast({ title: editingFaq ? 'FAQ updated!' : 'FAQ created!' })
        setShowForm(false)
        setEditingFaq(null)
        setFormData({ question: '', answer: '', category: '', sortOrder: 0, isActive: true })
        fetchFaqs()
      }
    } catch (error) {
      toast({ title: 'Error saving FAQ', variant: 'destructive' })
    }
  }

  const handleEdit = (faq: FAQ) => {
    setEditingFaq(faq)
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || '',
      sortOrder: faq.sortOrder,
      isActive: faq.isActive
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return
    try {
      const res = await fetch(`/api/faq?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: 'FAQ deleted!' })
        fetchFaqs()
      }
    } catch (error) {
      toast({ title: 'Error deleting FAQ', variant: 'destructive' })
    }
  }

  const toggleActive = async (faq: FAQ) => {
    try {
      const res = await fetch('/api/faq', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: faq.id, isActive: !faq.isActive })
      })
      if (res.ok) {
        toast({ title: faq.isActive ? 'FAQ deactivated!' : 'FAQ activated!' })
        fetchFaqs()
      }
    } catch (error) {
      toast({ title: 'Error updating FAQ', variant: 'destructive' })
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">FAQ Management</h1>
          <p className="text-gray-500 mt-1">Manage frequently asked questions</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditingFaq(null); }} className="bg-amber-500 hover:bg-amber-600">
          <Plus className="w-4 h-4 mr-2" /> Add FAQ
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>{editingFaq ? 'Edit FAQ' : 'New FAQ'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  placeholder="Question"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  required
                />
                <Textarea
                  placeholder="Answer"
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  rows={4}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Sort Order"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded"
                  />
                  Active
                </label>
                <div className="flex gap-2">
                  <Button type="submit" className="bg-amber-500 hover:bg-amber-600">
                    {editingFaq ? 'Update' : 'Create'} FAQ
                  </Button>
                  <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingFaq(null); }}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* FAQs List */}
      <div className="space-y-3">
        {faqs.map((faq) => (
          <Card key={faq.id} className={!faq.isActive ? 'opacity-60' : ''}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="text-gray-400 cursor-grab">
                  <GripVertical className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                    <div className="flex items-center gap-2">
                      {faq.category && <Badge variant="outline">{faq.category}</Badge>}
                      <Badge variant={faq.isActive ? 'default' : 'secondary'}>
                        {faq.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-gray-600 mt-2">{faq.answer}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(faq)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(faq.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

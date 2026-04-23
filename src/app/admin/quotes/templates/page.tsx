'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  FileText, Plus, Search, Eye, Copy, Trash2, 
  Loader2, Sparkles, ArrowRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface Template {
  id: string
  name: string
  description: string
  category: string
  itemCount: number
  lastUsed: string | null
  usageCount: number
}

const defaultTemplates: Template[] = [
  {
    id: '1',
    name: 'Standard Product Quote',
    description: 'Basic quote template for standard products with quantity and pricing',
    category: 'Products',
    itemCount: 5,
    lastUsed: '2024-01-15',
    usageCount: 45
  },
  {
    id: '2',
    name: 'Bulk Order Quote',
    description: 'Template for bulk orders with tiered pricing and discounts',
    category: 'Bulk',
    itemCount: 10,
    lastUsed: '2024-01-10',
    usageCount: 23
  },
  {
    id: '3',
    name: 'Custom Manufacturing Quote',
    description: 'Detailed quote for custom manufacturing orders with specifications',
    category: 'Custom',
    itemCount: 8,
    lastUsed: '2024-01-12',
    usageCount: 15
  },
  {
    id: '4',
    name: 'Export Order Quote',
    description: 'International quote template with currency conversion and shipping',
    category: 'Export',
    itemCount: 12,
    lastUsed: '2024-01-08',
    usageCount: 8
  },
  {
    id: '5',
    name: 'Service Quote',
    description: 'Template for service-based quotations with hourly rates',
    category: 'Services',
    itemCount: 6,
    lastUsed: '2024-01-14',
    usageCount: 32
  }
]

export default function QuoteTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>(defaultTemplates)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = ['All', 'Products', 'Bulk', 'Custom', 'Export', 'Services']

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || selectedCategory === 'All' || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Products': return 'bg-blue-100 text-blue-700'
      case 'Bulk': return 'bg-amber-100 text-amber-700'
      case 'Custom': return 'bg-violet-100 text-violet-700'
      case 'Export': return 'bg-emerald-100 text-emerald-700'
      case 'Services': return 'bg-rose-100 text-rose-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quote Templates</h1>
          <p className="text-gray-500 mt-1">Pre-defined templates for quick quote creation</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/quotes">
            <Button variant="outline" className="gap-2">
              <ArrowRight className="w-4 h-4" />
              All Quotes
            </Button>
          </Link>
          <Button className="bg-amber-500 hover:bg-amber-600 gap-2">
            <Plus className="w-4 h-4" />
            Create Template
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Templates', value: templates.length, icon: FileText, color: 'from-blue-500' },
          { label: 'Categories', value: 5, icon: Sparkles, color: 'from-violet-500' },
          { label: 'Total Usage', value: templates.reduce((sum, t) => sum + t.usageCount, 0), icon: Eye, color: 'from-emerald-500' },
          { label: 'Most Popular', value: 'Standard', icon: Copy, color: 'from-amber-500' },
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
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category || (category === 'All' && !selectedCategory) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category === 'All' ? null : category)}
                  className={selectedCategory === category || (category === 'All' && !selectedCategory) ? 'bg-amber-500 hover:bg-amber-600' : ''}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No templates found</h3>
          <p className="text-gray-500 mt-1">Create your first template to get started</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-0 shadow-sm hover:shadow-lg transition-all h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <Badge className={getCategoryColor(template.category)}>
                          {template.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-4">{template.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{template.itemCount} items</span>
                    <span>Used {template.usageCount} times</span>
                  </div>

                  {template.lastUsed && (
                    <p className="text-xs text-gray-400 mb-4">
                      Last used: {new Date(template.lastUsed).toLocaleDateString()}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-1">
                      <Eye className="w-4 h-4" />
                      Preview
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 gap-1">
                      <Copy className="w-4 h-4" />
                      Use
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, Globe, FileText, Search, Image } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'

interface SEOSetting {
  id: string
  pageType: string
  pageId: string | null
  metaTitle: string | null
  metaDesc: string | null
  metaKeys: string | null
  ogImage: string | null
  canonical: string | null
}

const pageTypes = [
  { value: 'home', label: 'Home Page', icon: Globe },
  { value: 'products', label: 'Products Page', icon: FileText },
  { value: 'gallery', label: 'Gallery Page', icon: Image },
  { value: 'contact', label: 'Contact Page', icon: FileText },
  { value: 'about', label: 'About Us', icon: FileText },
  { value: 'blog', label: 'Blog', icon: FileText },
]

export default function SEOAdminPage() {
  const [seoSettings, setSeoSettings] = useState<Record<string, SEOSetting>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState<Record<string, {
    metaTitle: string
    metaDesc: string
    metaKeys: string
    ogImage: string
    canonical: string
  }>>({})

  useEffect(() => {
    fetchSEOSettings()
  }, [])

  const fetchSEOSettings = async () => {
    try {
      const res = await fetch('/api/seo')
      const data = await res.json()
      const dataArray = Array.isArray(data) ? data : []
      
      const settingsMap: Record<string, SEOSetting> = {}
      const formMap: Record<string, typeof formData[string]> = {}
      
      for (const setting of dataArray) {
        settingsMap[setting.pageType] = setting
        formMap[setting.pageType] = {
          metaTitle: setting.metaTitle || '',
          metaDesc: setting.metaDesc || '',
          metaKeys: setting.metaKeys || '',
          ogImage: setting.ogImage || '',
          canonical: setting.canonical || ''
        }
      }
      
      // Initialize defaults for all page types
      for (const pt of pageTypes) {
        if (!formMap[pt.value]) {
          formMap[pt.value] = {
            metaTitle: '', metaDesc: '', metaKeys: '', ogImage: '', canonical: ''
          }
        }
      }
      
      setSeoSettings(settingsMap)
      setFormData(formMap)
    } catch (error) {
      console.error('Error fetching SEO settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (pageType: string) => {
    setSaving(true)
    try {
      const data = formData[pageType]
      
      const res = await fetch('/api/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageType,
          ...data
        })
      })

      if (res.ok) {
        toast({ title: 'SEO settings saved!' })
        fetchSEOSettings()
      }
    } catch (error) {
      toast({ title: 'Error saving SEO settings', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">SEO Settings</h1>
        <p className="text-gray-500 mt-1">Manage meta tags and SEO for each page</p>
      </div>

      <Tabs defaultValue="home" className="space-y-6">
        <TabsList className="bg-gray-100 p-1 flex-wrap h-auto">
          {pageTypes.map((pt) => (
            <TabsTrigger 
              key={pt.value} 
              value={pt.value}
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <pt.icon className="w-4 h-4 mr-2" /> {pt.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {pageTypes.map((pt) => (
          <TabsContent key={pt.value} value={pt.value}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{pt.label} SEO</span>
                    <Button
                      onClick={() => handleSave(pt.value)}
                      disabled={saving}
                      className="bg-amber-500 hover:bg-amber-600"
                    >
                      <Save className="w-4 h-4 mr-2" /> Save
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Meta Title</label>
                    <Input
                      placeholder="Page title for search engines"
                      value={formData[pt.value]?.metaTitle || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        [pt.value]: { ...formData[pt.value], metaTitle: e.target.value }
                      })}
                    />
                    <p className="text-xs text-gray-400">Recommended: 50-60 characters</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Meta Description</label>
                    <Textarea
                      placeholder="Brief description for search engines"
                      value={formData[pt.value]?.metaDesc || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        [pt.value]: { ...formData[pt.value], metaDesc: e.target.value }
                      })}
                      rows={3}
                    />
                    <p className="text-xs text-gray-400">Recommended: 150-160 characters</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Meta Keywords</label>
                    <Input
                      placeholder="keyword1, keyword2, keyword3"
                      value={formData[pt.value]?.metaKeys || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        [pt.value]: { ...formData[pt.value], metaKeys: e.target.value }
                      })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">OG Image URL</label>
                      <Input
                        placeholder="https://example.com/image.jpg"
                        value={formData[pt.value]?.ogImage || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          [pt.value]: { ...formData[pt.value], ogImage: e.target.value }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Canonical URL</label>
                      <Input
                        placeholder="https://example.com/page"
                        value={formData[pt.value]?.canonical || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          [pt.value]: { ...formData[pt.value], canonical: e.target.value }
                        })}
                      />
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-2">Google Search Preview</p>
                    <div className="space-y-1">
                      <p className="text-blue-600 text-lg font-medium truncate">
                        {formData[pt.value]?.metaTitle || 'Page Title'}
                      </p>
                      <p className="text-green-700 text-sm truncate">
                        {formData[pt.value]?.canonical || `https://example.com/${pt.value}`}
                      </p>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {formData[pt.value]?.metaDesc || 'Meta description will appear here...'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

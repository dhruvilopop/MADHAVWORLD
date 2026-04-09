'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'

interface CMSPage {
  id: string
  slug: string
  title: string
  content: string
  metaTitle: string | null
  metaDesc: string | null
  isActive: boolean
}

export default function CMSAdminPage() {
  const [pages, setPages] = useState<Record<string, CMSPage>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState<Record<string, { title: string; content: string; metaTitle: string; metaDesc: string }>>({
    about: { title: '', content: '', metaTitle: '', metaDesc: '' },
    terms: { title: '', content: '', metaTitle: '', metaDesc: '' },
    privacy: { title: '', content: '', metaTitle: '', metaDesc: '' }
  })

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    try {
      const res = await fetch('/api/cms')
      const data: CMSPage[] = await res.json()
      
      const pagesMap: Record<string, CMSPage> = {}
      const formMap: Record<string, { title: string; content: string; metaTitle: string; metaDesc: string }> = {}
      
      for (const page of data) {
        pagesMap[page.slug] = page
        formMap[page.slug] = {
          title: page.title,
          content: page.content,
          metaTitle: page.metaTitle || '',
          metaDesc: page.metaDesc || ''
        }
      }
      
      // Set defaults for missing pages
      if (!formMap.about) formMap.about = { title: 'About Us', content: '', metaTitle: '', metaDesc: '' }
      if (!formMap.terms) formMap.terms = { title: 'Terms & Conditions', content: '', metaTitle: '', metaDesc: '' }
      if (!formMap.privacy) formMap.privacy = { title: 'Privacy Policy', content: '', metaTitle: '', metaDesc: '' }
      
      setPages(pagesMap)
      setFormData(formMap)
    } catch (error) {
      console.error('Error fetching pages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (slug: string) => {
    setSaving(true)
    try {
      const data = formData[slug]
      const existingPage = pages[slug]

      const res = await fetch('/api/cms', {
        method: existingPage ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: existingPage?.id,
          slug,
          title: data.title,
          content: data.content,
          metaTitle: data.metaTitle,
          metaDesc: data.metaDesc,
          isActive: true
        })
      })

      if (res.ok) {
        toast({ title: 'Page saved successfully!' })
        fetchPages()
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      toast({ title: 'Error saving page', variant: 'destructive' })
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
        <h1 className="text-3xl font-bold text-gray-900">CMS Pages</h1>
        <p className="text-gray-500 mt-1">Manage About Us, Terms & Conditions, Privacy Policy</p>
      </div>

      <Tabs defaultValue="about" className="space-y-6">
        <TabsList className="bg-gray-100 p-1">
          <TabsTrigger value="about" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <FileText className="w-4 h-4 mr-2" /> About Us
          </TabsTrigger>
          <TabsTrigger value="terms" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <FileText className="w-4 h-4 mr-2" /> Terms & Conditions
          </TabsTrigger>
          <TabsTrigger value="privacy" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <FileText className="w-4 h-4 mr-2" /> Privacy Policy
          </TabsTrigger>
        </TabsList>

        {['about', 'terms', 'privacy'].map((slug) => (
          <TabsContent key={slug} value={slug}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{formData[slug]?.title || slug.charAt(0).toUpperCase() + slug.slice(1)}</span>
                    <Button 
                      onClick={() => handleSave(slug)} 
                      disabled={saving}
                      className="bg-amber-500 hover:bg-amber-600"
                    >
                      <Save className="w-4 h-4 mr-2" /> Save Changes
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Page Title"
                    value={formData[slug]?.title || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      [slug]: { ...formData[slug], title: e.target.value }
                    })}
                  />
                  <Textarea
                    placeholder="Page Content (supports HTML)"
                    value={formData[slug]?.content || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      [slug]: { ...formData[slug], content: e.target.value }
                    })}
                    rows={15}
                    className="font-mono"
                  />
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">SEO Title</label>
                      <Input
                        placeholder="Meta Title for SEO"
                        value={formData[slug]?.metaTitle || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          [slug]: { ...formData[slug], metaTitle: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">SEO Description</label>
                      <Input
                        placeholder="Meta Description for SEO"
                        value={formData[slug]?.metaDesc || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          [slug]: { ...formData[slug], metaDesc: e.target.value }
                        })}
                      />
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

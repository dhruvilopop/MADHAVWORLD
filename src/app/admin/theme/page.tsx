'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, Palette, Type, Facebook, Instagram, Twitter, Linkedin, Youtube } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'

interface ThemeSettings {
  id: string
  primaryColor: string
  accentColor: string
  fontFamily: string
  borderRadius: string
  customCSS: string | null
}

interface SocialLink {
  id: string
  platform: string
  url: string
  isActive: boolean
  sortOrder: number
}

export default function ThemeAdminPage() {
  const [theme, setTheme] = useState<ThemeSettings | null>(null)
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const [themeForm, setThemeForm] = useState({
    primaryColor: '#f59e0b',
    accentColor: '#d97706',
    fontFamily: 'Inter',
    borderRadius: '0.75rem',
    customCSS: ''
  })

  const [socialForm, setSocialForm] = useState<Record<string, string>>({
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: '',
    youtube: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [themeRes, socialRes] = await Promise.all([
        fetch('/api/theme'),
        fetch('/api/social-links')
      ])
      
      const themeData = await themeRes.json()
      const socialData: SocialLink[] = await socialRes.json()

      if (themeData) {
        setTheme(themeData)
        setThemeForm({
          primaryColor: themeData.primaryColor,
          accentColor: themeData.accentColor,
          fontFamily: themeData.fontFamily,
          borderRadius: themeData.borderRadius,
          customCSS: themeData.customCSS || ''
        })
      }

      const links: Record<string, string> = {}
      const socialArray = Array.isArray(socialData) ? socialData : []
      for (const link of socialArray) {
        links[link.platform] = link.url
      }
      setSocialForm(links)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveTheme = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(themeForm)
      })
      if (res.ok) {
        toast({ title: 'Theme settings saved!' })
        fetchData()
      }
    } catch (error) {
      toast({ title: 'Error saving theme', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveSocial = async () => {
    setSaving(true)
    try {
      for (const [platform, url] of Object.entries(socialForm)) {
        if (url) {
          await fetch('/api/social-links', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ platform, url, isActive: true })
          })
        }
      }
      toast({ title: 'Social links saved!' })
    } catch (error) {
      toast({ title: 'Error saving social links', variant: 'destructive' })
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
        <h1 className="text-3xl font-bold text-gray-900">Theme & Social Settings</h1>
        <p className="text-gray-500 mt-1">Customize your website appearance</p>
      </div>

      <Tabs defaultValue="theme" className="space-y-6">
        <TabsList className="bg-gray-100 p-1">
          <TabsTrigger value="theme" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Palette className="w-4 h-4 mr-2" /> Theme Colors
          </TabsTrigger>
          <TabsTrigger value="social" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Social Links
          </TabsTrigger>
        </TabsList>

        <TabsContent value="theme">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle>Theme Colors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Primary Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={themeForm.primaryColor}
                        onChange={(e) => setThemeForm({ ...themeForm, primaryColor: e.target.value })}
                        className="w-12 h-12 rounded-lg cursor-pointer border-0"
                      />
                      <Input
                        value={themeForm.primaryColor}
                        onChange={(e) => setThemeForm({ ...themeForm, primaryColor: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Accent Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={themeForm.accentColor}
                        onChange={(e) => setThemeForm({ ...themeForm, accentColor: e.target.value })}
                        className="w-12 h-12 rounded-lg cursor-pointer border-0"
                      />
                      <Input
                        value={themeForm.accentColor}
                        onChange={(e) => setThemeForm({ ...themeForm, accentColor: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Font Family</label>
                    <select
                      value={themeForm.fontFamily}
                      onChange={(e) => setThemeForm({ ...themeForm, fontFamily: e.target.value })}
                      className="w-full h-10 px-3 rounded-md border border-gray-200"
                    >
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Poppins">Poppins</option>
                      <option value="Montserrat">Montserrat</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Border Radius</label>
                    <select
                      value={themeForm.borderRadius}
                      onChange={(e) => setThemeForm({ ...themeForm, borderRadius: e.target.value })}
                      className="w-full h-10 px-3 rounded-md border border-gray-200"
                    >
                      <option value="0rem">None (0)</option>
                      <option value="0.25rem">Small (0.25rem)</option>
                      <option value="0.5rem">Medium (0.5rem)</option>
                      <option value="0.75rem">Large (0.75rem)</option>
                      <option value="1rem">XL (1rem)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Custom CSS</label>
                  <textarea
                    value={themeForm.customCSS}
                    onChange={(e) => setThemeForm({ ...themeForm, customCSS: e.target.value })}
                    placeholder="/* Add custom CSS here */"
                    rows={6}
                    className="w-full p-3 rounded-md border border-gray-200 font-mono text-sm"
                  />
                </div>

                <Button onClick={handleSaveTheme} disabled={saving} className="bg-amber-500 hover:bg-amber-600">
                  <Save className="w-4 h-4 mr-2" /> Save Theme Settings
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="social">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle>Social Media Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { platform: 'facebook', icon: Facebook, placeholder: 'https://facebook.com/yourpage' },
                  { platform: 'instagram', icon: Instagram, placeholder: 'https://instagram.com/yourprofile' },
                  { platform: 'twitter', icon: Twitter, placeholder: 'https://twitter.com/yourprofile' },
                  { platform: 'linkedin', icon: Linkedin, placeholder: 'https://linkedin.com/company/yourcompany' },
                  { platform: 'youtube', icon: Youtube, placeholder: 'https://youtube.com/@yourchannel' }
                ].map(({ platform, icon: Icon, placeholder }) => (
                  <div key={platform} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <Input
                      placeholder={placeholder}
                      value={socialForm[platform] || ''}
                      onChange={(e) => setSocialForm({ ...socialForm, [platform]: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                ))}

                <Button onClick={handleSaveSocial} disabled={saving} className="bg-amber-500 hover:bg-amber-600 mt-4">
                  <Save className="w-4 h-4 mr-2" /> Save Social Links
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

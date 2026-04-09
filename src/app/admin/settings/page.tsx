'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Save, Loader2, Building, MapPin, Phone, Mail, FileText, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ImageUpload } from '@/components/ui/image-upload'
import { useToast } from '@/hooks/use-toast'

interface Settings {
  id: string
  companyName: string
  companyLogo: string | null
  address: string | null
  phone: string | null
  email: string | null
  description: string | null
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    companyName: '',
    companyLogo: '',
    address: '',
    phone: '',
    email: '',
    description: '',
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      setSettings(data)
      setFormData({
        companyName: data.companyName || '',
        companyLogo: data.companyLogo || '',
        address: data.address || '',
        phone: data.phone || '',
        email: data.email || '',
        description: data.description || '',
      })
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        toast({ title: 'Settings saved successfully!' })
        fetchSettings()
      }
    } catch {
      toast({ title: 'Error saving settings', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Website Settings</h2>
        <p className="text-gray-600">Manage your website's general settings and information.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Company Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5 text-amber-600" />
              Company Information
            </CardTitle>
            <CardDescription>
              Basic company details displayed throughout the website
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="Madhav World Bags Industry"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Contact Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@madhavworld.com"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Contact Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter your company address"
                  className="pl-10 min-h-[80px]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Company Description</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description about your company"
                  className="pl-10 min-h-[100px]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-amber-600" />
              Company Logo
            </CardTitle>
            <CardDescription>
              Your logo appears in the header and footer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ImageUpload
              value={formData.companyLogo}
              onChange={(url) => setFormData({ ...formData, companyLogo: url })}
              folder="logos"
              className="max-w-xs"
            />
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>How your company info will appear</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6">
              <div className="flex items-center gap-4 mb-4">
                {formData.companyLogo ? (
                  <img
                    src={formData.companyLogo}
                    alt="Logo"
                    className="h-12 w-12 object-contain rounded-lg"
                  />
                ) : (
                  <div className="h-12 w-12 bg-gradient-to-br from-amber-600 to-amber-800 rounded-lg flex items-center justify-center">
                    <Building className="h-6 w-6 text-white" />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-amber-800">
                    {formData.companyName || 'Company Name'}
                  </h3>
                  {formData.description && (
                    <p className="text-sm text-gray-600">{formData.description}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                {formData.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-600" />
                    <span className="truncate">{formData.address}</span>
                  </div>
                )}
                {formData.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-amber-600" />
                    <span>{formData.phone}</span>
                  </div>
                )}
                {formData.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-amber-600" />
                    <span>{formData.email}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => fetchSettings()}
          >
            Reset
          </Button>
          <Button
            type="submit"
            className="bg-amber-600 hover:bg-amber-700 gap-2"
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  )
}

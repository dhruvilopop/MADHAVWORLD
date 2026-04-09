'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

interface Settings {
  companyName: string
  address: string | null
  phone: string | null
  email: string | null
}

const contactInfo = [
  {
    icon: MapPin,
    title: 'Visit Us',
    description: 'Come visit our factory',
  },
  {
    icon: Phone,
    title: 'Call Us',
    description: 'Mon-Sat, 9AM-6PM',
  },
  {
    icon: Mail,
    title: 'Email Us',
    description: 'We reply within 24 hours',
  },
  {
    icon: Clock,
    title: 'Working Hours',
    description: 'Mon - Sat: 9:00 AM - 6:00 PM',
  },
]

export default function ContactPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(setSettings)
      .catch(console.error)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setIsSubmitted(true)
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
        toast({
          title: 'Message Sent!',
          description: 'We will get back to you soon.',
        })
      } else {
        throw new Error('Failed to submit')
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-50 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
                Get In Touch
              </span>
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Have a question or want to work with us? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 -mt-10 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow h-full">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <info.icon className="w-7 h-7 text-amber-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{info.title}</h3>
                    <p className="text-gray-600 text-sm">{info.description}</p>
                    {info.icon === MapPin && settings?.address && (
                      <p className="text-amber-600 text-sm mt-2">{settings.address}</p>
                    )}
                    {info.icon === Phone && settings?.phone && (
                      <a href={`tel:${settings.phone}`} className="text-amber-600 text-sm mt-2 block hover:underline">
                        {settings.phone}
                      </a>
                    )}
                    {info.icon === Mail && settings?.email && (
                      <a href={`mailto:${settings.email}`} className="text-amber-600 text-sm mt-2 block hover:underline">
                        {settings.email}
                      </a>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-5 gap-12">
              {/* Form */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="lg:col-span-3"
              >
                <Card className="shadow-xl border-0">
                  <CardContent className="p-8">
                    {isSubmitted ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-12"
                      >
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                          <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-900 mb-2">Thank You!</h3>
                        <p className="text-gray-600 mb-6">
                          Your message has been sent successfully. We'll get back to you soon.
                        </p>
                        <Button
                          onClick={() => setIsSubmitted(false)}
                          variant="outline"
                        >
                          Send Another Message
                        </Button>
                      </motion.div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="name">Full Name *</Label>
                            <Input
                              id="name"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              placeholder="John Doe"
                              required
                              className="h-12"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address *</Label>
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              placeholder="john@example.com"
                              required
                              className="h-12"
                            />
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                              id="phone"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              placeholder="+91 98765 43210"
                              className="h-12"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="subject">Subject *</Label>
                            <Input
                              id="subject"
                              value={formData.subject}
                              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                              placeholder="Product Inquiry"
                              required
                              className="h-12"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="message">Message *</Label>
                          <Textarea
                            id="message"
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            placeholder="Tell us how we can help you..."
                            required
                            rows={5}
                            className="resize-none"
                          />
                        </div>
                        <Button
                          type="submit"
                          size="lg"
                          className="w-full bg-amber-600 hover:bg-amber-700 text-white gap-2"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              Send Message
                            </>
                          )}
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Side Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="lg:col-span-2"
              >
                <div className="sticky top-32">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Let's Connect</h3>
                  <div className="space-y-6">
                    <p className="text-gray-600">
                      Whether you're looking for custom bags for your business, want to become a distributor, or have a question about our products, we're here to help.
                    </p>
                    
                    <div className="bg-amber-50 rounded-2xl p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Quick Response</h4>
                      <ul className="space-y-3 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Response within 24 hours
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Personalized assistance
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Free quotes for bulk orders
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Custom design support
                        </li>
                      </ul>
                    </div>

                    {settings?.phone && (
                      <a
                        href={`tel:${settings.phone}`}
                        className="block bg-white border-2 border-amber-200 rounded-2xl p-6 hover:border-amber-400 transition-colors"
                      >
                        <p className="text-sm text-gray-600 mb-1">Call us directly</p>
                        <p className="text-xl font-semibold text-amber-600">{settings.phone}</p>
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-12 bg-amber-50">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-3xl overflow-hidden shadow-xl">
            <div className="aspect-[16/6] bg-gray-200 relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3672.2770381!2d72.5765!3d23.0225!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDAxJzIxLjAiTiA3MsKwMzQnMzUuNCJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

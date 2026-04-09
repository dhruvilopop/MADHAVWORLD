'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Factory, Mail, Phone, MapPin, Instagram, Facebook, Twitter, Settings } from 'lucide-react'

interface Settings {
  companyName: string
  address: string | null
  phone: string | null
  email: string | null
}

const quickLinks = [
  { name: 'Home', href: '#home' },
  { name: 'Products', href: '#products' },
  { name: 'Gallery', href: '#gallery' },
  { name: 'About Us', href: '#about' },
  { name: 'Contact', href: '#contact' },
]

export default function Footer() {
  const [settings, setSettings] = useState<Settings | null>(null)

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(setSettings)
      .catch(console.error)
  }, [])

  const handleNavClick = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4">
        {/* Main Footer */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 bg-gradient-to-br from-amber-500 to-amber-700 rounded-lg flex items-center justify-center shadow-lg">
                <Factory className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{settings?.companyName || 'Madhav World Bags'}</h3>
                <p className="text-sm text-gray-400">Premium Quality Bags</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Crafting excellence since 1995. We manufacture premium quality bags with superior craftsmanship and attention to detail.
            </p>
            <div className="flex gap-3 mt-6">
              {[Facebook, Instagram, Twitter].map((Icon, index) => (
                <motion.a
                  key={index}
                  href="#"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="h-10 w-10 rounded-full bg-gray-700 hover:bg-amber-600 flex items-center justify-center transition-colors"
                >
                  <Icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h4 className="text-lg font-semibold mb-6 relative inline-block">
              Quick Links
              <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-amber-500" />
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <motion.li
                  key={link.name}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <button
                    onClick={() => handleNavClick(link.href)}
                    className="text-gray-400 hover:text-amber-400 transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-amber-500 transition-colors" />
                    {link.name}
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 className="text-lg font-semibold mb-6 relative inline-block">
              Contact Us
              <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-amber-500" />
            </h4>
            <ul className="space-y-4">
              {settings?.address && (
                <li className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-400 text-sm">{settings.address}</span>
                </li>
              )}
              {settings?.phone && (
                <li className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-amber-500 flex-shrink-0" />
                  <a href={`tel:${settings.phone}`} className="text-gray-400 text-sm hover:text-amber-400 transition-colors">
                    {settings.phone}
                  </a>
                </li>
              )}
              {settings?.email && (
                <li className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-amber-500 flex-shrink-0" />
                  <a href={`mailto:${settings.email}`} className="text-gray-400 text-sm hover:text-amber-400 transition-colors">
                    {settings.email}
                  </a>
                </li>
              )}
            </ul>
          </motion.div>

          {/* Admin Portal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h4 className="text-lg font-semibold mb-6 relative inline-block">
              Admin Portal
              <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-amber-500" />
            </h4>
            <p className="text-gray-400 text-sm mb-4">
              Manage your website content, products, gallery, and more from the admin dashboard.
            </p>
            <Link href="/admin">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors text-sm font-medium"
              >
                <Settings className="w-4 h-4" />
                Go to Admin Panel
              </motion.button>
            </Link>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} {settings?.companyName || 'Madhav World Bags Industry'}. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link href="#" className="text-gray-500 hover:text-amber-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="text-gray-500 hover:text-amber-400 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ShoppingBag, Factory, Images, Phone, Home, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Settings {
  companyName: string
  companyLogo: string | null
}

const navItems = [
  { name: 'Home', href: '#home', icon: Home },
  { name: 'Products', href: '#products', icon: ShoppingBag },
  { name: 'Gallery', href: '#gallery', icon: Images },
  { name: 'Customize', href: '#customizer', icon: Palette },
  { name: 'Contact', href: '#contact', icon: Phone },
]

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [settings, setSettings] = useState<Settings | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(setSettings)
      .catch(console.error)
  }, [])

  const handleNavClick = (href: string) => {
    setIsOpen(false)
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const companyName = settings?.companyName || 'Madhav World Bags'
  const shortName = companyName.split(' ')[0]

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg' 
          : 'bg-white/80 backdrop-blur-sm'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* LEFT SIDE - Logo & Company Name */}
          <button 
            onClick={() => handleNavClick('#home')} 
            className="flex items-center gap-3 group"
          >
            {settings?.companyLogo ? (
              <img 
                src={settings.companyLogo} 
                alt={companyName}
                className="h-10 w-10 md:h-12 md:w-12 object-contain rounded-full"
              />
            ) : (
              <div className="h-10 w-10 md:h-12 md:w-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                <Factory className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
            )}
            <div className="hidden sm:block">
              <span className="text-base md:text-lg font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                {companyName}
              </span>
              <p className="text-[10px] text-gray-500 tracking-wider uppercase -mt-0.5">Premium Bags</p>
            </div>
          </button>

          {/* RIGHT SIDE - Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item, index) => (
              <motion.button
                key={item.name}
                onClick={() => handleNavClick(item.href)}
                className="relative px-4 py-2 text-sm font-medium text-gray-700 hover:text-amber-600 transition-colors rounded-lg hover:bg-gray-50"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {item.name}
              </motion.button>
            ))}
          </nav>

          {/* MOBILE: Menu Button */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-md border-t shadow-lg"
          >
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col gap-1">
                {navItems.map((item, index) => (
                  <motion.button
                    key={item.name}
                    onClick={() => handleNavClick(item.href)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors w-full text-left"
                  >
                    <item.icon className="h-5 w-5 text-amber-500" />
                    {item.name}
                  </motion.button>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

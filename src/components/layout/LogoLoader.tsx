'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Factory } from 'lucide-react'

interface LogoLoaderProps {
  onLoadComplete: () => void
  settings?: {
    companyName: string
    companyLogo: string | null
  } | null
}

export default function LogoLoader({ onLoadComplete, settings }: LogoLoaderProps) {
  const [isVisible, setIsVisible] = useState(true)
  const companyName = settings?.companyName || 'Madhav World Bags'

  useEffect(() => {
    // Simple fade out after 1.5 seconds
    const fadeTimer = setTimeout(() => {
      setIsVisible(false)
    }, 1200)

    const completeTimer = setTimeout(() => {
      onLoadComplete()
    }, 1800)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(completeTimer)
    }
  }, [onLoadComplete])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-white"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            {/* Logo */}
            <div className="relative mb-6">
              {settings?.companyLogo ? (
                <div className="w-24 h-24 md:w-32 md:h-32 relative rounded-full overflow-hidden bg-white shadow-lg">
                  <img
                    src={settings.companyLogo}
                    alt={companyName}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center shadow-lg">
                  <Factory className="w-12 h-12 md:w-16 md:h-16 text-white" />
                </div>
              )}
            </div>

            {/* Company Name */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl md:text-3xl font-bold text-gray-900"
            >
              {companyName}
            </motion.h1>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-sm text-gray-500 tracking-wider uppercase mt-2"
            >
              Premium Quality Bags
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

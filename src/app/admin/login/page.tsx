'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Factory, Lock, User, Loader2, Eye, EyeOff, ArrowRight, Shield, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'

export default function AdminLoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      })

      const data = await res.json()

      if (res.ok && data.success) {
        // Store session token in localStorage for backup auth
        if (data.token) {
          localStorage.setItem('admin_token', data.token)
        }
        toast({ title: 'Login successful!' })
        // Use router.push instead of window.location for better SPA navigation
        router.push('/admin')
        router.refresh()
      } else {
        toast({ 
          title: 'Login failed', 
          description: data.error || 'Invalid credentials',
          variant: 'destructive' 
        })
      }
    } catch {
      toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ 
              rotate: 360,
            }}
            transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
            className="absolute top-1/4 left-1/4 w-96 h-96 border border-gray-700/30 rounded-full"
          />
          <motion.div
            animate={{ 
              rotate: -360,
            }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            className="absolute top-1/3 left-1/3 w-80 h-80 border border-gray-600/20 rounded-full"
          />
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute top-20 right-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
            className="absolute bottom-20 left-20 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <motion.div
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30"
              >
                <Factory className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold text-white">Madhav World</h1>
                <p className="text-gray-400">Bags Industry</p>
              </div>
            </div>

            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
              Welcome to<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                Admin Portal
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-md mb-8">
              Manage your products, orders, customers, and track your business growth all in one place.
            </p>

            {/* Features */}
            <div className="space-y-4">
              {[
                { icon: '📦', text: 'Product & Inventory Management' },
                { icon: '📊', text: 'Sales & Analytics Dashboard' },
                { icon: '👥', text: 'Customer Relationship Management' },
                { icon: '🏭', text: 'Production Tracking System' },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-3 text-gray-300"
                >
                  <span className="text-xl">{feature.icon}</span>
                  <span>{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <motion.div
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <Factory className="w-8 h-8 text-white" />
            </motion.div>
          </div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full mb-4">
              <Shield className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-700">Secure Login</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Login</h2>
            <p className="text-gray-500">Enter your credentials to access the portal</p>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Username Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Username</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <User className="w-5 h-5" />
                </div>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  className="pl-12 h-14 rounded-xl border-gray-200 focus:border-amber-500 focus:ring-amber-500/20 text-lg"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="pl-12 pr-12 h-14 rounded-xl border-gray-200 focus:border-amber-500 focus:ring-amber-500/20 text-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold text-lg shadow-lg shadow-amber-500/30 transition-all"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Logging in...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Login to Dashboard</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </Button>
            </motion.div>
          </motion.form>

          {/* Demo Credentials */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100"
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-gray-700">Demo Credentials</span>
            </div>
            <div className="text-sm text-gray-500">
              <p>Username: <code className="px-2 py-0.5 bg-gray-100 rounded text-gray-700">madhavbag</code></p>
              <p className="mt-1">Password: <code className="px-2 py-0.5 bg-gray-100 rounded text-gray-700">1122334455</code></p>
            </div>
          </motion.div>

          {/* Back to Website */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <a 
              href="/" 
              className="inline-flex items-center gap-2 text-gray-500 hover:text-amber-600 transition-colors"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span>Back to Website</span>
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Floating Elements */}
      <div className="hidden lg:block">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-10 right-1/4"
        >
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-3 h-3 bg-amber-400 rounded-full"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="absolute bottom-20 right-1/3"
        >
          <motion.div
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-2 h-2 bg-rose-400 rounded-full"
          />
        </motion.div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Package,
  Images,
  Mail,
  Settings,
  Factory,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  Loader2,
  LogOut,
  Palette,
  ShoppingCart,
  FileText,
  Users,
  Factory as FactoryIcon,
  Box,
  BarChart3,
  Bell,
  Search,
  TrendingUp,
  Calendar,
  Database,
  ChevronDown,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Settings {
  companyName: string
  companyLogo: string | null
}

interface Notification {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
}

interface NavItem {
  name: string
  href?: string
  icon: React.ElementType
  children?: { name: string; href: string }[]
  badge?: number
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [settings, setSettings] = useState<Settings | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])
  const notificationRef = useRef<HTMLDivElement>(null)

  const navItems: NavItem[] = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { 
      name: 'Raw Materials', 
      icon: Package,
      children: [
        { name: 'All Materials', href: '/admin/raw-materials' },
        { name: 'Add Material', href: '/admin/raw-materials/new' },
        { name: 'Categories', href: '/admin/raw-materials/categories' },
        { name: 'Suppliers', href: '/admin/raw-materials/suppliers' },
      ]
    },
    { 
      name: 'Production', 
      icon: FactoryIcon,
      children: [
        { name: 'All Entries', href: '/admin/production' },
        { name: 'New Production', href: '/admin/production/new' },
        { name: 'Calendar', href: '/admin/production/calendar' },
      ]
    },
    { name: 'Finished Goods', href: '/admin/finished-goods', icon: Box },
    { 
      name: 'Orders', 
      icon: ShoppingCart,
      children: [
        { name: 'All Orders', href: '/admin/orders' },
        { name: 'Create Order', href: '/admin/orders/new' },
      ]
    },
    { 
      name: 'Quotes', 
      icon: FileText,
      children: [
        { name: 'All Quotes', href: '/admin/quotes' },
        { name: 'Create Quote', href: '/admin/quotes/new' },
        { name: 'Templates', href: '/admin/quotes/templates' },
      ]
    },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Gallery', href: '/admin/gallery', icon: Images },
    { name: 'Enquiries', href: '/admin/enquiries', icon: Mail },
    { name: 'Custom Orders', href: '/admin/custom-orders', icon: Palette },
    { 
      name: 'Customers', 
      icon: Users,
      children: [
        { name: 'All Customers', href: '/admin/customers' },
        { name: 'Follow-ups', href: '/admin/customers/follow-ups' },
      ]
    },
    { 
      name: 'Invoices', 
      icon: FileText,
      children: [
        { name: 'All Invoices', href: '/admin/invoices' },
        { name: 'Create Invoice', href: '/admin/invoices?new=true' },
      ]
    },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ]

  useEffect(() => {
    if (pathname === '/admin/login') return
    
    // Get token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
    
    // Check auth with token in header
    fetch('/api/admin/auth', {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        if (!data.authenticated) {
          router.push('/admin/login')
        } else {
          setIsAuthenticated(true)
        }
      })
      .catch(() => {
        router.push('/admin/login')
      })

    fetch('/api/settings')
      .then(res => res.json())
      .then(setSettings)
      .catch(console.error)

    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setNotifications(data)
      })
      .catch(() => {})

    // Close notifications on outside click
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [pathname, router])

  const handleLogout = async () => {
    const token = localStorage.getItem('admin_token')
    await fetch('/api/admin/auth', { 
      method: 'DELETE',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
    localStorage.removeItem('admin_token')
    router.push('/admin/login')
  }

  const toggleMenu = (name: string) => {
    setExpandedMenus(prev => 
      prev.includes(name) 
        ? prev.filter(m => m !== name)
        : [...prev, name]
    )
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  if (isAuthenticated === null && pathname !== '/admin/login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="w-10 h-10 text-amber-500" />
        </motion.div>
      </div>
    )
  }

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const isActive = (item: NavItem) => {
    if (item.href === pathname) return true
    if (item.children) {
      return item.children.some(child => pathname === child.href || pathname.startsWith(child.href + '/'))
    }
    return false
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 transform transition-transform duration-300 lg:translate-x-0 flex flex-col",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-700/50">
          <Link href="/admin" className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: -5 }}
              className="h-12 w-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20"
            >
              <Factory className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <span className="text-white font-bold text-lg block leading-tight">
                {settings?.companyName || 'Madhav World'}
              </span>
              <span className="text-gray-400 text-xs flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Admin Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin">
          {navItems.map((item) => {
            const active = isActive(item)
            const expanded = expandedMenus.includes(item.name)
            
            return (
              <div key={item.name}>
                {item.children ? (
                  <>
                    <button
                      onClick={() => toggleMenu(item.name)}
                      className={cn(
                        "w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                        active 
                          ? "bg-amber-500/20 text-amber-400" 
                          : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5" />
                        {item.name}
                      </div>
                      <motion.div
                        animate={{ rotate: expanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </motion.div>
                    </button>
                    <AnimatePresence>
                      {expanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="ml-4 mt-1 space-y-1 overflow-hidden"
                        >
                          {item.children.map((child) => (
                            <Link
                              key={child.name}
                              href={child.href}
                              onClick={() => setSidebarOpen(false)}
                              className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all",
                                pathname === child.href || pathname.startsWith(child.href + '/')
                                  ? "bg-amber-500/20 text-amber-400"
                                  : "text-gray-400 hover:text-white hover:bg-gray-700/30"
                              )}
                            >
                              <ChevronRight className="w-3 h-3" />
                              {child.name}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link
                    href={item.href!}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                      active 
                        ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30" 
                        : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                    {item.badge && (
                      <Badge className="ml-auto bg-rose-500 text-white text-xs">
                        {item.badge}
                      </Badge>
                    )}
                    {active && (
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    )}
                  </Link>
                )}
              </div>
            )
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-700/50 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all text-sm"
          >
            <ExternalLink className="w-5 h-5" />
            View Website
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-all text-sm"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </Button>
              
              {/* Search */}
              <div className="hidden md:block relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search products, orders, customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-80 bg-gray-50 border-gray-200 focus:bg-white"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Mobile Search Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setShowSearch(!showSearch)}
              >
                <Search className="w-5 h-5" />
              </Button>
              
              {/* Notifications */}
              <div ref={notificationRef} className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
                    >
                      {unreadCount}
                    </motion.span>
                  )}
                </Button>
                
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                          <Badge className="bg-rose-100 text-rose-600">{unreadCount} new</Badge>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.slice(0, 5).map((notification) => (
                            <div
                              key={notification.id}
                              className={cn(
                                "p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer",
                                !notification.isRead && "bg-amber-50/50"
                              )}
                            >
                              <p className="font-medium text-sm text-gray-900">{notification.title}</p>
                              <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center text-gray-400">
                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No notifications</p>
                          </div>
                        )}
                      </div>
                      <Link
                        href="/admin/notifications"
                        className="block p-3 text-center text-sm text-amber-600 hover:bg-amber-50 transition-colors font-medium"
                      >
                        View All Notifications
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* User */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900">Admin</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <div className="h-10 w-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile Search Bar */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="md:hidden px-4 pb-4 overflow-hidden"
              >
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}

'use client'

import Header from './Header'
import Footer from './Footer'

interface WebsiteLayoutProps {
  children: React.ReactNode
}

export default function WebsiteLayout({ children }: WebsiteLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 pt-20">
        {children}
      </main>
      <Footer />
    </div>
  )
}

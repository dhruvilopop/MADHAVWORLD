import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get counts from database
    const products = await db.product.count()
    const gallery = await db.galleryImage.count()
    const enquiries = await db.enquiry.count()
    const newEnquiries = await db.enquiry.count({ where: { status: 'new' } })
    const customers = await db.customer.count()
    const customInquiries = await db.customInquiry.count()
    
    // Calculate total revenue from orders (if any)
    const orders = await db.order.findMany({
      select: { total: true }
    })
    const revenue = orders.reduce((sum, order) => sum + (order.total || 0), 0)
    
    // Count pending orders
    const pendingOrders = await db.order.count({
      where: { status: 'pending' }
    })
    
    // Count low stock products
    const allProducts = await db.product.findMany({
      select: { stock: true, lowStockAlert: true }
    })
    const lowStock = allProducts.filter(p => p.stock <= p.lowStockAlert).length
    
    // Count quotes
    const quotes = await db.quote.count()

    return NextResponse.json({
      products,
      gallery,
      enquiries,
      newEnquiries,
      orders: orders.length,
      pendingOrders,
      customers,
      revenue,
      quotes,
      lowStock,
      customInquiries,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({
      products: 0,
      gallery: 0,
      enquiries: 0,
      newEnquiries: 0,
      orders: 0,
      pendingOrders: 0,
      customers: 0,
      revenue: 0,
      quotes: 0,
      lowStock: 0,
      customInquiries: 0,
    })
  }
}

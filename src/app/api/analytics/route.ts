import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomUUID } from 'crypto'

// GET - Fetch analytics data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // days

    const daysAgo = new Date()
    daysAgo.setDate(daysAgo.getDate() - parseInt(period))

    // Get various analytics
    const [
      totalOrders,
      totalRevenue,
      totalProducts,
      totalCustomers,
      totalEnquiries,
      recentOrders,
      topProducts,
      ordersByDay
    ] = await Promise.all([
      // Total orders in period
      db.order.count({
        where: { createdAt: { gte: daysAgo } }
      }),
      
      // Total revenue in period
      db.order.aggregate({
        where: { 
          createdAt: { gte: daysAgo },
          status: { not: 'cancelled' }
        },
        _sum: { total: true }
      }),
      
      // Total products
      db.product.count({ where: { isActive: true } }),
      
      // Total customers
      db.customer.count(),
      
      // Total enquiries
      db.enquiry.count({
        where: { createdAt: { gte: daysAgo } }
      }),
      
      // Recent orders
      db.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          total: true,
          status: true,
          createdAt: true
        }
      }),

      // Top products by order items
      db.orderItem.groupBy({
        by: ['productId', 'productName'],
        _count: { id: true },
        _sum: { total: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5
      }),

      // Orders by day (last 7 days)
      db.$queryRaw<Array<{ date: string; count: number; total: number }>>`
        SELECT 
          date(createdAt) as date,
          COUNT(*) as count,
          SUM(total) as total
        FROM \`Order\`
        WHERE createdAt >= datetime('now', '-7 days')
        GROUP BY date(createdAt)
        ORDER BY date DESC
      `
    ])

    // Get product views
    const productViews = await db.analyticsEvent.count({
      where: {
        eventType: 'product_view',
        createdAt: { gte: daysAgo }
      }
    })

    return NextResponse.json({
      summary: {
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        totalProducts,
        totalCustomers,
        totalEnquiries,
        productViews
      },
      recentOrders,
      topProducts: topProducts.map(p => ({
        name: p.productName,
        orders: p._count.id,
        revenue: p._sum.total || 0
      })),
      ordersByDay,
      period
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}

// POST - Track analytics event
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const event = await db.analyticsEvent.create({
      data: {
        id: randomUUID(),
        eventType: data.eventType,
        entityType: data.entityType || null,
        entityId: data.entityId || null,
        data: data.data ? JSON.stringify(data.data) : null,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
        createdAt: new Date()
      }
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Error tracking event:', error)
    return NextResponse.json({ error: 'Failed to track event' }, { status: 500 })
  }
}

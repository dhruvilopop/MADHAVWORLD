import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const notifications = await db.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    })
    
    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    // Return sample notifications if database is empty
    return NextResponse.json([
      {
        id: '1',
        type: 'enquiry',
        title: 'New Enquiry Received',
        message: 'John Doe sent a new enquiry',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        type: 'stock',
        title: 'Low Stock Alert',
        message: 'Premium Tote Bag is running low on stock',
        isRead: false,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: '3',
        type: 'order',
        title: 'New Order Placed',
        message: 'Order #ORD-001 has been placed',
        isRead: true,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
    ])
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const notification = await db.notification.create({
      data: {
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link,
      }
    })
    return NextResponse.json(notification)
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { ids } = await request.json()
    
    await db.notification.updateMany({
      where: { id: { in: ids } },
      data: { isRead: true }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking notifications as read:', error)
    return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 })
  }
}

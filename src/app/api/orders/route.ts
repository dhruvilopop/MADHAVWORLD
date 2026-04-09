import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomUUID } from 'crypto'

// GET all orders
export async function GET() {
  try {
    const orders = await db.order.findMany({
      include: {
        OrderItem: true,
        Customer: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json([])
  }
}

// POST create new order
export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    const orderId = randomUUID()
    const orderNumber = `ORD-${String(Date.now()).slice(-6)}`
    
    const order = await db.order.create({
      data: {
        id: orderId,
        orderNumber,
        customerName: data.customerName,
        customerEmail: data.customerEmail || null,
        customerPhone: data.customerPhone,
        customerAddress: data.customerAddress || null,
        subtotal: data.subtotal || 0,
        tax: data.tax || 0,
        discount: data.discount || 0,
        total: data.total,
        status: 'pending',
        paymentStatus: 'unpaid',
        notes: data.notes || null,
        expectedDate: data.expectedDate ? new Date(data.expectedDate) : null,
        customerId: data.customerId || null,
        updatedAt: new Date(),
      }
    })

    // Create notification
    await db.notification.create({
      data: {
        id: randomUUID(),
        type: 'order',
        title: 'New Order Created',
        message: `Order ${orderNumber} has been created`,
        link: `/admin/orders`,
      }
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomUUID } from 'crypto'

// GET all customers
export async function GET() {
  try {
    const customers = await db.customer.findMany({
      include: {
        _count: {
          select: { Order: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    })
    
    const formattedCustomers = customers.map(customer => ({
      ...customer,
      totalOrders: customer._count.Order,
    }))
    
    return NextResponse.json(formattedCustomers)
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json([])
  }
}

// POST create new customer
export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    const customer = await db.customer.create({
      data: {
        id: randomUUID(),
        name: data.name,
        email: data.email || null,
        phone: data.phone,
        address: data.address || null,
        company: data.company || null,
        gstNumber: data.gstNumber || null,
        group: data.group || 'retail',
        notes: data.notes || null,
        updatedAt: new Date(),
      }
    })

    return NextResponse.json(customer)
  } catch (error) {
    console.error('Error creating customer:', error)
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 })
  }
}

// PUT update customer (support both PUT and PATCH)
export async function PUT(request: Request) {
  try {
    const data = await request.json()
    
    const customer = await db.customer.update({
      where: { id: data.id },
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone,
        address: data.address || null,
        company: data.company || null,
        gstNumber: data.gstNumber || null,
        group: data.group,
        notes: data.notes || null,
        updatedAt: new Date(),
      }
    })

    return NextResponse.json(customer)
  } catch (error) {
    console.error('Error updating customer:', error)
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 })
  }
}

// PATCH update customer
export async function PATCH(request: Request) {
  try {
    const data = await request.json()
    
    const customer = await db.customer.update({
      where: { id: data.id },
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone,
        address: data.address || null,
        company: data.company || null,
        gstNumber: data.gstNumber || null,
        group: data.group,
        notes: data.notes || null,
        updatedAt: new Date(),
      }
    })

    return NextResponse.json(customer)
  } catch (error) {
    console.error('Error updating customer:', error)
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 })
  }
}

// DELETE customer
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Customer ID required' }, { status: 400 })
    }

    await db.customer.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting customer:', error)
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 })
  }
}

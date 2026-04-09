import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomUUID } from 'crypto'

// GET - Get all production orders
export async function GET() {
  try {
    const productions = await db.production.findMany({
      include: {
        Order: {
          select: {
            orderNumber: true,
            customerName: true,
            total: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(productions.map(p => ({
      id: p.id,
      orderNumber: p.Order?.orderNumber || 'N/A',
      customerName: p.Order?.customerName || 'N/A',
      stage: p.stage,
      progress: p.progress,
      assignedTo: p.assignedTo,
      startDate: p.startDate,
      estimatedCompletion: p.estimatedCompletion,
      notes: p.notes,
      total: p.Order?.total || 0,
      createdAt: p.createdAt
    })))
  } catch {
    return NextResponse.json([])
  }
}

// POST - Create production order
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const production = await db.production.create({
      data: {
        id: randomUUID(),
        orderId: data.orderId,
        stage: data.stage || 'pending',
        progress: data.progress || 0,
        assignedTo: data.assignedTo || null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        estimatedCompletion: data.estimatedCompletion ? new Date(data.estimatedCompletion) : null,
        notes: data.notes || null,
        updatedAt: new Date()
      }
    })
    
    return NextResponse.json(production)
  } catch {
    return NextResponse.json({ error: 'Failed to create production order' }, { status: 500 })
  }
}

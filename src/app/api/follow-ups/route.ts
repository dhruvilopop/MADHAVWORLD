import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomUUID } from 'crypto'

// GET - Get all follow-ups
export async function GET() {
  try {
    const followUps = await db.followUp.findMany({
      include: {
        Customer: {
          select: { name: true }
        }
      },
      orderBy: { dueDate: 'asc' }
    })
    
    return NextResponse.json(followUps.map(f => ({
      id: f.id,
      customerId: f.customerId,
      customerName: f.Customer?.name || 'Unknown',
      type: f.type,
      title: f.title,
      description: f.description,
      dueDate: f.dueDate,
      status: f.status,
      completedAt: f.completedAt,
      createdAt: f.createdAt
    })))
  } catch {
    return NextResponse.json([])
  }
}

// POST - Create follow-up
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const followUp = await db.followUp.create({
      data: {
        id: randomUUID(),
        customerId: data.customerId || 'guest',
        type: data.type || 'call',
        title: data.title,
        description: data.description || null,
        dueDate: new Date(data.dueDate),
        status: 'pending',
        updatedAt: new Date()
      }
    })
    
    return NextResponse.json({
      id: followUp.id,
      customerId: followUp.customerId,
      customerName: data.customerName || 'Unknown',
      type: followUp.type,
      title: followUp.title,
      description: followUp.description,
      dueDate: followUp.dueDate,
      status: followUp.status,
      completedAt: followUp.completedAt,
      createdAt: followUp.createdAt
    })
  } catch {
    return NextResponse.json({ error: 'Failed to create follow-up' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch single follow-up
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const followUp = await db.followUp.findUnique({
      where: { id },
      include: {
        Customer: {
          select: { name: true }
        }
      }
    })
    
    if (!followUp) {
      return NextResponse.json({ error: 'Follow-up not found' }, { status: 404 })
    }
    
    return NextResponse.json({
      id: followUp.id,
      customerId: followUp.customerId,
      customerName: followUp.Customer?.name || 'Unknown',
      type: followUp.type,
      title: followUp.title,
      description: followUp.description,
      dueDate: followUp.dueDate,
      status: followUp.status,
      completedAt: followUp.completedAt,
      createdAt: followUp.createdAt
    })
  } catch (error) {
    console.error('Error fetching follow-up:', error)
    return NextResponse.json({ error: 'Failed to fetch follow-up' }, { status: 500 })
  }
}

// PUT - Update follow-up
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()
    
    const followUp = await db.followUp.update({
      where: { id },
      data: {
        type: data.type,
        title: data.title,
        description: data.description,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        status: data.status,
        completedAt: data.completedAt ? new Date(data.completedAt) : null,
        updatedAt: new Date(),
      }
    })
    
    return NextResponse.json(followUp)
  } catch (error) {
    console.error('Error updating follow-up:', error)
    return NextResponse.json({ error: 'Failed to update follow-up' }, { status: 500 })
  }
}

// PATCH - Partial update follow-up
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()
    
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    }
    
    if (data.type !== undefined) updateData.type = data.type
    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.dueDate !== undefined) updateData.dueDate = new Date(data.dueDate)
    if (data.status !== undefined) updateData.status = data.status
    if (data.completedAt !== undefined) updateData.completedAt = data.completedAt ? new Date(data.completedAt) : null
    
    const followUp = await db.followUp.update({
      where: { id },
      data: updateData
    })
    
    return NextResponse.json(followUp)
  } catch (error) {
    console.error('Error updating follow-up:', error)
    return NextResponse.json({ error: 'Failed to update follow-up' }, { status: 500 })
  }
}

// DELETE - Delete follow-up
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    await db.followUp.delete({ where: { id } })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting follow-up:', error)
    return NextResponse.json({ error: 'Failed to delete follow-up' }, { status: 500 })
  }
}

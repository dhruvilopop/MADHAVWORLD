import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch single production order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const production = await db.production.findUnique({
      where: { id },
      include: {
        Order: {
          select: {
            orderNumber: true,
            customerName: true,
            total: true
          }
        },
        ProductionStageNote: true
      }
    })
    
    if (!production) {
      return NextResponse.json({ error: 'Production order not found' }, { status: 404 })
    }
    
    return NextResponse.json({
      id: production.id,
      orderId: production.orderId,
      orderNumber: production.Order?.orderNumber || 'N/A',
      customerName: production.Order?.customerName || 'N/A',
      stage: production.stage,
      progress: production.progress,
      assignedTo: production.assignedTo,
      startDate: production.startDate,
      estimatedCompletion: production.estimatedCompletion,
      actualCompletion: production.actualCompletion,
      notes: production.notes,
      total: production.Order?.total || 0,
      createdAt: production.createdAt,
      stageNotes: production.ProductionStageNote
    })
  } catch (error) {
    console.error('Error fetching production:', error)
    return NextResponse.json({ error: 'Failed to fetch production' }, { status: 500 })
  }
}

// PUT - Update production order
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()
    
    const production = await db.production.update({
      where: { id },
      data: {
        stage: data.stage,
        progress: data.progress,
        assignedTo: data.assignedTo,
        startDate: data.startDate ? new Date(data.startDate) : null,
        estimatedCompletion: data.estimatedCompletion ? new Date(data.estimatedCompletion) : null,
        actualCompletion: data.actualCompletion ? new Date(data.actualCompletion) : null,
        notes: data.notes,
        updatedAt: new Date(),
      }
    })
    
    return NextResponse.json(production)
  } catch (error) {
    console.error('Error updating production:', error)
    return NextResponse.json({ error: 'Failed to update production' }, { status: 500 })
  }
}

// PATCH - Partial update production order
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
    
    if (data.stage !== undefined) {
      updateData.stage = data.stage
      // Update progress based on stage
      const stageProgress: Record<string, number> = {
        pending: 0,
        design: 10,
        material_prep: 20,
        cutting: 35,
        stitching: 55,
        finishing: 75,
        quality_check: 90,
        ready_to_ship: 100
      }
      updateData.progress = stageProgress[data.stage] || 0
    }
    if (data.progress !== undefined) updateData.progress = data.progress
    if (data.assignedTo !== undefined) updateData.assignedTo = data.assignedTo
    if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null
    if (data.estimatedCompletion !== undefined) updateData.estimatedCompletion = data.estimatedCompletion ? new Date(data.estimatedCompletion) : null
    if (data.actualCompletion !== undefined) updateData.actualCompletion = data.actualCompletion ? new Date(data.actualCompletion) : null
    if (data.notes !== undefined) updateData.notes = data.notes
    
    const production = await db.production.update({
      where: { id },
      data: updateData
    })
    
    return NextResponse.json(production)
  } catch (error) {
    console.error('Error updating production:', error)
    return NextResponse.json({ error: 'Failed to update production' }, { status: 500 })
  }
}

// DELETE - Delete production order
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // First delete stage notes
    await db.productionStageNote.deleteMany({
      where: { productionId: id }
    })
    
    await db.production.delete({ where: { id } })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting production:', error)
    return NextResponse.json({ error: 'Failed to delete production' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET single production entry
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const production = await db.productionEntry.findUnique({
      where: { id },
      include: {
        rawMaterials: {
          include: {
            rawMaterial: {
              include: {
                category: true
              }
            }
          }
        },
        qualityChecks: true
      }
    })
    
    if (!production) {
      return NextResponse.json({ error: 'Production not found' }, { status: 404 })
    }
    
    return NextResponse.json(production)
  } catch (error) {
    console.error('Error fetching production:', error)
    return NextResponse.json({ error: 'Failed to fetch production' }, { status: 500 })
  }
}

// PUT update production entry
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()
    
    const production = await db.productionEntry.update({
      where: { id },
      data: {
        status: data.status,
        completionPercent: parseInt(data.completionPercent) || 0,
        quantityProduced: parseInt(data.quantityProduced) || 0,
        quantityRejected: parseInt(data.quantityRejected) || 0,
        quantityPassed: (parseInt(data.quantityProduced) || 0) - (parseInt(data.quantityRejected) || 0),
        qualityStatus: data.qualityStatus,
        qualityNotes: data.qualityNotes,
        inspectedBy: data.inspectedBy,
        inspectedAt: data.inspectedAt ? new Date(data.inspectedAt) : null,
        notes: data.notes,
        updatedAt: new Date()
      }
    })
    
    return NextResponse.json(production)
  } catch (error) {
    console.error('Error updating production:', error)
    return NextResponse.json({ error: 'Failed to update production' }, { status: 500 })
  }
}

// DELETE production entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Get production to restore stock
    const production = await db.productionEntry.findUnique({
      where: { id },
      include: { rawMaterials: true }
    })
    
    if (production) {
      // Restore raw material stock
      for (const item of production.rawMaterials) {
        if (item.rawMaterialId) {
          const material = await db.rawMaterial.findUnique({
            where: { id: item.rawMaterialId }
          })
          
          if (material) {
            await db.rawMaterial.update({
              where: { id: item.rawMaterialId },
              data: {
                currentStock: material.currentStock + item.quantityUsed
              }
            })
          }
        }
      }
    }
    
    await db.productionEntry.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting production:', error)
    return NextResponse.json({ error: 'Failed to delete production' }, { status: 500 })
  }
}

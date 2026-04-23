import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { nanoid } from 'nanoid'

// GET all stock movements
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const materialId = searchParams.get('materialId')
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '100')
    
    const where: any = {}
    
    if (materialId) {
      where.rawMaterialId = materialId
    }
    
    if (type) {
      where.type = type
    }
    
    const movements = await db.rawMaterialStockMovement.findMany({
      where,
      include: {
        rawMaterial: {
          include: {
            category: true
          }
        }
      },
      take: limit,
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(movements)
  } catch (error) {
    console.error('Error fetching movements:', error)
    return NextResponse.json({ error: 'Failed to fetch movements' }, { status: 500 })
  }
}

// POST create stock movement (add/remove stock)
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Get current material
    const material = await db.rawMaterial.findUnique({
      where: { id: data.rawMaterialId }
    })
    
    if (!material) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 })
    }
    
    const quantity = parseFloat(data.quantity)
    const previousStock = material.currentStock
    
    let newStock: number
    if (data.type === 'IN') {
      newStock = previousStock + quantity
    } else if (data.type === 'OUT' || data.type === 'PRODUCTION' || data.type === 'WASTE') {
      newStock = Math.max(0, previousStock - quantity)
    } else {
      // ADJUSTMENT - newStock is provided directly
      newStock = data.newStock ?? previousStock
    }
    
    // Create movement record
    const movement = await db.rawMaterialStockMovement.create({
      data: {
        id: nanoid(),
        rawMaterialId: data.rawMaterialId,
        type: data.type,
        quantity: data.type === 'ADJUSTMENT' ? newStock - previousStock : quantity,
        previousStock,
        newStock,
        reason: data.reason || null,
        reference: data.reference || null,
        unitCost: material.unitCost,
        totalCost: Math.abs(data.type === 'ADJUSTMENT' ? newStock - previousStock : quantity) * material.unitCost,
        notes: data.notes || null,
      }
    })
    
    // Update material stock
    await db.rawMaterial.update({
      where: { id: data.rawMaterialId },
      data: {
        currentStock: newStock,
        lastRestocked: data.type === 'IN' ? new Date() : material.lastRestocked,
      }
    })
    
    return NextResponse.json(movement)
  } catch (error) {
    console.error('Error creating movement:', error)
    return NextResponse.json({ error: 'Failed to create movement' }, { status: 500 })
  }
}

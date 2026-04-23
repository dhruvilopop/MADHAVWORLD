import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET single finished good
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const good = await db.finishedGood.findUnique({
      where: { id },
      include: {
        stockMovements: {
          take: 50,
          orderBy: { createdAt: 'desc' }
        }
      }
    })
    
    if (!good) {
      return NextResponse.json({ error: 'Finished good not found' }, { status: 404 })
    }
    
    return NextResponse.json(good)
  } catch (error) {
    console.error('Error fetching finished good:', error)
    return NextResponse.json({ error: 'Failed to fetch finished good' }, { status: 500 })
  }
}

// PUT update finished good
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()
    
    const quantityInStock = parseInt(data.quantityInStock) || 0
    const reservedQuantity = parseInt(data.reservedQuantity) || 0
    
    const good = await db.finishedGood.update({
      where: { id },
      data: {
        name: data.name,
        size: data.size || null,
        width: data.width ? parseFloat(data.width) : null,
        height: data.height ? parseFloat(data.height) : null,
        depth: data.depth ? parseFloat(data.depth) : null,
        gsm: data.gsm ? parseFloat(data.gsm) : null,
        color: data.color || null,
        material: data.material || null,
        weight: data.weight ? parseFloat(data.weight) : null,
        quantityInStock,
        reservedQuantity,
        availableQuantity: quantityInStock - reservedQuantity,
        costPrice: parseFloat(data.costPrice) || 0,
        sellingPrice: parseFloat(data.sellingPrice) || 0,
        mrp: data.mrp ? parseFloat(data.mrp) : null,
        wholesalePrice: data.wholesalePrice ? parseFloat(data.wholesalePrice) : null,
        bagsPerKg: data.bagsPerKg ? parseFloat(data.bagsPerKg) : null,
        productionTime: data.productionTime ? parseFloat(data.productionTime) : null,
        images: data.images || null,
        thumbnail: data.thumbnail || null,
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
        description: data.description || null,
      }
    })
    
    return NextResponse.json(good)
  } catch (error) {
    console.error('Error updating finished good:', error)
    return NextResponse.json({ error: 'Failed to update finished good' }, { status: 500 })
  }
}

// DELETE finished good
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    await db.finishedGood.update({
      where: { id },
      data: { isActive: false }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting finished good:', error)
    return NextResponse.json({ error: 'Failed to delete finished good' }, { status: 500 })
  }
}

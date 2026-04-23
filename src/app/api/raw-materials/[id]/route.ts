import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET single raw material
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const material = await db.rawMaterial.findUnique({
      where: { id },
      include: {
        category: true,
        supplier: true,
        stockMovements: {
          take: 50,
          orderBy: { createdAt: 'desc' }
        }
      }
    })
    
    if (!material) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 })
    }
    
    return NextResponse.json(material)
  } catch (error) {
    console.error('Error fetching raw material:', error)
    return NextResponse.json({ error: 'Failed to fetch raw material' }, { status: 500 })
  }
}

// PUT update raw material
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()
    
    const material = await db.rawMaterial.update({
      where: { id },
      data: {
        name: data.name,
        categoryId: data.categoryId || null,
        size: data.size ? parseFloat(data.size) : null,
        width: data.width ? parseFloat(data.width) : null,
        gsm: data.gsm ? parseFloat(data.gsm) : null,
        weightPerBag: data.weightPerBag ? parseFloat(data.weightPerBag) : null,
        bagsPerKg: data.bagsPerKg ? parseFloat(data.bagsPerKg) : null,
        thickness: data.thickness ? parseFloat(data.thickness) : null,
        unit: data.unit,
        minStockLevel: parseFloat(data.minStockLevel) || 0,
        maxStockLevel: data.maxStockLevel ? parseFloat(data.maxStockLevel) : null,
        reorderPoint: data.reorderPoint ? parseFloat(data.reorderPoint) : null,
        reorderQuantity: data.reorderQuantity ? parseFloat(data.reorderQuantity) : null,
        unitCost: parseFloat(data.unitCost) || 0,
        lastPurchaseCost: data.lastPurchaseCost ? parseFloat(data.lastPurchaseCost) : null,
        supplierId: data.supplierId || null,
        warehouseLocation: data.warehouseLocation || null,
        batchNumber: data.batchNumber || null,
        barcode: data.barcode || null,
        qrCode: data.qrCode || null,
        image: data.image || null,
        description: data.description || null,
        isActive: data.isActive ?? true,
      },
      include: {
        category: true,
        supplier: true,
      }
    })
    
    return NextResponse.json(material)
  } catch (error) {
    console.error('Error updating raw material:', error)
    return NextResponse.json({ error: 'Failed to update raw material' }, { status: 500 })
  }
}

// DELETE raw material
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Soft delete by setting isActive to false
    await db.rawMaterial.update({
      where: { id },
      data: { isActive: false }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting raw material:', error)
    return NextResponse.json({ error: 'Failed to delete raw material' }, { status: 500 })
  }
}

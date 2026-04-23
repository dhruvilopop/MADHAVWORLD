import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { nanoid } from 'nanoid'

// GET all raw materials
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const supplier = searchParams.get('supplier')
    const lowStock = searchParams.get('lowStock')
    
    const where: any = { isActive: true }
    
    if (category) {
      where.categoryId = category
    }
    
    if (supplier) {
      where.supplierId = supplier
    }
    
    const materials = await db.rawMaterial.findMany({
      where,
      include: {
        category: true,
        supplier: true,
      },
      orderBy: { createdAt: 'desc' }
    })
    
    // Filter low stock if requested
    let result = materials
    if (lowStock === 'true') {
      result = materials.filter(m => m.currentStock < m.minStockLevel)
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching raw materials:', error)
    return NextResponse.json({ error: 'Failed to fetch raw materials' }, { status: 500 })
  }
}

// POST create new raw material
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const material = await db.rawMaterial.create({
      data: {
        id: nanoid(),
        name: data.name,
        categoryId: data.categoryId || null,
        size: data.size ? parseFloat(data.size) : null,
        width: data.width ? parseFloat(data.width) : null,
        gsm: data.gsm ? parseFloat(data.gsm) : null,
        weightPerBag: data.weightPerBag ? parseFloat(data.weightPerBag) : null,
        bagsPerKg: data.bagsPerKg ? parseFloat(data.bagsPerKg) : null,
        thickness: data.thickness ? parseFloat(data.thickness) : null,
        unit: data.unit || 'kg',
        currentStock: parseFloat(data.currentStock) || 0,
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
    
    // Create initial stock movement if stock > 0
    if (material.currentStock > 0) {
      await db.rawMaterialStockMovement.create({
        data: {
          id: nanoid(),
          rawMaterialId: material.id,
          type: 'IN',
          quantity: material.currentStock,
          previousStock: 0,
          newStock: material.currentStock,
          reason: 'Initial stock',
          unitCost: material.unitCost,
          totalCost: material.currentStock * material.unitCost,
        }
      })
    }
    
    return NextResponse.json(material)
  } catch (error) {
    console.error('Error creating raw material:', error)
    return NextResponse.json({ error: 'Failed to create raw material' }, { status: 500 })
  }
}

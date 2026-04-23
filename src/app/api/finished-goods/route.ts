import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { nanoid } from 'nanoid'

// GET all finished goods
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lowStock = searchParams.get('lowStock')
    
    const goods = await db.finishedGood.findMany({
      where: { isActive: true },
      include: {
        stockMovements: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    let result = goods
    if (lowStock === 'true') {
      result = goods.filter(g => g.quantityInStock < 10) // Less than 10 items
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching finished goods:', error)
    return NextResponse.json({ error: 'Failed to fetch finished goods' }, { status: 500 })
  }
}

// POST create new finished good
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const sku = data.sku || `FG-${Date.now().toString(36).toUpperCase()}`
    const slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    
    const good = await db.finishedGood.create({
      data: {
        id: nanoid(),
        sku,
        name: data.name,
        slug: `${slug}-${Date.now().toString(36)}`,
        categoryId: data.categoryId || null,
        size: data.size || null,
        width: data.width ? parseFloat(data.width) : null,
        height: data.height ? parseFloat(data.height) : null,
        depth: data.depth ? parseFloat(data.depth) : null,
        gsm: data.gsm ? parseFloat(data.gsm) : null,
        color: data.color || null,
        material: data.material || null,
        weight: data.weight ? parseFloat(data.weight) : null,
        quantityInStock: parseInt(data.quantityInStock) || 0,
        reservedQuantity: parseInt(data.reservedQuantity) || 0,
        availableQuantity: (parseInt(data.quantityInStock) || 0) - (parseInt(data.reservedQuantity) || 0),
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
        barcode: data.barcode || null,
        description: data.description || null,
      }
    })
    
    // Create initial stock movement if stock > 0
    if (good.quantityInStock > 0) {
      await db.finishedGoodStockMovement.create({
        data: {
          id: nanoid(),
          finishedGoodId: good.id,
          type: 'IN',
          quantity: good.quantityInStock,
          previousStock: 0,
          newStock: good.quantityInStock,
          reason: 'Initial stock',
        }
      })
    }
    
    return NextResponse.json(good)
  } catch (error) {
    console.error('Error creating finished good:', error)
    return NextResponse.json({ error: 'Failed to create finished good' }, { status: 500 })
  }
}

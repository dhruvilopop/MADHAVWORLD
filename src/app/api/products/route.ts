import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomUUID } from 'crypto'

// GET - Fetch all products or filter by category
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const limit = searchParams.get('limit')
    const all = searchParams.get('all')
    
    // If 'all' param is true, fetch all products including inactive (for admin)
    const where: Record<string, unknown> = all === 'true' ? {} : { isActive: true }
    
    if (category) {
      where.Category = { slug: category }
    }
    
    if (featured === 'true') {
      where.isFeatured = true
    }
    
    const products = await db.product.findMany({
      where,
      include: { Category: true },
      orderBy: { createdAt: 'desc' },
      ...(limit ? { take: parseInt(limit) } : {})
    })
    
    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Generate slug from name
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    
    const product = await db.product.create({
      data: {
        id: randomUUID(),
        name: data.name,
        slug: slug + '-' + Date.now().toString(36),
        description: data.description || '',
        price: data.price ? parseFloat(data.price) : null,
        image: data.image || '',
        images: data.images || null,
        material: data.material || null,
        bagStyle: data.bagStyle || null,
        gsm: data.gsm || null,
        bagSize: data.bagSize || null,
        handleType: data.handleType || null,
        bagColor: data.bagColor || null,
        printType: data.printType || null,
        capacity: data.capacity || null,
        usageApplication: data.usageApplication || null,
        usage: data.usage || null,
        bagShape: data.bagShape || null,
        sideGusset: data.sideGusset || null,
        finishing: data.finishing || null,
        productPattern: data.productPattern || null,
        productColor: data.productColor || null,
        productMaterial: data.productMaterial || null,
        minOrderQuantity: data.minOrderQuantity || 1000,
        productionCapacity: data.productionCapacity || null,
        deliveryTime: data.deliveryTime || null,
        packagingDetails: data.packagingDetails || null,
        categoryId: data.categoryId || null,
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
        updatedAt: new Date(),
      }
    })
    
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

// PUT - Update product
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, ...updateData } = data
    
    const product = await db.product.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      }
    })
    
    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

// DELETE - Delete product
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }
    
    await db.product.delete({ where: { id } })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}

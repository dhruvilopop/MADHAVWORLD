import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomUUID } from 'crypto'

// GET - Fetch product variants
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    const where: Record<string, unknown> = {}
    if (productId) {
      where.productId = productId
    }

    const variants = await db.productVariant.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(variants)
  } catch (error) {
    console.error('Error fetching variants:', error)
    return NextResponse.json({ error: 'Failed to fetch variants' }, { status: 500 })
  }
}

// POST - Create product variant
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const variant = await db.productVariant.create({
      data: {
        id: randomUUID(),
        productId: data.productId,
        name: data.name,
        sku: data.sku || null,
        price: data.price || null,
        stock: data.stock || 0,
        attributes: JSON.stringify(data.attributes || {}),
        image: data.image || null,
        isActive: data.isActive ?? true,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(variant, { status: 201 })
  } catch (error) {
    console.error('Error creating variant:', error)
    return NextResponse.json({ error: 'Failed to create variant' }, { status: 500 })
  }
}

// PUT - Update product variant
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, ...updateData } = data

    if (updateData.attributes && typeof updateData.attributes === 'object') {
      updateData.attributes = JSON.stringify(updateData.attributes)
    }

    const variant = await db.productVariant.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(variant)
  } catch (error) {
    console.error('Error updating variant:', error)
    return NextResponse.json({ error: 'Failed to update variant' }, { status: 500 })
  }
}

// DELETE - Delete product variant
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Variant ID is required' }, { status: 400 })
    }

    await db.productVariant.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting variant:', error)
    return NextResponse.json({ error: 'Failed to delete variant' }, { status: 500 })
  }
}

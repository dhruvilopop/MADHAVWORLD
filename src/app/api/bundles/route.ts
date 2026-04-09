import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomUUID } from 'crypto'

// GET - Fetch all bundles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active')

    const where: Record<string, unknown> = {}
    if (active === 'true') {
      where.isActive = true
    }

    const bundles = await db.productBundle.findMany({
      where,
      include: {
        items: {
          include: {
            Product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(bundles)
  } catch (error) {
    console.error('Error fetching bundles:', error)
    return NextResponse.json({ error: 'Failed to fetch bundles' }, { status: 500 })
  }
}

// POST - Create new bundle
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const bundle = await db.productBundle.create({
      data: {
        id: randomUUID(),
        name: data.name,
        slug,
        description: data.description || null,
        image: data.image || null,
        discount: data.discount || 0,
        isActive: data.isActive ?? true,
        updatedAt: new Date()
      }
    })

    // Add items if provided
    if (data.items && Array.isArray(data.items)) {
      for (const item of data.items) {
        await db.productBundleItem.create({
          data: {
            id: randomUUID(),
            bundleId: bundle.id,
            productId: item.productId,
            quantity: item.quantity || 1
          }
        })
      }
    }

    const fullBundle = await db.productBundle.findUnique({
      where: { id: bundle.id },
      include: { items: true }
    })

    return NextResponse.json(fullBundle, { status: 201 })
  } catch (error) {
    console.error('Error creating bundle:', error)
    return NextResponse.json({ error: 'Failed to create bundle' }, { status: 500 })
  }
}

// PUT - Update bundle
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, items, ...updateData } = data

    if (updateData.name) {
      updateData.slug = updateData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    }

    const bundle = await db.productBundle.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    })

    // Update items if provided
    if (items && Array.isArray(items)) {
      // Delete existing items
      await db.productBundleItem.deleteMany({
        where: { bundleId: id }
      })

      // Add new items
      for (const item of items) {
        await db.productBundleItem.create({
          data: {
            id: randomUUID(),
            bundleId: id,
            productId: item.productId,
            quantity: item.quantity || 1
          }
        })
      }
    }

    const fullBundle = await db.productBundle.findUnique({
      where: { id: bundle.id },
      include: { items: true }
    })

    return NextResponse.json(fullBundle)
  } catch (error) {
    console.error('Error updating bundle:', error)
    return NextResponse.json({ error: 'Failed to update bundle' }, { status: 500 })
  }
}

// DELETE - Delete bundle
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Bundle ID is required' }, { status: 400 })
    }

    // Delete items first
    await db.productBundleItem.deleteMany({
      where: { bundleId: id }
    })

    await db.productBundle.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting bundle:', error)
    return NextResponse.json({ error: 'Failed to delete bundle' }, { status: 500 })
  }
}
